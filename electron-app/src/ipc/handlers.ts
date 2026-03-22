import { dialog, ipcMain } from 'electron'
import { analyzeDatFile, exportToKML, exportToCSV } from '../backend/datParser'

export function registerHandlers() {
  // File selection
  ipcMain.handle('select-dat-file', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select DAT file',
      properties: ['openFile'],
      filters: [{ name: 'DAT files', extensions: ['dat', 'DAT'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('select-output-dir', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select output folder',
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  // DAT analysis
  ipcMain.handle('analyze-dat', async (event, filePath: string) => {
    try {
      const results = await analyzeDatFile(filePath)
      return { success: true, data: results }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Export
  ipcMain.handle('export-kml', async (event, datPath: string, options: any) => {
    try {
      const result = await exportToKML(datPath, options)
      return { success: true, path: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('export-csv', async (event, datPath: string, options: any) => {
    try {
      const result = await exportToCSV(datPath, options)
      return { success: true, path: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
