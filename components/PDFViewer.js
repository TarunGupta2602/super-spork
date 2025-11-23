'use client'

import { useRef, useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

// Import at top level (not dynamic initially for type safety)
let PDFDocument = null
let PDFPage = null

// Load components after hydration and configure pdfjs worker
if (typeof window !== 'undefined') {
  import('react-pdf').then(mod => {
    PDFDocument = mod.Document
    PDFPage = mod.Page
    // Configure the worker to use the local copy served from /public
    if (mod && mod.pdfjs && !mod.pdfjs.GlobalWorkerOptions.workerSrc) {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    }
  }).catch(err => console.error('Failed to load react-pdf:', err))
}

export default function PDFViewer({ pdfUrl, signatures, onSignatureMove }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState(null)
  const containerRef = useRef(null)
  const [draggedSig, setDraggedSig] = useState(null)
  const [activePointerId, setActivePointerId] = useState(null)
  const [pageScale, setPageScale] = useState(1)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const currentPageSigs = signatures.filter(sig => sig.page === pageNumber - 1)

  // Pointer-based handlers (works for mouse, touch, pen)
  const handleSignaturePointerDown = (e, sigId) => {
    e.preventDefault()
    e.stopPropagation()
    try { e.target.setPointerCapture?.(e.pointerId) } catch (err) {}
    setDraggedSig(sigId)
    setActivePointerId(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!draggedSig || activePointerId != null && e.pointerId !== activePointerId || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    onSignatureMove(draggedSig, {
      x: Math.max(0, x / pageScale),
      y: Math.max(0, y / pageScale),
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

  if (loadError) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 text-red-700">
        <h3 className="font-semibold">Error Loading PDF</h3>
        <p>{loadError}</p>
      </div>
    )
  }

  // Show loading state if not on client or components not loaded
  if (!isClient || !PDFDocument || !PDFPage) {
    return (
      <div className="p-12 text-center border rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Initializing PDF viewer...</p>
      </div>
    )
  }

  return (
    <div className="relative border rounded-lg overflow-hidden shadow-xl max-w-4xl mx-auto bg-gray-50">
      <div ref={containerRef} className="relative inline-block w-full">
        {pdfUrl && (
          <PDFDocument
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
            <div className="relative inline-block">
              <PDFPage
                pageNumber={pageNumber}
                scale={1.5}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  if (page && page.originalWidth) {
                    setPageScale(page.width / page.originalWidth)
                  }
                }}
                onRenderError={(error) => console.error('Page render error:', error)}
              />

              {/* Signature Overlay */}
              <div className="absolute inset-0" style={{ touchAction: 'none' }}>
                {currentPageSigs.map((sig) => {
                  const leftPx = (sig.position.x || 0) * pageScale
                  const topPx = (sig.position.y || 0) * pageScale
                  const widthPx = (sig.width || 150) * pageScale
                  const heightPx = (sig.height || 60) * pageScale

                  return (
                    <div
                      key={sig.id}
                      className="absolute group cursor-move border-2 border-blue-500 hover:border-blue-700 hover:shadow-lg transition-all"
                      style={{
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${heightPx}px`,
                        minWidth: '80px',
                        minHeight: '40px',
                        touchAction: 'none'
                      }}
                      onPointerDown={(e) => handleSignaturePointerDown(e, sig.id)}
                    >
                      <img
                        src={sig.url}
                        alt="Signature"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="px-2 py-1 bg-red-500 text-white text-sm rounded"
                          onClick={() => onSignatureMove(sig.id, { deleted: true })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </PDFDocument>
        )}
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4 bg-gray-100 p-3 rounded-b-lg">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Previous
          </button>
          <span className="font-medium text-gray-700">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}