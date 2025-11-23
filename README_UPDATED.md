# Signer.in - Free PDF Signer

A modern, web-based PDF signing application that allows users to upload PDFs, add multiple signatures to different pages, and download the signed documents. **No login required. 100% secure with Supabase.**

## Features

✅ **Upload PDFs** - Support for files up to 50MB  
✅ **Add Signatures** - Upload image signatures (PNG, JPG, etc.)  
✅ **Multi-Page Support** - Place signatures on any page of multi-page PDFs  
✅ **Drag & Drop Positioning** - Drag signatures to position them precisely  
✅ **Real-time Preview** - See signatures positioned on the PDF before downloading  
✅ **Secure Storage** - All files stored in Supabase buckets  
✅ **No Account Required** - Complete anonymity  
✅ **Responsive Design** - Works on desktop and tablets  

## Tech Stack

- **Frontend**: React 19, Next.js 16
- **PDF Handling**: pdf-lib, react-pdf
- **Storage**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File IDs**: UUID v4

## Prerequisites

- Node.js 16+ and npm
- Supabase account with configured buckets
- Environment variables setup

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd signpdf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Create Supabase Buckets**
   - Create 3 public buckets in Supabase:
     - `documents` - for uploaded PDFs
     - `signatures` - for signature images
     - `signed-documents` - for signed PDFs

   Set all buckets to **public** so files can be downloaded.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

## Project Structure

```
signpdf/
├── app/
│   ├── page.js                 # Main page component
│   ├── layout.js              # Root layout with metadata
│   └── globals.css            # Global styles
├── components/
│   ├── PDFUploader.js         # PDF file upload component
│   ├── SignatureUploader.js   # Signature image upload
│   ├── PDFViewer.js           # PDF display with signature overlay
│   └── DownloadButton.js      # Sign and download button
├── lib/
│   ├── pdfSigner.js           # PDF signing logic using pdf-lib
│   ├── supabaseClient.js      # Supabase client config
│   └── supabaseStorage.js     # File upload to Supabase
├── public/
│   └── [assets]               # Public assets
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── next.config.mjs            # Next.js config
└── README.md                  # This file
```

## How It Works

1. **Upload PDF** → File is uploaded to Supabase `documents` bucket
2. **Upload Signature(s)** → Image files uploaded to `signatures` bucket
3. **Position Signatures** → Drag signatures on PDF preview to desired positions
4. **Sign & Download** → Click button to:
   - Embed signatures into the PDF using pdf-lib
   - Upload signed PDF to `signed-documents` bucket
   - Download the file to your computer

## Component Details

### PDFUploader
- Validates PDF files (max 50MB)
- Uploads to Supabase storage
- Shows error messages for invalid files

### SignatureUploader
- Accepts PNG, JPG, and other image formats
- Uploads to Supabase storage
- Allows multiple signature uploads

### PDFViewer
- Displays PDF pages using react-pdf
- Shows signature overlays as positioned by the user
- Drag signatures to reposition
- Click delete (trash icon) to remove a signature
- Supports multi-page navigation

### DownloadButton
- Validates that PDF and signatures exist
- Signs the PDF with all placed signatures
- Uploads signed PDF to Supabase
- Triggers browser download

## API Integration

### Supabase Functions

**uploadToBucket(file, bucketType)**
- Uploads file to specified bucket
- Returns public URL
- Supports: `documents`, `signatures`, `signed`

**signPdf(pdfUrl, signatures)**
- Fetches PDF from URL
- Embeds all signature images
- Returns signed PDF as bytes
- Handles PNG and JPG formats automatically

## Development

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Configuration

### Tailwind CSS
Configured in `tailwind.config.js` with custom colors and theme extensions.

### PDF Rendering
- PDF.js worker: `pdfjs-dist` (auto-configured)
- Page rendering: `react-pdf` with optimized settings
- Canvas overlay: Clean DOM-based positioning

## Error Handling

The application includes comprehensive error handling:
- File validation (type, size)
- PDF load errors with user-friendly messages
- Upload failures with retry suggestions
- Signing errors with debugging info

## Security Notes

✅ No user data is stored on your server  
✅ All files stored in Supabase with public URLs  
✅ CORS configured for safe cross-origin access  
✅ SSL/TLS encryption for data in transit  
✅ No database of user information  

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Android Chrome)

## Troubleshooting

### PDF won't load
- Check Supabase bucket is public
- Verify CORS is enabled in Supabase
- Check file URL is accessible

### Signatures not showing
- Verify image files are valid formats
- Check image is accessible at public URL
- Try refreshing the page

### Download fails
- Ensure all signatures are on valid positions
- Check PDF doesn't have layout issues
- Try with a simpler PDF first

### Port 3000 already in use
```bash
kill $(lsof -t -i :3000)
# Then start again
npm run dev
```

## Performance Tips

- Use compressed PDFs (< 10MB) for faster loading
- Use optimized signature images (100-200KB each)
- Place signatures on correct pages to avoid processing large files

## Future Enhancements

- Draw signatures directly in the app
- Multiple file upload in single operation
- Batch PDF signing
- Signature templates
- Custom signature appearance (color, transparency)

## License

MIT - Feel free to use and modify

## Support

For issues or questions:
1. Check this README
2. Review component code for error messages
3. Check Supabase console for storage issues

---

Made with ❤️ for secure, anonymous PDF signing.
