import { BrowserWindow, app } from 'electron'
import path from 'path'
import { isDev } from './utils/dev'

export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 950,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev()) {
    const devUrl = 'http://localhost:5173'
    const retryDelayMs = 400
    const maxAttempts = 30
    let attempts = 0

    const loadDevServer = () => {
      if (mainWindow.isDestroyed() || attempts >= maxAttempts) {
        return
      }

      attempts += 1
      mainWindow.loadURL(devUrl).then(() => {
        mainWindow.webContents.openDevTools()
      }).catch(() => {
        setTimeout(loadDevServer, retryDelayMs)
      })
    }

    loadDevServer()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
