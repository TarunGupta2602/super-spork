# 📋 Quick Reference Card

## Getting Started (Copy-Paste)

### Start Dev Server
```bash
cd /Users/tarungupta/Desktop/signpdf && npm run dev
```
Opens on: `http://localhost:3001`

### Build for Production
```bash
npm run build
npm start
```

### Check for Errors
```bash
npm run lint
```

---

## Key Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server (with hot reload) |
| `npm run build` | Create production build |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

---

## File Reference

### Core Components
- **`app/page.js`** - Main page (4 steps)
- **`components/PDFUploader.js`** - PDF upload (with validation)
- **`components/SignatureUploader.js`** - Signature upload (with validation)
- **`components/PDFViewer.js`** - PDF display (with drag positioning)
- **`components/DownloadButton.js`** - Sign and download

### Libraries
- **`lib/supabaseClient.js`** - Supabase config
- **`lib/supabaseStorage.js`** - Upload files
- **`lib/pdfSigner.js`** - Sign PDFs (PNG/JPG support)

### Configuration
- **`.env.local`** - Environment variables (SECRET!)
- **`tailwind.config.js`** - Styling config
- **`next.config.mjs`** - Next.js config
- **`package.json`** - Dependencies

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
```

Find these in your Supabase dashboard:
1. Go to supabase.com
2. Open your project
3. Settings → API → Copy the keys
4. Paste into `.env.local`

---

## Supabase Buckets

Create these 3 **PUBLIC** buckets:

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| `documents` | PDFs to sign | 50MB |
| `signatures` | Signature images | 5MB each |
| `signed-documents` | Signed PDFs | 50MB |

**Important**: All buckets must be PUBLIC

---

## Dependencies

| Package | Used For |
|---------|----------|
| next | React framework |
| react | UI library |
| react-dom | React renderer |
| pdf-lib | Sign PDFs |
| react-pdf | Display PDFs |
| @supabase/supabase-js | Backend storage |
| tailwindcss | Styling |
| lucide-react | Icons |
| uuid | Unique file IDs |

---

## Common Errors & Fixes

### "Cannot find module 'react-pdf'"
```bash
npm install
npm run dev
```

### "Port 3000 in use"
```bash
kill $(lsof -t -i :3000)
npm run dev
```

### "PDF won't load"
- Check Supabase bucket is PUBLIC
- Check file URL is correct
- Try a different PDF

### "Build fails"
```bash
rm -rf .next node_modules
npm install
npm run dev
```

---

## Feature Checklist

- [x] Upload PDF
- [x] Upload signature images (PNG, JPG, etc.)
- [x] Drag signatures to position
- [x] Multi-page PDF support
- [x] Delete signatures
- [x] Sign PDF with signatures
- [x] Download signed PDF
- [x] Error handling
- [x] File validation
- [x] Responsive design

---

## Testing the App

### Full Workflow
1. **Upload PDF** → Select any PDF file
2. **Upload Signature** → Upload a PNG or JPG image
3. **Position** → Drag the signature on the preview
4. **Download** → Click download button
5. **Check** → Open downloaded PDF to verify

### Test Scenarios
- [ ] Single signature on page 1
- [ ] Multiple signatures
- [ ] Multi-page PDF
- [ ] Different image formats (PNG, JPG)
- [ ] Large file (test validation)
- [ ] Delete signature before download

---

## Performance Tips

1. **Use compressed PDFs** (< 10MB)
2. **Optimize signature images** (< 500KB each)
3. **Clear browser cache** if issues occur
4. **Use modern browser** (Chrome, Firefox, Safari)

---

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify
```bash
# Build first
npm run build

# Deploy the 'out' folder
```

### Option 3: Traditional Server
```bash
# Build
npm run build

# Run on server
npm start
```

---

## Monitoring

### Check if server is running
```bash
curl http://localhost:3001
# Should return HTML
```

### Check console for errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors

### Check Supabase status
1. Open supabase.com
2. Go to your project
3. Check Health status

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Full documentation |
| `QUICK_START.md` | 5-minute setup |
| `IMPLEMENTATION_GUIDE.md` | Technical details |
| `COMPLETION_SUMMARY.md` | What was changed |
| `UI_UX_CHANGES.md` | Design improvements |
| `QUICK_REFERENCE.md` | This file! |

---

## Support Resources

### Browser Console (F12)
- Shows JavaScript errors
- Network requests
- Performance timing
- Browser warnings

### Supabase Dashboard
- Check bucket settings
- View file uploads
- Monitor requests
- Check authentication

### Next.js Docs
- https://nextjs.org/docs
- React documentation
- Tailwind CSS docs

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Bundle Size | ~4MB |
| Initial Load | ~2-3s |
| Dev Server Startup | ~360ms |
| Supported Formats | PNG, JPG, GIF, etc. |
| PDF Size Limit | 50MB |
| Image Size Limit | 5MB each |
| Max Signatures | Unlimited |
| Multi-page Support | Yes |
| Mobile Support | Fully responsive |

---

## Useful Links

- Supabase: https://supabase.com
- Next.js: https://nextjs.org
- React: https://react.dev
- pdf-lib: https://pdf-lib.js.org
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

---

## Version Info

```
Node: 16+
npm: 10+
Next.js: 16.0.3
React: 19.2.0
pdf-lib: 1.17.1
react-pdf: 10.2.0
Tailwind: 4
```

---

**Everything you need on one page! 🚀**

Last updated: November 23, 2025
