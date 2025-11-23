'use client'
import { useState } from 'react'
import { uploadToBucket } from '@/lib/supabaseStorage'
import { Upload, AlertCircle } from 'lucide-react'

export default function PDFUploader({ onPdfUploaded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const publicUrl = await uploadToBucket(file, 'documents')
      onPdfUploaded(publicUrl)
      e.target.value = '' // Reset input
    } catch (err) {
      setError('Upload failed: ' + err.message)
      console.error('PDF upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-6 rounded-lg bg-white">
      <label htmlFor="pdf-upload" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
        <Upload className="w-6 h-6 text-blue-600" />
        <span className="font-medium">{loading ? 'Uploading PDF...' : 'Upload PDF Document'}</span>
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
      />
      <p className="text-sm text-gray-600 mt-2">Maximum file size: 50MB</p>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}