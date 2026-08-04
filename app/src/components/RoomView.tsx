import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CircleIcon from '@mui/icons-material/Circle'
import { FileListItem } from './FileListItem'
import type { SharedFile } from '../types/transfer'
import type { ConnectionStatus } from '../types/connection'

interface RoomViewProps {
  status: ConnectionStatus
  files: SharedFile[]
  onSendFiles: (files: FileList | File[]) => void
  onDownload: (fileId: string) => void
  onLeave: () => void
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  connected: { label: 'Connected', color: 'success' },
  reconnecting: { label: 'Reconnecting…', color: 'warning' },
  disconnected: { label: 'Disconnected', color: 'error' },
  error: { label: 'Error', color: 'error' },
  connecting: { label: 'Connecting…', color: 'warning' },
  'waiting-for-peer': { label: 'Waiting…', color: 'warning' },
  'awaiting-peer-id': { label: 'Connecting…', color: 'warning' },
  idle: { label: 'Idle', color: 'default' },
}

export function RoomView({ status, files, onSendFiles, onDownload, onLeave }: RoomViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const statusConfig = STATUS_CONFIG[status]
  const sorted = [...files].sort((a, b) => b.timestamp - a.timestamp)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      onSendFiles(e.dataTransfer.files)
    }
  }

  return (
    <Stack
      spacing={2}
      sx={{ width: '100%', maxWidth: 640, mx: 'auto', height: '100%', minHeight: 0 }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Room
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            icon={<CircleIcon />}
            label={statusConfig.label}
            color={statusConfig.color}
            variant="outlined"
          />
          <Button size="small" color="inherit" onClick={onLeave}>
            Leave
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, borderRadius: 1, overflow: 'auto' }}>
        {sorted.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No files yet. Add or drop files below to send them.
            </Typography>
          </Box>
        ) : (
          sorted.map((file) => <FileListItem key={file.id} file={file} onDownload={onDownload} />)
        )}
      </Paper>

      <Paper
        variant="outlined"
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        sx={{
          p: 2.5,
          borderRadius: 1,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'transparent',
          textAlign: 'center',
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Drag files here
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Add files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onSendFiles(e.target.files)
              }
              e.target.value = ''
            }}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
