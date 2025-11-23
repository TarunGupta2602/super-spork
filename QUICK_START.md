# 🚀 Quick Start Guide

## Installation (5 minutes)

1. **Navigate to project**
   ```bash
   cd /Users/tarungupta/Desktop/signpdf
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Go to `http://localhost:3000` or `http://localhost:3001`
   - Start signing PDFs!

---

## Required Setup (One-time)

### Supabase Configuration

1. Go to [supabase.com](https://supabase.com)
2. Create 3 **PUBLIC** buckets:
   - `documents` - PDF uploads
   - `signatures` - Signature images
   - `signed-documents` - Signed PDFs

3. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

---

## Using the App

### Step 1: Upload PDF
- Click the upload area
- Select a PDF file (max 50MB)
- Wait for upload to complete

### Step 2: Add Signatures
- Click "Upload Signature"
- Select signature image (PNG, JPG, etc.)
- Add multiple signatures for different pages

### Step 3: Position Signatures
- Drag signatures to desired location
- Click trash icon to remove
- Use page navigation for multi-page PDFs

### Step 4: Download
- Click "Download Signed PDF"
- File downloads automatically
- Signed PDF stored in Supabase

---

## Common Issues

### "Port 3000 in use"
```bash
kill $(lsof -t -i :3000)
npm run dev
```

### "PDF won't load"
- Verify Supabase bucket is PUBLIC
- Check file URL is working
- Try a different PDF

### "Signatures don't appear"
- Refresh the page
- Verify image format is PNG/JPG
- Re-upload the signature

---

## Files Changed

✅ **PDFViewer.js** - Removed Fabric.js, simplified drag-drop  
✅ **pdfSigner.js** - Added PNG/JPG support  
✅ **PDFUploader.js** - Added validation  
✅ **SignatureUploader.js** - Added validation  
✅ **DownloadButton.js** - Added error handling  
✅ **page.js** - New modern UI with steps  
✅ **layout.js** - Updated metadata  
✅ **globals.css** - Enhanced styling  
✅ **tailwind.config.js** - Created (was missing)  

---

## Build for Production

```bash
npm run build
npm start
```

---

## Documentation

- `README.md` - Full documentation
- `IMPLEMENTATION_GUIDE.md` - Technical details
- Component comments - Code documentation

---

**Ready to sign PDFs! 🎉**
