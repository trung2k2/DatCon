# DatCon Electron

Modern Electron + React desktop app for analyzing DJI UAV DAT log files.

Convert `.DAT` files to KML (mapping) and CSV (analysis) formats with ease.

## Features

- ✈️ Support for DJI Phantom 3, 4, Mavic, Inspire, M600, and more
- 🗺️ Ground track and 3D profile KML export
- 📊 CSV export for data analysis
- 🔐 XOR-decrypted payload parsing
- 🗜️ Zlib-compressed file support (DJI Assistant format)
- 🎨 Modern React UI with Zustand state management

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
cd electron-app
npm install
```

### Development Mode

```bash
npm run dev
```

This starts both the React dev server and Electron in parallel.

### Build

```bash
npm run build
npm run dist:win   # Windows
npm run dist:mac   # macOS
npm run dist:linux # Linux
```

## Project Structure

```
electron-app/
├── src/
│   ├── main.ts              # Electron main process
│   ├── window.ts            # Window creation
│   ├── preload.ts           # Context isolation bridge
│   ├── ipc/
│   │   └── handlers.ts      # IPC event handlers
│   ├── backend/
│   │   └── datParser.ts     # DAT parsing logic
│   └── renderer/
│       ├── main.tsx         # React entry
│       ├── App.tsx          # Root component
│       ├── index.html       # HTML template
│       └── ui/              # React components
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.json
```

## DAT File Format

### V3 Format (Modern Logs)

Record structure:
```
[0x55] [length] [0x00] [hdr_crc] [type:u16] [tickNo:u32] [payload...] [crc:u16]
```

- **XOR Decryption**: `key = tickNo % 256`
- **Clock Rate**: Varies by aircraft (typically 600 Hz)
- **Compression**: Files from DJI Assistant are zlib-compressed

## API Reference

### IPC Channels

#### `analyze-dat`
Analyze DAT file and extract metadata.
```typescript
const result = await window.electron.ipcRenderer.invoke('analyze-dat', filePath)
// Returns: { success: boolean, data: ParseResult | error: string }
```

#### `export-kml`
Export DAT file to KML format.
```typescript
const result = await window.electron.ipcRenderer.invoke('export-kml', filePath, options)
// options: { type: 'groundtrack' | 'profile' }
```

#### `export-csv`
Export DAT file to CSV format.
```typescript
const result = await window.electron.ipcRenderer.invoke('export-csv', filePath, options)
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

BSD 2-Clause License (see LICENSE in parent directory)

## Credits

- Original Java implementation: DatCon
- Electron port: DatCon Contributors
