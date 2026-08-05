import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ImageIcon from '@mui/icons-material/Image'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderZipIcon from '@mui/icons-material/FolderZip'
import DownloadIcon from '@mui/icons-material/Download'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import type { SharedFile } from '../types/transfer'
import { formatBytes, formatTimestamp } from '../utils/format'

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon color="action" />
  if (mimeType.startsWith('video/')) return <VideoFileIcon color="action" />
  if (mimeType.startsWith('audio/')) return <AudioFileIcon color="action" />
  if (mimeType === 'application/pdf') return <DescriptionIcon color="action" />
  if (/zip|compressed|tar|rar|7z/.test(mimeType)) return <FolderZipIcon color="action" />
  return <InsertDriveFileIcon color="action" />
}

interface FileListItemProps {
  file: SharedFile
  onDownload: (fileId: string) => void
}

export function FileListItem({ file, onDownload }: FileListItemProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <FileTypeIcon mimeType={file.mimeType} />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap title={file.name} sx={{ fontWeight: 500 }}>
          {file.name}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Typography variant="caption" color="textSecondary">
            {formatBytes(file.size)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatTimestamp(file.timestamp)}
          </Typography>
        </Stack>
        {file.status === 'transferring' && (
          <LinearProgress
            variant="determinate"
            value={file.progress * 100}
            sx={{ mt: 0.75, borderRadius: 1, height: 4 }}
          />
        )}
        {file.status === 'error' && (
          <Typography variant="caption" color="error">
            {file.error ?? 'Transfer failed'}
          </Typography>
        )}
      </Box>

      {file.status === 'error' && <ErrorOutlineIcon color="error" fontSize="small" />}
      {file.blob && (
        <Tooltip title="Save file">
          <IconButton size="small" onClick={() => onDownload(file.id)}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  )
}
