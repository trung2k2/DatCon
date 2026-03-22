import React from 'react'

interface FileSelectorProps {
  datFile: string | null
  setDatFile: (path: string) => void
}

export default function FileSelector({ datFile, setDatFile }: FileSelectorProps) {
  const handleSelectDatFile = async () => {
    try {
      const selectedPath = await window.electron.ipcRenderer.invoke('select-dat-file')
      if (selectedPath) {
        setDatFile(selectedPath)
      }
    } catch (error: any) {
      alert('Cannot select DAT file: ' + error.message)
    }
  }

  return (
    <div className="file-selector">
      <h2>📂 Select DAT File</h2>
      <div className="input-group">
        <button className="file-label" onClick={handleSelectDatFile}>
          Choose .DAT file
        </button>
      </div>
      {datFile && (
        <div className="selected-file">
          <strong>Selected: </strong> {datFile}
        </div>
      )}
    </div>
  )
}
