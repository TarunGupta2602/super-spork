'use client'

import { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

export default function PDFViewerInteractive({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)
  const [placingId, setPlacingId] = useState(null)
  const overlayRef = useRef(null)

  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  // Handle clicking on overlay
  const handleOverlayClick = (e) => {
    if (!placingId || !overlayRef.current) return

    const rect = overlayRef.current.getBoundingClientRect()
    const clickPixelX = e.clientX - rect.left
    const clickPixelY = e.clientY - rect.top

    // Convert to document coordinates (assuming standard A4 dimensions)
    const docX = (clickPixelX / rect.width) * 595 // A4 width in points
    const docY = (clickPixelY / rect.height) * 842 // A4 height in points

    const sig = signatures.find(s => s.id === placingId)
    if (!sig) return

    const newX = Math.max(0, docX - (sig.width || 150) / 2)
    const newY = Math.max(0, docY - (sig.height || 60) / 2)

    onSignatureMove(placingId, {
      x: newX,
      y: newY,
      page: pageNumber - 1,
    })

    setPlacingId(null)
  }

  // Handle dragging signatures
  const handleSigMouseDown = (e, sigId, sig) => {
    if (placingId) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const currentX = sig.position?.x || 0
    const currentY = sig.position?.y || 0

    if (!overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    const scaleX = 595 / rect.width
    const scaleY = 842 / rect.height

    const handleMouseMove = (moveE) => {
      const deltaX = (moveE.clientX - startX) * scaleX
      const deltaY = (moveE.clientY - startY) * scaleY

      onSignatureMove(sigId, {
        x: Math.max(0, currentX + deltaX),
        y: Math.max(0, currentY + deltaY),
        page: pageNumber - 1,
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Status Banner */}
      <div
        style={{
          backgroundColor: placingId ? '#dcfce7' : '#eff6ff',
          border: placingId ? '3px solid #22c55e' : '3px solid #3b82f6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '700',
          transition: 'all 0.3s ease',
        }}
      >
        {placingId ? (
          <span style={{ color: '#15803d' }}>👆 CLICK on the PDF to place signature here</span>
        ) : (
          <span style={{ color: '#1e40af' }}>📍 Click "Place" button to position a signature</span>
        )}
      </div>

      {/* PDF Container with Overlay */}
      <div
        style={{
          border: placingId ? '4px solid #22c55e' : '4px solid #1d4ed8',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          padding: '20px',
          minHeight: '650px',
          overflow: 'auto',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {pdfUrl ? (
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {/* PDF Document */}
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div style={{ textAlign: 'center', padding: '60px' }}>📄 Loading...</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={1.5}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  if (page?.width && page?.originalWidth) {
                    setPageWidth(page.width)
                    setPageHeight(page.height)
                  }
                }}
              />
            </Document>

            {/* Interactive Overlay */}
            <div
              ref={overlayRef}
              onClick={handleOverlayClick}
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: pageWidth ? `${pageWidth}px` : 'auto',
                height: pageHeight ? `${pageHeight}px` : 'auto',
                cursor: placingId ? 'crosshair' : 'default',
                pointerEvents: placingId ? 'auto' : 'none',
                backgroundColor: placingId ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                border: placingId ? '2px dashed #22c55e' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Signature Boxes */}
              {currentPageSigs.map((sig) => {
                const scaleX = pageWidth / 595
                const scaleY = pageHeight / 842

                return (
                  <div
                    key={sig.id}
                    style={{
                      position: 'absolute',
                      left: `${(sig.position?.x || 0) * scaleX}px`,
                      top: `${(sig.position?.y || 0) * scaleY}px`,
                      width: `${(sig.width || 150) * scaleX}px`,
                      height: `${(sig.height || 60) * scaleY}px`,
                      border: '2px solid #3b82f6',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: placingId ? 'not-allowed' : 'grab',
                      pointerEvents: 'auto',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden',
                    }}
                    onMouseDown={(e) => handleSigMouseDown(e, sig.id, sig)}
                  >
                    <img
                      src={sig.url}
                      alt="Signature"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
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
                        width: '26px',
                        height: '26px',
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
                      }}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
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
            onClick={() => {
              setPageNumber(Math.max(1, pageNumber - 1))
              setPlacingId(null)
            }}
            disabled={pageNumber <= 1}
            style={{
              padding: '10px 20px',
              backgroundColor: pageNumber <= 1 ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => {
              setPageNumber(Math.min(numPages, pageNumber + 1))
              setPlacingId(null)
            }}
            disabled={pageNumber >= numPages}
            style={{
              padding: '10px 20px',
              backgroundColor: pageNumber >= numPages ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Signature Placement Buttons */}
      {signatures.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
            📝 Click to place or adjust signatures:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {signatures.map((sig) => (
              <button
                key={sig.id}
                onClick={() => setPlacingId(sig.id === placingId ? null : sig.id)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: sig.id === placingId ? '#22c55e' : '#d1fae5',
                  color: sig.id === placingId ? 'white' : '#065f46',
                  border: sig.id === placingId ? '2px solid #16a34a' : '2px solid #10b981',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                {sig.id === placingId ? '✓ READY' : '📍 Place'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
