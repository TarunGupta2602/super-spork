'use client'
import { useState } from 'react'
import { signPdf } from '@/lib/pdfSigner'
import { uploadToBucket } from '@/lib/supabaseStorage'
import { Download, Loader } from 'lucide-react'

export default function DownloadButton({ pdfUrl, signatures }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    if (!pdfUrl) {
      setError('Please upload a PDF first')
      return
    }

    if (signatures.length === 0) {
      setError('Please add at least one signature')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Filter out deleted signatures
      const activeSigs = signatures.filter(s => !s.deleted)

      if (activeSigs.length === 0) {
        setError('All signatures have been removed')
        setLoading(false)
        return
      }

      const signedBytes = await signPdf(pdfUrl, activeSigs)
      const signedFile = new Blob([signedBytes], { type: 'application/pdf' })
      const signedPdfFile = new File([signedFile], `signed-${Date.now()}.pdf`, {
        type: 'application/pdf'
      })

      const publicUrl = await uploadToBucket(signedPdfFile, 'signed')

      // Create download link
      const link = document.createElement('a')
      link.href = publicUrl
      link.download = `signed-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setError(null)
    } catch (err) {
      console.error('Signing/download error:', err)
      setError('Failed to sign PDF: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <button
        onClick={handleDownload}
        disabled={loading || !pdfUrl || signatures.length === 0}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Signing & Downloading...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Signed PDF
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}