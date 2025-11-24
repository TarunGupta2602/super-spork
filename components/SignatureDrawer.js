'use client'
import { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Pen, Eraser } from 'lucide-react'

export default function SignatureDrawer({ onSignatureSaved, onClose }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState(null)
  const [mode, setMode] = useState('draw') // 'draw' or 'erase'
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#000000')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to fit mobile and desktop
    const width = Math.min(600, window.innerWidth - 40)
    const height = 300
    canvas.width = width
    canvas.height = height

    // Set background to white
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setContext(ctx)
  }, [])

  // Update context when color or size changes
  useEffect(() => {
    if (!context) return
    context.strokeStyle = mode === 'erase' ? 'white' : brushColor
    context.lineWidth = brushSize
    context.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over'
  }, [context, brushColor, brushSize, mode])

  const getCoords = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX || e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY || e.touches?.[0]?.clientY) - rect.top,
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const coords = getCoords(e)
    if (!coords || !context) return
    context.beginPath()
    context.moveTo(coords.x, coords.y)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing || !context) return
    const coords = getCoords(e)
    if (!coords) return
    context.lineTo(coords.x, coords.y)
    context.stroke()
  }

  const stopDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(false)
    context?.closePath()
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const saveSignature = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSignatureSaved(dataUrl)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Draw Your Signature</h2>
          <p className="text-blue-100 text-sm mt-1">Use your mouse or touchscreen to write and draw</p>
        </div>

        {/* Drawing Area */}
        <div className="p-4 sm:p-6">
          {/* Canvas */}
          <div className="mb-4 border-4 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Drawing Mode */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('draw')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                    mode === 'draw'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Pen className="w-4 h-4" />
                  Draw
                </button>
                <button
                  onClick={() => setMode('erase')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                    mode === 'erase'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  Erase
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Brush Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Brush Color */}
            {mode === 'draw' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        brushColor === color ? 'border-gray-700 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={clearCanvas}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Canvas
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={saveSignature}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <Download className="w-4 h-4" />
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
