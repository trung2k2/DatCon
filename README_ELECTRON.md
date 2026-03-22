# DatCon - Electron Version

Modern cross-platform desktop application for analyzing DJI UAV DAT log files.

Converted from Java Swing to **Electron + React** for better accessibility and modern UI.

## 🎯 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Development
```bash
cd electron-app
npm install
npm run dev
```

### Build
```bash
cd electron-app
npm run dist:win   # Windows
npm run dist:mac   # macOS
npm run dist:linux # Linux
```

## ✨ Features

- ✈️ Support for multiple DJI aircraft (Phantom, Mavic, Inspire, M600, etc.)
- 🗺️ Export to KML for ground track and 3D profiles
- 📊 Export to CSV for data analysis
- 🔐 Automatic XOR decryption of DAT payloads
- 🗜️ Supports zlib-compressed files from DJI Assistant
- 🎨 Modern React UI with real-time analysis results
- 🌍 Cross-platform support (Windows, macOS, Linux)

## 📁 Project Structure

```
.
├── DatCon/              # Java reference implementation
├── electron-app/        # Electron + React application
│   ├── src/
│   │   ├── main.ts      # Electron process
│   │   ├── ipc/         # Inter-process communication
│   │   ├── backend/     # DAT parsing logic
│   │   └── renderer/    # React UI
│   └── package.json
├── .github/             # GitHub Actions + templates
├── CONTRIBUTING.md      # Contribution guidelines
└── README.md           # This file
```

## 🚀 Getting Started

### Clone and Setup
```bash
git clone https://github.com/your-repo/datcon.git
cd datcon
git config commit.template .gitmessage

# Setup development environment
./scripts/setup-dev.sh    # macOS/Linux
# or
scripts\setup-dev.bat     # Windows
```

### Create Feature Branch
```bash
git checkout -b feature/your-feature
# or for bugfix
git checkout -b fix/bug-description
```

### Work on Code
```bash
cd electron-app
npm run dev
```

### Commit
```bash
git add .
git commit  # Editor will use our commit template
```

## 📚 Documentation

- [Electron App README](./electron-app/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [DAT Format Specification](./docs/DAT_FORMAT.md) (coming soon)

## 🔄 Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Code your changes with `npm run dev`
4. Write/update tests
5. Run linter: `npm run lint`
6. Commit with conventional format (template provided)
7. Push to your fork
8. Create Pull Request

## 📦 Building for Distribution

```bash
# Build for current platform
npm run dist

# Build for specific platform
npm run dist:win   # Windows .exe
npm run dist:mac   # macOS .dmg
npm run dist:linux # Linux .AppImage
```

## 🐛 Found a Bug?

Please create an issue with:
1. Clear description of the problem
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment info (OS, version)

## 💡 Feature Ideas?

Suggest features via GitHub Discussions or Issues with:
1. Use case explanation
2. Proposed solution
3. Any alternatives you considered

## 📄 License

BSD 2-Clause License - See [LICENSE](./LICENSE.md)

## 🙏 Credits

- **Original Java Implementation**: DatCon Contributors
- **Electron Port**: DatCon Community
- **DAT Format Researchers**: UAV enthusiasts and reverse engineers

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Checklist

- [ ] Forked the repository
- [ ] Created feature branch
- [ ] Code follows style guide
- [ ] Added/updated tests
- [ ] All linters pass
- [ ] Commit messages follow template
- [ ] PR description is clear

## 📊 Version

**Current**: 3.5.0 (Electron Port)  
**Original Java**: 3.5.0

## 🔗 Links

- [DatCon Website](http://www.datfile.net/)
- [Issue Tracker](https://github.com/your-repo/issues)
- [Discussions](https://github.com/your-repo/discussions)
- [Releases](https://github.com/your-repo/releases)

---

**Ready to contribute?** Start with [CONTRIBUTING.md](./CONTRIBUTING.md) 🎉
