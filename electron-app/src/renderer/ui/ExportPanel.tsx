import React, { useState } from 'react'

interface ExportPanelProps {
  outputDir: string | null
  onSelectOutputDir: () => void
  onExportKML: (options: { type: 'groundtrack' | 'profile'; homePointElevationMeters?: number }) => void
  onExportCSV: () => void
}

export default function ExportPanel({ outputDir, onSelectOutputDir, onExportKML, onExportCSV }: ExportPanelProps) {
  const [kmlType, setKmlType] = useState<'groundtrack' | 'profile'>('groundtrack')
  const [homePointElevation, setHomePointElevation] = useState('')

  const parsedHomePointElevation = Number(homePointElevation)
  const isProfile = kmlType === 'profile'
  const isHomePointElevationValid = !isProfile || (homePointElevation.trim().length > 0 && Number.isFinite(parsedHomePointElevation))

  const handleExportKML = () => {
    if (!isHomePointElevationValid) {
      alert('Vui long nhap Home Point Elevation (meters) hop le cho Profile 3D.')
      return
    }

    onExportKML({
      type: kmlType,
      homePointElevationMeters: isProfile ? parsedHomePointElevation : undefined
    })
  }

  return (
    <div className="export-panel">
      <h2>💾 Export Options</h2>

      <div className="export-section">
        <h3>Output Folder</h3>
        <button className="btn" onClick={onSelectOutputDir}>
          Choose Output Folder
        </button>
        <p>{outputDir ? `Selected: ${outputDir}` : 'Using DAT file folder by default'}</p>
      </div>

      <div className="export-section">
        <h3>KML Export</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="groundtrack"
              checked={kmlType === 'groundtrack'}
              onChange={(e) => setKmlType(e.target.value as any)}
            />
            Ground Track
          </label>
          <label>
            <input
              type="radio"
              value="profile"
              checked={kmlType === 'profile'}
              onChange={(e) => setKmlType(e.target.value as any)}
            />
            Profile 3D
          </label>
        </div>

        {isProfile && (
          <div style={{ margin: '10px 0' }}>
            <label>
              Home Point Elevation (meters):
              <input
                type="number"
                step="0.1"
                placeholder="Vi du: 123.5"
                value={homePointElevation}
                onChange={(e) => setHomePointElevation(e.target.value)}
                style={{ marginLeft: '8px', width: '160px' }}
              />
            </label>
          </div>
        )}

        <button className="btn btn-success" onClick={handleExportKML}>
          Export to KML
        </button>
      </div>

      <div className="export-section">
        <h3>CSV Export</h3>
        <p>Export all records to CSV format for analysis</p>
        <button className="btn btn-info" onClick={onExportCSV}>
          Export to CSV
        </button>
      </div>
    </div>
  )
}
