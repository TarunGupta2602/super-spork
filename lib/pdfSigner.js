import { PDFDocument } from 'pdf-lib'

export async function signPdf(pdfUrl, signatures) {
  try {
    const pdfBytes = await fetch(pdfUrl).then(res => {
      if (!res.ok) throw new Error('Failed to fetch PDF')
      return res.arrayBuffer()
    })
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()

    for (const sig of signatures) {
      // Skip deleted signatures
      if (sig.deleted) continue

      const pageIndex = sig.page || 0
      if (pageIndex >= pages.length) continue

      const page = pages[pageIndex]
      const pageHeight = page.getHeight()
      const pageWidth = page.getWidth()

      try {
        const sigBytes = await fetch(sig.url).then(res => {
          if (!res.ok) throw new Error('Failed to fetch signature')
          return res.arrayBuffer()
        })

        let sigImage
        // Detect image type from URL or content
        const url = sig.url.toLowerCase()
        if (url.includes('.jpg') || url.includes('.jpeg') || sig.url.includes('image/jpeg')) {
          sigImage = await pdfDoc.embedJpg(sigBytes)
        } else if (url.includes('.png') || sig.url.includes('image/png')) {
          sigImage = await pdfDoc.embedPng(sigBytes)
        } else {
          // Try PNG first, then JPEG as fallback
          try {
            sigImage = await pdfDoc.embedPng(sigBytes)
          } catch {
            sigImage = await pdfDoc.embedJpg(sigBytes)
          }
        }

        // Calculate position with proper coordinate system
        // Normalize coordinates to page dimensions
        const x = Math.max(0, Math.min(sig.position.x, pageWidth - sig.width))
        const y = Math.max(0, Math.min(sig.position.y, pageHeight - sig.height))

        page.drawImage(sigImage, {
          x: x,
          y: pageHeight - y - sig.height, // Flip Y coordinate for PDF
          width: sig.width,
          height: sig.height
        })
      } catch (error) {
        console.error(`Error embedding signature ${sig.id}:`, error)
        // Continue with next signature if one fails
      }
    }

    const signedBytes = await pdfDoc.save()
    return signedBytes
  } catch (error) {
    console.error('Error signing PDF:', error)
    throw new Error(`PDF signing failed: ${error.message}`)
  }
}