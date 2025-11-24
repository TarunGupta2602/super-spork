'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

export default function PDFViewerEasy({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageScale, setPageScale] = useState(1)
  const [dragging, setDragging] = useState(null)

  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  const handleSigMouseDown = (e, sigId, sig) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragging({
      id: sigId,
      startX: e.clientX,
      startY: e.clientY,
      sigX: sig.position?.x || 0,
      sigY: sig.position?.y || 0,
    })
  }

  const handleMouseMove = (e) => {
    if (!dragging) return

    const deltaX = e.clientX - dragging.startX
    const deltaY = e.clientY - dragging.startY

    const newX = dragging.sigX + deltaX / pageScale
    const newY = dragging.sigY + deltaY / pageScale

    onSignatureMove(dragging.id, {
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      page: pageNumber - 1,
    })
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ width: '100%', userSelect: 'none' }}
    >
      {/* PDF Viewer Container */}
      <div
        style={{
          border: '4px solid #1d4ed8',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          padding: '24px',
          minHeight: '600px',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div style={{ textAlign: 'center', padding: '60px', fontSize: '18px' }}>📄 Loading PDF...</div>}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Page
                  pageNumber={pageNumber}
                  scale={1.5}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={(page) => {
                    if (page?.width && page?.originalWidth) {
                      setPageScale(page.width / page.originalWidth)
                    }
                  }}
                />

                {/* Signatures Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {currentPageSigs.map((sig) => (
                    <div
                      key={sig.id}
                      style={{
                        position: 'absolute',
                        left: `${(sig.position?.x || 0) * pageScale}px`,
                        top: `${(sig.position?.y || 0) * pageScale}px`,
                        width: `${(sig.width || 150) * pageScale}px`,
                        height: `${(sig.height || 60) * pageScale}px`,
                        border: dragging?.id === sig.id ? '3px solid #dc2626' : '2px solid #3b82f6',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        cursor: dragging?.id === sig.id ? 'grabbing' : 'grab',
                        pointerEvents: 'auto',
                        boxShadow: dragging?.id === sig.id ? '0 0 12px rgba(220, 38, 38, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden',
                      }}
                      onMouseDown={(e) => handleSigMouseDown(e, sig.id, sig)}
                      onTouchStart={(e) => {
                        const touch = e.touches[0]
                        e.preventDefault()
                        setDragging({
                          id: sig.id,
                          startX: touch.clientX,
                          startY: touch.clientY,
                          sigX: sig.position?.x || 0,
                          sigY: sig.position?.y || 0,
                        })
                      }}
                    >
                      <img
                        src={sig.url}
                        alt="Signature"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      />

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSignatureMove(sig.id, { deleted: true })
                        }}
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '-12px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          pointerEvents: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Document>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '16px' }}>
            📄 No PDF uploaded yet
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{
              padding: '12px 24px',
              backgroundColor: pageNumber <= 1 ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', minWidth: '120px', textAlign: 'center' }}>
            Page {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              padding: '12px 24px',
              backgroundColor: pageNumber >= numPages ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#fef08a',
        border: '3px solid #eab308',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#713f12',
      }}>
        👆 GRAB the blue signature box and DRAG it to move • RED X to delete
      </div>
    </div>
  )
}
