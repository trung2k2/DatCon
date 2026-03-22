import React from 'react'

interface AnalysisPanelProps {
  data: any
}

export default function AnalysisPanel({ data }: AnalysisPanelProps) {
  const totalRecords = Array.isArray(data.records)
    ? data.records.length
    : (typeof data.totalRecords === 'number' ? data.totalRecords : 0)

  return (
    <div className="analysis-panel">
      <h2>📊 Analysis Results</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Aircraft:</span>
          <span className="value">{data.acType}</span>
        </div>
        <div className="info-item">
          <span className="label">Total Records:</span>
          <span className="value">{totalRecords}</span>
        </div>
        <div className="info-item">
          <span className="label">Clock Rate:</span>
          <span className="value">{data.clockRate} Hz</span>
        </div>
        <div className="info-item">
          <span className="label">GPS Locked:</span>
          <span className="value">{data.gpsLocked ? '✓ Yes' : '✗ No'}</span>
        </div>
        <div className="info-item">
          <span className="label">Lowest Tick:</span>
          <span className="value">{data.lowestTick}</span>
        </div>
        <div className="info-item">
          <span className="label">Highest Tick:</span>
          <span className="value">{data.highestTick}</span>
        </div>
        <div className="info-item">
          <span className="label">Duration:</span>
          <span className="value">
            {((data.highestTick - data.lowestTick) / data.clockRate).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  )
}
