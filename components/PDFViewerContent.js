'use client'

import { useRef, useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Trash2 } from 'lucide-react'

export default function PDFViewerContent({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState(null)
  const containerRef = useRef(null)
  const pageRef = useRef(null)
  const [draggedSig, setDraggedSig] = useState(null)
  const [activePointerId, setActivePointerId] = useState(null)
  const [pageScale, setPageScale] = useState(1)

  // Configure pdfjs worker to use the local copy in /public
  if (typeof window !== 'undefined' && pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  }

  // Filter signatures for current page
  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  // Use pointer events so dragging works with mouse, touch, and pen on mobile
  const handleSignaturePointerDown = (e, sigId) => {
    e.preventDefault()
    e.stopPropagation()
    // capture pointer so we continue receiving move/up events
    try {
      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId)
    } catch (err) {}
    setDraggedSig(sigId)
    setActivePointerId(e.pointerId)
  }

  // Fallback for touch devices that don't support pointer events (legacy iOS Safari)
  useEffect(() => {
    const node = pageRef.current
    if (!node) return
    if ('ontouchstart' in window && !window.PointerEvent) {
      let touchMoveHandler = (e) => {
        if (!draggedSig) return
        const touch = e.touches[0]
        const rect = node.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        // Clamp to page bounds
        const clampedX = Math.max(0, Math.min(x, rect.width))
        const clampedY = Math.max(0, Math.min(y, rect.height))
        onSignatureMove(draggedSig, {
          x: clampedX / pageScale,
          y: clampedY / pageScale,
          page: pageNumber - 1
        })
      }
      let touchEndHandler = () => {
        setDraggedSig(null)
        setActivePointerId(null)
      }
      node.addEventListener('touchmove', touchMoveHandler, { passive: false })
      node.addEventListener('touchend', touchEndHandler)
      node.addEventListener('touchcancel', touchEndHandler)
      return () => {
        node.removeEventListener('touchmove', touchMoveHandler)
        node.removeEventListener('touchend', touchEndHandler)
        node.removeEventListener('touchcancel', touchEndHandler)
      }
    }
  }, [draggedSig, pageScale, pageNumber, onSignatureMove])

  const handlePointerMove = (e) => {
    if (!draggedSig || (activePointerId != null && e.pointerId !== activePointerId) || !pageRef.current) return

    const rect = pageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Clamp to page bounds
    const clampedX = Math.max(0, Math.min(x, rect.width))
    const clampedY = Math.max(0, Math.min(y, rect.height))

    // Convert rendered pixels back to original-document coordinates by dividing by pageScale
    onSignatureMove(draggedSig, {
      x: clampedX / pageScale,
      y: clampedY / pageScale,
      page: pageNumber - 1
    })
  }

  const handlePointerUp = (e) => {
    if (activePointerId != null && e.pointerId !== activePointerId) return
    setDraggedSig(null)
    setActivePointerId(null)
  }

  useEffect(() => {
    if (draggedSig) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }
    }
  }, [draggedSig, pageScale, pageNumber, activePointerId])

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
    <div className="relative border rounded-lg overflow-hidden shadow-xl max-w-4xl mx-auto bg-gray-50"
      style={{
        // Allow horizontal scroll on mobile
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100vw',
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          // Make PDF container responsive
          minHeight: '300px',
          maxWidth: '100vw',
          overflow: 'visible',
        }}
      >
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
            <div
              className="relative flex justify-center items-center w-full"
              style={{ minWidth: 0 }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }} ref={pageRef}>
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
                {/* Signature Overlay - covers the Page exactly */}
                <div
                  className="absolute top-0 left-0 w-full h-full z-20"
                  style={{
                    touchAction: draggedSig ? 'none' : 'pan-x pan-y',
                    pointerEvents: 'auto',
                  }}
                >
                  {currentPageSigs.map((sig) => {
                    // Compute pixel positions/sizes using pageScale so overlay matches rendered page size
                    const leftPx = (sig.position.x || 0) * pageScale
                    const topPx = (sig.position.y || 0) * pageScale
                    const widthPx = (sig.width || 150) * pageScale
                    const heightPx = (sig.height || 60) * pageScale

                    return (
                      <div
                        key={sig.id}
                        className="absolute group border-2 border-blue-500 hover:border-blue-700 hover:shadow-lg transition-all bg-white"
                        style={{
                          left: `${leftPx}px`,
                          top: `${topPx}px`,
                          width: `${widthPx}px`,
                          height: `${heightPx}px`,
                          minWidth: '60px',
                          minHeight: '30px',
                          borderRadius: '8px',
                          touchAction: draggedSig === sig.id ? 'none' : 'auto',
                          zIndex: 30,
                          boxShadow: draggedSig === sig.id ? '0 0 0 4px #3b82f6' : undefined,
                          cursor: draggedSig === sig.id ? 'grabbing' : 'grab',
                        }}
                        onPointerDown={(e) => handleSignaturePointerDown(e, sig.id)}
                      >
                        <img
                          src={sig.url}
                          alt="Signature"
                          className="w-full h-full object-contain"
                          draggable={false}
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        />
                        <div className="absolute -top-8 right-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="px-3 py-2 bg-red-500 text-white text-base rounded-lg shadow-md active:scale-95"
                            style={{ minWidth: 36, minHeight: 36 }}
                            onClick={() => onSignatureMove(sig.id, { deleted: true })}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Document>
        )}
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 bg-gray-100 p-3 rounded-b-lg">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold disabled:opacity-50 hover:bg-blue-700"
            style={{ minWidth: 100 }}
          >
            Previous
          </button>
          <span className="font-medium text-gray-700 text-base">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold disabled:opacity-50 hover:bg-blue-700"
            style={{ minWidth: 100 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
