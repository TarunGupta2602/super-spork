'use client'

import { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

export default function PDFViewerEasy({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageScale, setPageScale] = useState(1)
  const pageContainerRef = useRef(null)
  const [dragging, setDragging] = useState(null)

  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  const handleMouseDown = (e, sigId, sig) => {
    e.preventDefault()
    e.stopPropagation()

    const elem = e.currentTarget
    const rect = elem.getBoundingClientRect()

    setDragging({
      sigId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: (sig.position?.x || 0),
      currentY: (sig.position?.y || 0),
    })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !pageContainerRef.current || pageScale === 0) return

    const container = pageContainerRef.current
    const rect = container.getBoundingClientRect()

    // Calculate how much the mouse moved in pixels
    const movedX = e.clientX - dragging.startX
    const movedY = e.clientY - dragging.startY

    // Convert pixel movement to document coordinates
    const docMovedX = movedX / pageScale
    const docMovedY = movedY / pageScale

    // Calculate new position
    const newX = Math.max(0, dragging.currentX + docMovedX)
    const newY = Math.max(0, dragging.currentY + docMovedY)

    // Update the parent state
    onSignatureMove(dragging.sigId, {
      x: newX,
      y: newY,
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
      style={{
        width: '100%',
        userSelect: 'none',
      }}
    >
      {/* PDF Viewer Container */}
      <div
        ref={pageContainerRef}
        style={{
          border: '4px solid #1d4ed8',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          padding: '20px',
          minHeight: '600px',
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div style={{ textAlign: 'center', padding: '60px' }}>📄 Loading PDF...</div>}
          >
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

              {/* Signature Boxes Layer */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {currentPageSigs.map((sig) => {
                  const x = (sig.position?.x || 0) * pageScale
                  const y = (sig.position?.y || 0) * pageScale
                  const w = (sig.width || 150) * pageScale
                  const h = (sig.height || 60) * pageScale
                  const isDragging = dragging?.sigId === sig.id

                  return (
                    <div
                      key={sig.id}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${w}px`,
                        height: `${h}px`,
                        border: isDragging ? '4px solid #dc2626' : '2px solid #3b82f6',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        pointerEvents: 'auto',
                        boxShadow: isDragging ? '0 0 15px rgba(220, 38, 38, 0.7)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden',
                        transition: isDragging ? 'none' : 'box-shadow 0.15s ease',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, sig.id, sig)}
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
                      {!isDragging && (
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
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Document>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            📄 No PDF uploaded
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
              padding: '10px 20px',
              backgroundColor: pageNumber <= 1 ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', minWidth: '120px', textAlign: 'center' }}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              padding: '10px 20px',
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
        marginTop: '16px',
        padding: '14px 18px',
        backgroundColor: '#fef08a',
        border: '3px solid #eab308',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '15px',
        fontWeight: '700',
        color: '#713f12',
      }}>
        👆 CLICK on blue signature box and DRAG it anywhere • X to delete
      </div>
    </div>
  )
}
