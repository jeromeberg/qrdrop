export type TransferDirection = 'sent' | 'received'

export type TransferStatus = 'pending' | 'transferring' | 'done' | 'error' | 'cancelled'

export interface SharedFile {
  id: string
  transferId: string
  name: string
  size: number
  mimeType: string
  direction: TransferDirection
  status: TransferStatus
  progress: number // 0-1
  timestamp: number
  blob?: Blob
  savedToDisk?: boolean
  error?: string
}
