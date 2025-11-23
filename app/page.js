'use client'
import { useState } from 'react'
import PDFUploader from '@/components/PDFUploader'
import SignatureUploader from '@/components/SignatureUploader'
import PDFViewerWrapper from '@/components/PDFViewerWrapper'
import DownloadButton from '@/components/DownloadButton'

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [signatures, setSignatures] = useState([]) // [{ id, url, position: {x,y}, width, height, page }]

  const handlePdfUploaded = (url) => setPdfUrl(url)

  const handleSignatureAdded = (newSig) => setSignatures(prev => [...prev, newSig])

  const handleSignatureMove = (id, updates) => {
    if (updates.deleted) {
      setSignatures(prev => prev.filter(sig => sig.id !== id))
    } else {
      setSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, ...updates } : sig))
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Signer.in
          </h1>
          <p className="text-lg text-gray-600 mb-2">Free PDF Signer - No Login Required</p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>✓ Secure</span>
            <span>✓ Anonymous</span>
            <span>✓ Fast</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {/* Step 1: Upload PDF */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">1</div>
              <h2 className="text-2xl font-bold text-gray-800">Upload PDF</h2>
            </div>
            <PDFUploader onPdfUploaded={handlePdfUploaded} />
          </div>

          {/* Step 2: Upload Signatures */}
          {pdfUrl && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                <h2 className="text-2xl font-bold text-gray-800">Add Signatures</h2>
              </div>
              <SignatureUploader onSignatureAdded={handleSignatureAdded} />
              {signatures.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  📌 {signatures.length} signature{signatures.length !== 1 ? 's' : ''} added. You can add more or proceed to preview.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Position */}
          {pdfUrl && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">3</div>
                <h2 className="text-2xl font-bold text-gray-800">Preview & Position</h2>
              </div>
              <p className="text-gray-600 mb-4">Drag signatures to position them. Click the trash icon to remove.</p>
              <PDFViewerWrapper pdfUrl={pdfUrl} signatures={signatures} onSignatureMove={handleSignatureMove} />
            </div>
          )}

          {/* Step 4: Download */}
          {signatures.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">4</div>
                <h2 className="text-2xl font-bold text-gray-800">Download Signed PDF</h2>
              </div>
              <p className="text-gray-600 mb-4">Review your signatures above and click below to download your signed PDF.</p>
              <DownloadButton pdfUrl={pdfUrl} signatures={signatures} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8">
          <div className="text-gray-600 text-sm mb-4">
            <p className="mb-2">🔒 No login required • 🛡️ 100% secure • 📝 Files never stored</p>
            <p>All processing happens in your browser. We don't collect any data.</p>
          </div>
          <div className="text-gray-400 text-xs">
            <p>© 2025 Signer.in - Free PDF Signing Service</p>
          </div>
        </footer>
      </div>
    </main>
  )
}