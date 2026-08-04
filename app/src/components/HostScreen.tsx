import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ConnectionStatus } from '../types/connection'
import { Divider } from '@mui/material'

interface HostScreenProps {
  status: ConnectionStatus
  peerId: string | null
  errorMessage: string | null
  onStart: () => void
  onBack: () => void
}

export function HostScreen({ status, peerId, errorMessage, onStart, onBack }: HostScreenProps) {
  useEffect(() => {
    onStart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto', width: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', alignSelf: 'flex-start' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} color="inherit">
          Back
        </Button>
      </Stack>

      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Create a new room
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Scan this code from the other device
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          width: 280,
          height: 280,
        }}
      >
        {peerId ? (
          <QRCodeSVG value={peerId} size={232} level="M" marginSize={1} bgColor="white" />
        ) : (
          <CircularProgress />
        )}
      </Paper>

      <Divider />

      {peerId && (
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Or enter ID manually
          </Typography>
          <Paper
            variant="outlined"
            sx={{ px: 2.5, py: 1, borderRadius: 1, bgcolor: 'action.hover' }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
              }}
            >
              {peerId}
            </Typography>
          </Paper>
        </Stack>
      )}

      {status === 'waiting-for-peer' && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Waiting for a peer to connect...
          </Typography>
        </Stack>
      )}

      {status === 'connecting' && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Connecting...
          </Typography>
        </Stack>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage ?? 'Something went wrong.'}
        </Alert>
      )}
    </Stack>
  )
}
