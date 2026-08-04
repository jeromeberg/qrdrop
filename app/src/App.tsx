import { useState } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { usePeerConnection } from './hooks/usePeerConnection'
import { useFileTransfer } from './hooks/useFileTransfer'
import { HostScreen } from './components/HostScreen'
import { JoinScreen } from './components/JoinScreen'
import { RoomView } from './components/RoomView'
import { WelcomeScreen } from './components/WelcomeScreen'

type Screen = 'welcome' | 'host' | 'join'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const peer = usePeerConnection()
  const { files, sendFiles, downloadFile } = useFileTransfer(peer.connection)

  const leaveRoom = () => {
    peer.disconnect()
    setScreen('welcome')
  }

  let content: React.ReactNode
  if (peer.status === 'connected') {
    content = (
      <RoomView
        status={peer.status}
        files={files}
        onSendFiles={sendFiles}
        onDownload={downloadFile}
        onLeave={leaveRoom}
      />
    )
  } else if (screen === 'host') {
    content = (
      <HostScreen
        status={peer.status}
        peerId={peer.peerId}
        errorMessage={peer.errorMessage}
        onStart={peer.startHost}
        onBack={leaveRoom}
      />
    )
  } else if (screen === 'join') {
    content = (
      <JoinScreen
        status={peer.status}
        errorMessage={peer.errorMessage}
        onJoin={peer.joinPeer}
        onBack={leaveRoom}
      />
    )
  } else {
    content = <WelcomeScreen onSelect={setScreen} />
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          justifyContent: 'center',
        }}
      >
        {content}
      </Box>

      <Typography variant="caption" color="text.secondary" align="center" sx={{ pt: 2 }}>
        Copyright 2026.{' '}Made by{' '}
        <Link href="https://github.com/jeromeberg" target="_blank" rel="noopener noreferrer" color="inherit">
          Jerome Berg
        </Link>.
      </Typography>
    </Box>
  )
}

export default App
