import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/context/ToastContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Tinig | Mga Bulong sa Kalawakan",
  description: "Ang mga salitang hindi masabi, sa bituin na lang ibubulong. Isang ligtas na espasyo para sa iyong mga kinikimkim.",
  
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fil">
      
      <body className={`${montserrat.variable} font-sans antialiased bg-black text-white`}>
      <ToastProvider>
        {children}
        </ToastProvider>
      </body>
    </html>
  );
}