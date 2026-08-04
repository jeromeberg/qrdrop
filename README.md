# qrdrop

A peer-to-peer file sharing web app. Send files between two devices using WebRTC and QR codes.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

## Features

- Peer-to-peer file transfer over WebRTC
- Pairing via QR code or short ID
- No backend, no server storage

## Stack

- React
- Vite
- Material UI
- [PeerJS](https://peerjs.com/) — WebRTC signaling
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — camera scanning
- [qrcode.react](https://github.com/zpao/qrcode.react) — QR generation

## Implementation

- **Signaling:** PeerJS is used to exchange peer IDs and establish the WebRTC connection.
- **Protocol:** `manifest` → `chunk` → `file-complete` → `file-ack`.
- **Chunking:** Files are split into 16 KB chunks. Receiver buffers incoming chunks and the original file is reassembled at the end.
- **Flow control:** Sending is paused whenever buffer exceeds threshold (1 MB) and automatically resumes once the buffer has drained (256 KB).

## Instructions

### Quick start

```bash
npm install
npm run dev
```

⚠️ Camera access requires HTTPS. The dev server uses a self-signed certificate, so your browser will show a warning on first load.

### Commands

| Command           | Description      |
| ----------------- | ---------------- |
| `npm run dev`     | Start dev server |
| `npm run build`   | Build for prod   |
| `npm run preview` | Preview prod     |
| `npm run lint`    | Run ESLint       |
| `npm run format`  | Format           |
