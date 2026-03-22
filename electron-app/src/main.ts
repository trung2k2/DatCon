import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { isDev } from './utils/dev'
import { createWindow } from './window'
import { registerHandlers } from './ipc/handlers'

let mainWindow: BrowserWindow | null

app.on('ready', () => {
  mainWindow = createWindow()
  registerHandlers()
  createMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [{ label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            console.log('DatCon Electron v3.5.0')
          }
        }
      ]
    }
  ]

  if (isDev()) {
    template.push({
      label: 'Dev',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    } as any)
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
