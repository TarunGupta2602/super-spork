import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "Signer.in - Free PDF Signer",
  description: "Sign PDFs online for free with no login required. 100% secure with Supabase.",
  keywords: ["PDF", "sign", "signature", "online", "free", "digital signature", "sign pdf online", "no login pdf sign", "secure pdf signer", "free pdf signature"],
  openGraph: {
    title: "Signer.in - Free PDF Signer",
    description: "Sign PDFs online for free with no login required. 100% secure with Supabase.",


    images: [
      {
        url: "/file.svg",
        width: 1200,
        height: 630,
        alt: "Signer.in - Free PDF Signer"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@signerin",
    title: "Signer.in - Free PDF Signer",
    description: "Sign PDFs online for free with no login required. 100% secure with Supabase.",
    image: "/file.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sign PDFs online for free with no login required. 100% secure with Supabase." />
        <meta name="keywords" content="PDF, sign, signature, online, free, digital signature, sign pdf online, no login pdf sign, secure pdf signer, free pdf signature" />
        <link rel="canonical" href="https://signer.in/" />
        {/* Open Graph */}
        <meta property="og:title" content="Signer.in - Free PDF Signer" />
        <meta property="og:description" content="Sign PDFs online for free with no login required. 100% secure with Supabase." />
        <meta property="og:url" content="https://signer.in/" />
        <meta property="og:site_name" content="Signer.in" />
        <meta property="og:image" content="/file.svg" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@signerin" />
        <meta name="twitter:title" content="Signer.in - Free PDF Signer" />
        <meta name="twitter:description" content="Sign PDFs online for free with no login required. 100% secure with Supabase." />
        <meta name="twitter:image" content="/file.svg" />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Signer.in',
          url: 'https://signer.in/',
          description: 'Sign PDFs online for free with no login required. 100% secure with Supabase.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://signer.in/?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
