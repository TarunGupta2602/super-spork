import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Digital Signature Platform",
  description:
    "Sign documents and PDFs securely with our easy-to-use digital signature platform.",
  keywords: [
    "digital signature",
    "sign PDF",
    "e-signature",
    "online document signing",
    "PDF signature tool",
  ],

  // Basic Open Graph without needing domain or images
  openGraph: {
    title: "Digital Signature Platform",
    description:
      "Secure and simple digital signatures for your documents and PDF files.",
    type: "website",
  },

  // Basic Twitter metadata (no image required)
  twitter: {
    card: "summary",
    title: "Digital Signature Platform",
    description:
      "Sign documents and PDFs online with secure digital signatures.",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
