export const CHUNK_SIZE = 16 * 1024

export const BUFFERED_AMOUNT_HIGH_WATERMARK = CHUNK_SIZE * 64 // 1MB
export const BUFFERED_AMOUNT_LOW_WATERMARK = CHUNK_SIZE * 16 // 256KB

export interface FileManifestEntry {
  fileId: string
  name: string
  size: number
  mimeType: string
  totalChunks: number
}

export type PeerMessage =
  | {
      type: 'manifest'
      transferId: string
      files: FileManifestEntry[]
    }
  | {
      type: 'chunk'
      transferId: string
      fileId: string
      chunkIndex: number
      data: ArrayBuffer
    }
  | {
      type: 'file-complete'
      transferId: string
      fileId: string
    }
  | {
      type: 'file-ack'
      transferId: string
      fileId: string
    }
  | {
      type: 'file-error'
      transferId: string
      fileId: string
      message: string
    }
