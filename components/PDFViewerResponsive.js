'use client'

import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

export default function PDFViewerResponsive({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [placingId, setPlacingId] = useState(null)
  const containerRef = useRef(null)
  const overlayRef = useRef(null)

  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  // Responsive: update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  // Click/tap to place signature (mouse and touch)
  const handleOverlayPointerDown = (e) => {
    if (!placingId || !overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    let clientX, clientY
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    const clickX = clientX - rect.left
    const clickY = clientY - rect.top
    // Convert to PDF document coordinates
    const docX = (clickX / rect.width) * 595
    const docY = (clickY / rect.height) * 842
    const sig = signatures.find(s => s.id === placingId)
    if (!sig) return
    const newX = Math.max(0, docX - (sig.width || 150) / 2)
    const newY = Math.max(0, docY - (sig.height || 60) / 2)
    onSignatureMove(placingId, { x: newX, y: newY, page: pageNumber - 1 })
    setPlacingId(null)
  }

  // Drag to move signature
  const handleSigMouseDown = (e, sigId, sig) => {
    if (placingId) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const currentX = sig.position?.x || 0
    const currentY = sig.position?.y || 0
    const rect = overlayRef.current.getBoundingClientRect()
    const scaleX = 595 / rect.width
    const scaleY = 842 / rect.height
    const handleMouseMove = (moveE) => {
      const deltaX = (moveE.clientX - startX) * scaleX
      const deltaY = (moveE.clientY - startY) * scaleY
      onSignatureMove(sigId, { x: Math.max(0, currentX + deltaX), y: Math.max(0, currentY + deltaY), page: pageNumber - 1 })
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Calculate scaled PDF size for responsiveness
  const maxWidth = Math.min(containerWidth || 600, 600)
  const scale = pageWidth ? maxWidth / pageWidth : 1
  const scaledWidth = pageWidth * scale
  const scaledHeight = pageHeight * scale

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '100vw', margin: '0 auto' }}>
      {/* Status Banner */}
      <div style={{ background: placingId ? '#dcfce7' : '#eff6ff', border: placingId ? '2px solid #22c55e' : '2px solid #3b82f6', borderRadius: 12, padding: 12, marginBottom: 12, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>{placingId ? '👆 Tap/click on the PDF to place signature' : '📍 Click "Place" button to position a signature'}</div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
        {pdfUrl && (
          <>
            <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div style={{ textAlign: 'center', padding: 40 }}>📄 Loading...</div>}>
              <Page
                pageNumber={pageNumber}
                width={maxWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={page => { setPageWidth(page.originalWidth); setPageHeight(page.originalHeight); }}
              />
            </Document>
            {/* Overlay for click-to-place and signatures */}
            <div
              ref={overlayRef}
              onClick={handleOverlayPointerDown}
              onTouchStart={handleOverlayPointerDown}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: scaledWidth,
                height: scaledHeight,
                cursor: placingId ? 'crosshair' : 'default',
                pointerEvents: placingId ? 'auto' : 'none',
                background: placingId ? 'rgba(34,197,94,0.05)' : 'transparent',
                border: placingId ? '2px dashed #22c55e' : 'none',
                borderRadius: 8,
                transition: 'all 0.2s',
                zIndex: 99,
                touchAction: 'manipulation',
              }}
            >
              {currentPageSigs.map(sig => {
                const scaleX = scaledWidth / 595
                const scaleY = scaledHeight / 842
                return (
                  <div
                    key={sig.id}
                    style={{
                      position: 'absolute',
                      left: (sig.position?.x || 0) * scaleX,
                      top: (sig.position?.y || 0) * scaleY,
                      width: (sig.width || 150) * scaleX,
                      height: (sig.height || 60) * scaleY,
                      border: '2px solid #3b82f6',
                      borderRadius: 4,
                      background: '#fff',
                      cursor: placingId ? 'not-allowed' : 'grab',
                      pointerEvents: 'auto',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                    }}
                    onMouseDown={e => handleSigMouseDown(e, sig.id, sig)}
                  >
                    <img src={sig.url} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                    <button
                      onClick={e => { e.stopPropagation(); onSignatureMove(sig.id, { deleted: true }) }}
                      style={{ position: 'absolute', top: -12, right: -12, width: 26, height: 26, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      {/* Page Navigation */}
      {numPages > 1 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => { setPageNumber(Math.max(1, pageNumber - 1)); setPlacingId(null) }} disabled={pageNumber <= 1} style={{ padding: '10px 20px', background: pageNumber <= 1 ? '#d1d5db' : '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>← Previous</button>
          <span style={{ fontSize: 16, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>{pageNumber} / {numPages}</span>
          <button onClick={() => { setPageNumber(Math.min(numPages, pageNumber + 1)); setPlacingId(null) }} disabled={pageNumber >= numPages} style={{ padding: '10px 20px', background: pageNumber >= numPages ? '#d1d5db' : '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Next →</button>
        </div>
      )}
      {/* Signature Placement Buttons */}
      {signatures.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 8 }}>📝 Click to place or adjust signatures:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {signatures.map(sig => (
              <button key={sig.id} onClick={() => setPlacingId(sig.id === placingId ? null : sig.id)} style={{ padding: '10px 18px', background: sig.id === placingId ? '#22c55e' : '#d1fae5', color: sig.id === placingId ? '#fff' : '#065f46', border: sig.id === placingId ? '2px solid #16a34a' : '2px solid #10b981', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>{sig.id === placingId ? '✓ READY' : '📍 Place'}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
