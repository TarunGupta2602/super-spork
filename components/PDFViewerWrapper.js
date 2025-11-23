'use client'

import dynamic from 'next/dynamic'

// Dynamically import the PDF components as separate async components
const PDFViewerContent = dynamic(
  () => import('./PDFViewerContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="p-12 text-center border rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Initializing PDF viewer...</p>
      </div>
    )
  }
)

export default function PDFViewerWrapper(props) {
  return <PDFViewerContent {...props} />
}
