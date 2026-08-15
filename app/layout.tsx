import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RuLaFHub | Jurnal Inovasi Pendidikan Jawi",
  description: "Pusat Dokumentasi & Tesis Program RuLaF",
  icons: {
    icon: "/rulafhub.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0F1419]">
        {/* Navbar dipaparkan secara global di setiap halaman */}
        <Navbar />
        
        {/* Kandungan halaman page.tsx meluncur masuk di sini */}
        <main className="min-h-full flex flex-col bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] transition-colors duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
