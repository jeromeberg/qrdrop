export type ConnectionStatus =
  | 'idle'
  | 'awaiting-peer-id'
  | 'waiting-for-peer'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error'

export type PeerRole = 'host' | 'joiner'
