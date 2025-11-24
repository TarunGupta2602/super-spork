'use client'

import dynamic from 'next/dynamic'

// Dynamically import the new easy mode PDF viewer
const PDFViewerEasy = dynamic(
  () => import('./PDFViewerEasy'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '4px solid #dbeafe', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '12px', color: '#6b7280' }}>Initializing PDF viewer...</p>
      </div>
    )
  }
)

export default function PDFViewerWrapper(props) {
  return <PDFViewerEasy {...props} />
}
