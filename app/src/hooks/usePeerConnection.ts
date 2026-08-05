import { useCallback, useEffect, useRef, useState } from 'react'
import { Peer, PeerErrorType, type DataConnection, type PeerError } from 'peerjs'
import type { ConnectionStatus, PeerRole } from '../types/connection'
import { generatePeerId } from '../utils/generatePeerId'

const MAX_ID_COLLISION_RETRIES = 5

interface UsePeerConnectionResult {
  role: PeerRole | null
  status: ConnectionStatus
  peerId: string | null
  remotePeerId: string | null
  errorMessage: string | null
  connection: DataConnection | null
  startHost: () => void
  joinPeer: (remotePeerId: string) => void
  disconnect: () => void
}

export function usePeerConnection(): UsePeerConnectionResult {
  const peerRef = useRef<Peer | null>(null)
  const connectionRef = useRef<DataConnection | null>(null)
  const roleRef = useRef<PeerRole | null>(null)

  const [role, setRole] = useState<PeerRole | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [peerId, setPeerId] = useState<string | null>(null)
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [connection, setConnection] = useState<DataConnection | null>(null)
  const isTearingDownRef = useRef(false)

  const teardown = useCallback(() => {
    isTearingDownRef.current = true
    connectionRef.current?.close()
    connectionRef.current = null
    peerRef.current?.removeAllListeners()
    peerRef.current?.destroy()
    peerRef.current = null
    isTearingDownRef.current = false
  }, [])

  useEffect(() => teardown, [teardown])

  const wireConnection = useCallback((conn: DataConnection) => {
    connectionRef.current = conn
    setRemotePeerId(conn.peer)
    setStatus('connecting')

    conn.on('open', () => {
      setStatus('connected')
      setConnection(conn)
    })
    conn.on('close', () => {
      setStatus('disconnected')
      setConnection(null)
      connectionRef.current = null
    })
    conn.on('error', (err: PeerError<string>) => {
      setErrorMessage(err.message)
      setStatus('error')
    })
  }, [])

  const wirePeer = useCallback(
    (peer: Peer, onError?: (err: PeerError<string>) => boolean) => {
      peer.on('open', (id) => {
        setPeerId(id)
        if (roleRef.current === 'host') {
          setStatus('waiting-for-peer')
        }
      })

      peer.on('connection', (conn) => {
        if (roleRef.current !== 'host') return
        if (connectionRef.current) {
          conn.close()
          return
        }
        wireConnection(conn)
      })

      peer.on('disconnected', () => {
        if (isTearingDownRef.current) return
        setStatus((prev) => (prev === 'connected' ? prev : 'reconnecting'))
        peer.reconnect()
      })

      peer.on('close', () => {
        setStatus('disconnected')
      })

      peer.on('error', (err: PeerError<string>) => {
        if (onError?.(err)) return
        setErrorMessage(err.message)
        setStatus('error')
      })
    },
    [wireConnection],
  )

  const startHost = useCallback(() => {
    teardown()
    roleRef.current = 'host'
    setRole('host')
    setStatus('awaiting-peer-id')
    setErrorMessage(null)

    const attempt = (retriesLeft: number) => {
      const peer = new Peer(generatePeerId())
      peerRef.current = peer
      wirePeer(peer, (err) => {
        if (err.type === PeerErrorType.UnavailableID && retriesLeft > 0) {
          peer.destroy()
          attempt(retriesLeft - 1)
          return true
        }
        return false
      })
    }

    attempt(MAX_ID_COLLISION_RETRIES)
  }, [teardown, wirePeer])

  const joinPeer = useCallback(
    (targetPeerId: string) => {
      teardown()
      roleRef.current = 'joiner'
      setRole('joiner')
      setStatus('awaiting-peer-id')
      setErrorMessage(null)

      const peer = new Peer()
      peerRef.current = peer
      wirePeer(peer)

      peer.on('open', () => {
        setStatus('connecting')
        const conn = peer.connect(targetPeerId, { reliable: true })
        wireConnection(conn)
      })
    },
    [teardown, wireConnection, wirePeer],
  )

  const disconnect = useCallback(() => {
    teardown()
    roleRef.current = null
    setRole(null)
    setStatus('idle')
    setPeerId(null)
    setRemotePeerId(null)
    setErrorMessage(null)
    setConnection(null)
  }, [teardown])

  return {
    role,
    status,
    peerId,
    remotePeerId,
    errorMessage,
    connection,
    startHost,
    joinPeer,
    disconnect,
  }
}
