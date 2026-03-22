@echo off
REM Setup script for DatCon Electron development (Windows)

echo 🚀 Setting up DatCon Electron development environment...

REM Configure git commit template
git config commit.template .gitmessage

echo.
echo 📝 To create a feature branch, use:
echo   git checkout -b feature/your-feature-name
echo.
echo 📝 To create a bugfix branch, use:
echo   git checkout -b fix/issue-description
echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo   1. cd electron-app
echo   2. npm install
echo   3. npm run dev
