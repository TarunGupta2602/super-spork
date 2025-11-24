'use client'

import { useRef, useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Trash2, Move } from 'lucide-react'

export default function PDFViewerContent({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState(null)
  const pageContainerRef = useRef(null)
  const [draggedSig, setDraggedSig] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pageScale, setPageScale] = useState(1)
  const [placementMode, setPlacementMode] = useState(null) // null or signature ID
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0, sigStartX: 0, sigStartY: 0 })

  // Configure pdfjs worker to use the local copy in /public
  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  // Filter signatures for current page
  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  // Get coordinates from mouse or touch event
  const getCoords = (e) => {
    if (!pageContainerRef.current) return null
    const rect = pageContainerRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  // Handle click to place signature
  const handlePageClick = (e) => {
    if (!placementMode || !pageContainerRef.current) return
    
    e.preventDefault()
    e.stopPropagation()

    const coords = getCoords(e)
    if (!coords) return

    const sig = signatures.find(s => s.id === placementMode)
    if (!sig) return

    // Convert pixel coordinates to document coordinates
    const x = coords.x / pageScale
    const y = coords.y / pageScale

    // Update signature position
    onSignatureMove(placementMode, {
      x: x - (sig.width || 150) / 2, // Center on click
      y: y - (sig.height || 60) / 2,
      page: pageNumber - 1,
    })

    // Exit placement mode
    setPlacementMode(null)
  }

  const handleSignatureDown = (e, sigId) => {
    e.preventDefault()
    e.stopPropagation()

    const sig = signatures.find(s => s.id === sigId)
    if (!sig) return

    const coords = getCoords(e)
    if (!coords) return

    const sigX = (sig.position.x || 0) * pageScale
    const sigY = (sig.position.y || 0) * pageScale

    dragStateRef.current = {
      isDragging: true,
      startX: coords.x,
      startY: coords.y,
      sigStartX: sigX,
      sigStartY: sigY,
    }

    setDraggedSig(sigId)
    setDragStart({ x: coords.x, y: coords.y })
  }

  // Handle dragging
  useEffect(() => {
    if (!dragStateRef.current.isDragging) return

    const handleMove = (e) => {
      e.preventDefault()
      const coords = getCoords(e)
      if (!coords || !draggedSig || !pageContainerRef.current) return

      const deltaX = coords.x - dragStateRef.current.startX
      const deltaY = coords.y - dragStateRef.current.startY

      const newX = dragStateRef.current.sigStartX + deltaX
      const newY = dragStateRef.current.sigStartY + deltaY

      const rect = pageContainerRef.current.getBoundingClientRect()
      const clampedX = Math.max(0, Math.min(newX, rect.width - 60) / pageScale)
      const clampedY = Math.max(0, Math.min(newY, rect.height - 30) / pageScale)

      onSignatureMove(draggedSig, {
        x: clampedX,
        y: clampedY,
        page: pageNumber - 1,
      })
    }

    const handleUp = (e) => {
      e.preventDefault()
      dragStateRef.current.isDragging = false
      setDraggedSig(null)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
    }

    document.addEventListener('mousemove', handleMove, { passive: false })
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleUp, { passive: false })
    document.addEventListener('touchend', handleUp, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
    }
  }, [draggedSig, pageNumber, pageScale, onSignatureMove])

  useEffect(() => {
    if (!pdfUrl) {
      setLoadError('No PDF uploaded yet.')
      return
    }
    if (typeof pdfUrl !== 'string' || !pdfUrl.startsWith('http')) {
      setLoadError('Invalid PDF URL format.')
      return
    }
    setLoadError(null)
  }, [pdfUrl])

  if (loadError) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 text-red-700">
        <h3 className="font-semibold">Error Loading PDF</h3>
        <p>{loadError}</p>
      </div>
    )
  }

  return (
    <div className="relative border rounded-lg overflow-hidden shadow-xl max-w-4xl mx-auto bg-gray-50" style={{ maxWidth: '100vw' }}>
      <div className="relative w-full" style={{ minHeight: '300px', maxWidth: '100vw', overflow: 'visible' }}>
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
              setLoadError(null)
            }}
            onLoadError={(error) => {
              console.error('PDF load failed:', error)
              setLoadError('Failed to load PDF. Please check the file and try again.')
            }}
            loading={
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading PDF...</p>
              </div>
            }
          >
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minWidth: 0 }}>
              <div style={{ position: 'relative', display: 'inline-block' }} ref={pageContainerRef}>
                <Page
                  pageNumber={pageNumber}
                  scale={typeof window !== 'undefined' && window.innerWidth < 600 ? 0.7 : 1.5}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={(page) => {
                    if (page && page.originalWidth) {
                      setPageScale(page.width / page.originalWidth)
                    }
                  }}
                  onRenderError={(error) => console.error('Page render error:', error)}
                />

                {/* Signature Overlay Container */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 20,
                    touchAction: draggedSig ? 'none' : 'auto',
                    pointerEvents: 'auto',
                    cursor: placementMode ? 'crosshair' : 'auto',
                    backgroundColor: placementMode ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  }}
                  onClick={handlePageClick}
                >
                  {currentPageSigs.map((sig) => {
                    const leftPx = (sig.position.x || 0) * pageScale
                    const topPx = (sig.position.y || 0) * pageScale
                    const widthPx = (sig.width || 150) * pageScale
                    const heightPx = (sig.height || 60) * pageScale
                    const isCurrentlyDragged = draggedSig === sig.id
                    const isInPlacementMode = placementMode === sig.id

                    return (
                      <div
                        key={sig.id}
                        style={{
                          position: 'absolute',
                          left: `${leftPx}px`,
                          top: `${topPx}px`,
                          width: `${widthPx}px`,
                          height: `${heightPx}px`,
                          minWidth: '60px',
                          minHeight: '30px',
                          border: isCurrentlyDragged ? '3px solid #3b82f6' : isInPlacementMode ? '3px dashed #10b981' : '2px solid #93c5fd',
                          borderRadius: '8px',
                          backgroundColor: isInPlacementMode ? 'rgba(16, 185, 129, 0.1)' : 'white',
                          boxShadow: isCurrentlyDragged
                            ? '0 0 0 4px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)'
                            : isInPlacementMode ? '0 0 0 4px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          cursor: isCurrentlyDragged ? 'grabbing' : 'grab',
                          zIndex: isCurrentlyDragged ? 40 : 30,
                          transition: isCurrentlyDragged ? 'none' : 'all 0.2s ease',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseDown={(e) => !isInPlacementMode && handleSignatureDown(e, sig.id)}
                        onTouchStart={(e) => !isInPlacementMode && handleSignatureDown(e, sig.id)}
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
                            draggable: false,
                          }}
                        />

                        {/* Drag Indicator or Placement Mode */}
                        {isCurrentlyDragged && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '8px',
                            }}
                          >
                            <Move style={{ width: '16px', height: '16px', color: '#3b82f6', opacity: 0.7 }} />
                          </div>
                        )}
                        {isInPlacementMode && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              borderRadius: '8px',
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>PLACE</span>
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          style={{
                            position: 'absolute',
                            top: '-32px',
                            right: '0px',
                            padding: '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            minWidth: '36px',
                            minHeight: '36px',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          }}
                          onMouseEnter={(e) => (e.target.style.opacity = '1')}
                          onMouseLeave={(e) => (e.target.style.opacity = '0')}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onSignatureMove(sig.id, { deleted: true })
                          }}
                        >
                          <Trash2 style={{ width: '20px', height: '20px' }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Document>
        )}
      </div>

      {/* Placement Mode Controls */}
      {placementMode && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
            👆 Click on the PDF to place the signature
          </span>
          <button
            onClick={() => setPlacementMode(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Signature Placement Buttons */}
      {currentPageSigs.length > 0 && !placementMode && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '12px',
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', width: '100%', textAlign: 'center', marginBottom: '8px' }}>
            Place signatures:
          </span>
          {currentPageSigs.map((sig) => (
            <button
              key={`place-${sig.id}`}
              onClick={() => setPlacementMode(sig.id)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
                hover: { backgroundColor: '#059669' },
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
            >
              Place #{sig.id.toString().slice(-4)}
            </button>
          ))}
        </div>
      )}

      {/* Page Navigation */}
      {numPages > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px', backgroundColor: '#f3f4f6', padding: '12px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} className="sm:flex-row">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              opacity: pageNumber <= 1 ? 0.5 : 1,
              minWidth: '100px',
              border: 'none',
            }}
          >
            Previous
          </button>
          <span style={{ fontWeight: '500', color: '#374151', fontSize: '16px' }}>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
              opacity: pageNumber >= numPages ? 0.5 : 1,
              minWidth: '100px',
              border: 'none',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
