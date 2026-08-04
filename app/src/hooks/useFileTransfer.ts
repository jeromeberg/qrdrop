import { useCallback, useEffect, useRef, useState } from 'react'
import type { DataConnection } from 'peerjs'
import {
  BUFFERED_AMOUNT_HIGH_WATERMARK,
  BUFFERED_AMOUNT_LOW_WATERMARK,
  CHUNK_SIZE,
  type FileManifestEntry,
  type PeerMessage,
} from '../types/protocol'
import type { SharedFile } from '../types/transfer'

interface ReceiveBuffer {
  entry: FileManifestEntry
  chunks: ArrayBuffer[]
  receivedChunks: number
}

interface UseFileTransferResult {
  files: SharedFile[]
  sendFiles: (fileList: FileList | File[]) => void
  downloadFile: (fileId: string) => Promise<void>
}

function waitForBufferedAmountLow(dataChannel: RTCDataChannel): Promise<void> {
  if (dataChannel.bufferedAmount <= BUFFERED_AMOUNT_LOW_WATERMARK) {
    return Promise.resolve()
  }
  dataChannel.bufferedAmountLowThreshold = BUFFERED_AMOUNT_LOW_WATERMARK
  return new Promise((resolve) => {
    const handleLow = () => {
      dataChannel.removeEventListener('bufferedamountlow', handleLow)
      resolve()
    }
    dataChannel.addEventListener('bufferedamountlow', handleLow)
  })
}

export function useFileTransfer(connection: DataConnection | null): UseFileTransferResult {
  const [files, setFiles] = useState<SharedFile[]>([])
  const receiveBuffers = useRef(new Map<string, ReceiveBuffer>())

  const updateFile = useCallback((fileId: string, patch: Partial<SharedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...patch } : f)))
  }, [])

  useEffect(() => {
    if (!connection) return

    const handleData = (data: unknown) => {
      const message = data as PeerMessage

      switch (message.type) {
        case 'manifest': {
          const incoming: SharedFile[] = message.files.map((entry) => ({
            id: entry.fileId,
            transferId: message.transferId,
            name: entry.name,
            size: entry.size,
            mimeType: entry.mimeType,
            direction: 'received',
            status: 'transferring',
            progress: 0,
            timestamp: Date.now(),
          }))
          for (const entry of message.files) {
            receiveBuffers.current.set(entry.fileId, {
              entry,
              chunks: [],
              receivedChunks: 0,
            })
          }
          setFiles((prev) => [...prev, ...incoming])
          break
        }

        case 'chunk': {
          const buffer = receiveBuffers.current.get(message.fileId)
          if (!buffer) break
          buffer.chunks[message.chunkIndex] = message.data
          buffer.receivedChunks += 1
          updateFile(message.fileId, {
            progress: buffer.receivedChunks / buffer.entry.totalChunks,
          })
          break
        }

        case 'file-complete': {
          const buffer = receiveBuffers.current.get(message.fileId)
          if (!buffer) break
          const blob = new Blob(buffer.chunks, { type: buffer.entry.mimeType })
          receiveBuffers.current.delete(message.fileId)
          updateFile(message.fileId, { status: 'done', progress: 1, blob })
          connection.send({
            type: 'file-ack',
            transferId: message.transferId,
            fileId: message.fileId,
          } satisfies PeerMessage)
          break
        }

        case 'file-ack': {
          updateFile(message.fileId, { status: 'done', progress: 1 })
          break
        }

        case 'file-error': {
          receiveBuffers.current.delete(message.fileId)
          updateFile(message.fileId, { status: 'error', error: message.message })
          break
        }
      }
    }

    const handleClose = () => {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'transferring' || f.status === 'pending'
            ? { ...f, status: 'error', error: 'Connection lost' }
            : f,
        ),
      )
    }

    connection.on('data', handleData)
    connection.on('close', handleClose)
    return () => {
      connection.off('data', handleData)
      connection.off('close', handleClose)
    }
  }, [connection, updateFile])

  const sendFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!connection) return
      const fileArray = Array.from(fileList)
      const transferId = crypto.randomUUID()

      const entries: FileManifestEntry[] = fileArray.map((file) => ({
        fileId: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        totalChunks: Math.max(1, Math.ceil(file.size / CHUNK_SIZE)),
      }))

      const newRows: SharedFile[] = entries.map((entry) => ({
        id: entry.fileId,
        transferId,
        name: entry.name,
        size: entry.size,
        mimeType: entry.mimeType,
        direction: 'sent',
        status: 'transferring',
        progress: 0,
        timestamp: Date.now(),
      }))
      setFiles((prev) => [...prev, ...newRows])

      connection.send({
        type: 'manifest',
        transferId,
        files: entries,
      } satisfies PeerMessage)

      entries.forEach((entry, index) => {
        void sendOneFile(connection, transferId, entry, fileArray[index], updateFile)
      })
    },
    [connection, updateFile],
  )

  const downloadFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (!file?.blob) return

      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({ suggestedName: file.name })
          const writable = await handle.createWritable()
          await writable.write(file.blob)
          await writable.close()
          return
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
        }
      }

      const url = URL.createObjectURL(file.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    },
    [files],
  )

  return { files, sendFiles, downloadFile }
}

async function sendOneFile(
  connection: DataConnection,
  transferId: string,
  entry: FileManifestEntry,
  file: File,
  updateFile: (fileId: string, patch: Partial<SharedFile>) => void,
): Promise<void> {
  try {
    for (let chunkIndex = 0; chunkIndex < entry.totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const data = await file.slice(start, start + CHUNK_SIZE).arrayBuffer()

      if (connection.dataChannel.bufferedAmount > BUFFERED_AMOUNT_HIGH_WATERMARK) {
        await waitForBufferedAmountLow(connection.dataChannel)
      }

      connection.send({
        type: 'chunk',
        transferId,
        fileId: entry.fileId,
        chunkIndex,
        data,
      } satisfies PeerMessage)

      updateFile(entry.fileId, { progress: (chunkIndex + 1) / entry.totalChunks })
    }

    connection.send({
      type: 'file-complete',
      transferId,
      fileId: entry.fileId,
    } satisfies PeerMessage)
  } catch {
    try {
      connection.send({
        type: 'file-error',
        transferId,
        fileId: entry.fileId,
        message: 'Send failed',
      } satisfies PeerMessage)
    } catch {
      // catch
    }
    updateFile(entry.fileId, { status: 'error', error: 'Send failed' })
  }
}
