import React, { useState } from 'react'
import FileSelector from './ui/FileSelector'
import AnalysisPanel from './ui/AnalysisPanel'
import ExportPanel from './ui/ExportPanel'
import './App.css'

export default function App() {
  const [datFile, setDatFile] = useState<string | null>(null)
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!datFile) return
    setLoading(true)
    try {
      const result = await window.electron.ipcRenderer.invoke('analyze-dat', datFile)
      if (result.success) {
        setAnalysis(result.data)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err: any) {
      alert('Error analyzing file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOutputDir = async () => {
    try {
      const selectedDir = await window.electron.ipcRenderer.invoke('select-output-dir')
      if (selectedDir) {
        setOutputDir(selectedDir)
      }
    } catch (err: any) {
      alert('Error selecting output folder: ' + err.message)
    }
  }

  const handleExportKML = async (options: { type: 'groundtrack' | 'profile'; homePointElevationMeters?: number }) => {
    if (!datFile || !analysis) return
    try {
      const result = await window.electron.ipcRenderer.invoke('export-kml', datFile, {
        type: options.type,
        outputDir,
        homePointElevationMeters: options.homePointElevationMeters
      })
      if (result.success) {
        alert('KML exported to: ' + result.path)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err: any) {
      alert('Export failed: ' + err.message)
    }
  }

  const handleExportCSV = async () => {
    if (!datFile || !analysis) return
    try {
      const result = await window.electron.ipcRenderer.invoke('export-csv', datFile, { outputDir })
      if (result.success) {
        alert('CSV exported to: ' + result.path)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err: any) {
      alert('Export failed: ' + err.message)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚁 DatCon</h1>
        <p>DJI DAT Log Analyzer - Convert to KML/CSV</p>
      </header>

      <main className="app-main">
        <section className="panel">
          <FileSelector datFile={datFile} setDatFile={setDatFile} />
        </section>

        <button
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          onClick={handleAnalyze}
          disabled={!datFile || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze DAT File'}
        </button>

        {analysis && (
          <>
            <section className="panel">
              <AnalysisPanel data={analysis} />
            </section>

            <section className="panel">
              <ExportPanel
                outputDir={outputDir}
                onSelectOutputDir={handleSelectOutputDir}
                onExportKML={handleExportKML}
                onExportCSV={handleExportCSV}
              />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
