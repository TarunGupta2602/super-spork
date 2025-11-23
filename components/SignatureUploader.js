'use client'
import { useState } from 'react'
import { uploadToBucket } from '@/lib/supabaseStorage'
import { PenTool, AlertCircle } from 'lucide-react'

export default function SignatureUploader({ onSignatureAdded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const publicUrl = await uploadToBucket(file, 'signatures')
      onSignatureAdded({
        id: Date.now(),
        url: publicUrl,
        position: { x: 50, y: 50 },
        width: 150,
        height: 70,
        page: 0
      })
      e.target.value = '' // Reset input
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 rounded-lg mt-4 bg-white">
      <label htmlFor="sig-upload" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
        <PenTool className="w-6 h-6 text-blue-600" />
        <span className="font-medium">{loading ? 'Uploading...' : 'Upload Signature'}</span>
      </label>
      <input
        id="sig-upload"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
      />
      <p className="text-sm text-gray-600 mt-2">Add multiple signatures to different pages</p>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}