import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import WifiTetheringIcon from '@mui/icons-material/WifiTethering'

interface WelcomeScreenProps {
  onSelect: (screen: 'host' | 'join') => void
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <Stack spacing={6} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto', width: '100%' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          qrdrop
        </Typography>
        <Typography color="textSecondary">
          Share files directly between two devices with a QR code. No account, no server storage.
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ width: '100%' }}>
        <Button
          size="large"
          variant="contained"
          startIcon={<WifiTetheringIcon />}
          onClick={() => onSelect('host')}
        >
          Create a new room
        </Button>
        <Button
          size="large"
          variant="outlined"
          startIcon={<QrCodeScannerIcon />}
          onClick={() => onSelect('join')}
        >
          Join room
        </Button>
      </Stack>
    </Stack>
  )
}
