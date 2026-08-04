import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ConnectionStatus } from '../types/connection'

interface JoinScreenProps {
  status: ConnectionStatus
  errorMessage: string | null
  onJoin: (peerId: string) => void
  onBack: () => void
}

export function JoinScreen({ status, errorMessage, onJoin, onBack }: JoinScreenProps) {
  const elementId = useId().replace(/:/g, '')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualId, setManualId] = useState('')
  const joined = useRef(false)

  const handleJoin = (peerId: string) => {
    if (joined.current) return
    const trimmed = peerId.trim().toUpperCase()
    if (!trimmed) return
    joined.current = true
    onJoin(trimmed)
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId)
    let stopRequested = false

    const stopScanner = () => {
      try {
        scanner.stop().catch(() => {})
      } catch {
        // Not scanning yet
      }
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 3, qrbox: 250 },
        (decodedText) => handleJoin(decodedText),
        undefined,
      )
      .then(() => {
        if (stopRequested) stopScanner()
      })
      .catch((err: unknown) => {
        setCameraError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      stopRequested = true
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const busy = status === 'connecting' || status === 'awaiting-peer-id'

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto', width: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', alignSelf: 'flex-start' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} color="inherit">
          Back
        </Button>
      </Stack>

      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Join a room
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Scan the host's QR code with your camera.
      </Typography>

      <Box
        id={elementId}
        sx={{ width: 280, maxWidth: '100%', borderRadius: 1, overflow: 'hidden' }}
      />

      {cameraError && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          Camera unavailable: ({cameraError}). Enter the ID manually below.
        </Alert>
      )}

      {busy && (
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

      <Divider sx={{ width: '100%' }}>or enter ID manually</Divider>

      <Stack
        component="form"
        direction="row"
        spacing={1}
        sx={{ width: '100%' }}
        onSubmit={(e) => {
          e.preventDefault()
          handleJoin(manualId)
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={!manualId.trim() || busy}>
          Connect
        </Button>
      </Stack>
    </Stack>
  )
}
