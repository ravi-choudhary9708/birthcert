import type { Metadata } from "next";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap"
});

const poppins = Poppins({ 
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"], 
  variable: "--font-poppins",
  display: "swap"
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Civil Registration System — Official Birth Certificate Portal",
  description: "Official Government of India Birth Certificate Portal. Submit your application online, track real-time verification status, and receive authentic digital certificates.",
  keywords: "birth certificate, government portal, civil registration system, online birth registration, India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}

