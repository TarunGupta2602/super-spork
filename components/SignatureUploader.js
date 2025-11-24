'use client'
import { useState } from 'react'
import { uploadToBucket } from '@/lib/supabaseStorage'
import { PenTool, AlertCircle, Pen } from 'lucide-react'
import dynamic from 'next/dynamic'

const SignatureDrawer = dynamic(() => import('./SignatureDrawer'), { ssr: false })

export default function SignatureUploader({ onSignatureAdded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)

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

  const handleDrawnSignature = async (dataUrl) => {
    setLoading(true)
    setError(null)

    try {
      // Convert data URL to file
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' })

      // Upload to bucket
      const publicUrl = await uploadToBucket(file, 'signatures')
      onSignatureAdded({
        id: Date.now(),
        url: publicUrl,
        position: { x: 50, y: 50 },
        width: 150,
        height: 70,
        page: 0
      })
      setShowDrawer(false)
    } catch (err) {
      setError('Failed to save signature: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="border p-4 rounded-lg mt-4 bg-white space-y-3">
        {/* Upload Signature */}
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
        <p className="text-sm text-gray-600">Upload an existing signature image</p>

        {/* Draw Signature */}
        <button
          onClick={() => setShowDrawer(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50"
        >
          <Pen className="w-5 h-5" />
          Draw Signature
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {showDrawer && (
        <SignatureDrawer
          onSignatureSaved={handleDrawnSignature}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </>
  )
}