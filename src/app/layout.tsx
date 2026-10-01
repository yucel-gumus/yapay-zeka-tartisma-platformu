import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Yapay Zeka Tartışma Platformu",
  description:
    "Farklı uzman bakış açılarıyla tezleri, argümanları ve kanıtları değerlendirin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">{children}</div>
        <footer className="app-footer">
          <p>
            Geliştirici:{" "}
            <a
              href="https://www.yucelgumus.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Yücel Gümüş
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
