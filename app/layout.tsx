import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify'; // Adicionado
import { TicketTypeProvider } from "./providers";
import { getCrcTicketTypes } from "@/app/actions/api";
import { use } from 'react';
import { CSPostHogProvider } from './providers';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Metro CRC Cockpit",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const iniContext = use(getCrcTicketTypes());

  return (
    <html lang="en">
      <CSPostHogProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} vsc-initialized`}>
          <Providers>
            <TicketTypeProvider iniContext={iniContext}>
              {children}
            </TicketTypeProvider>
            <Toaster />
            <ToastContainer position="bottom-right" /> {/* Adicionado */}
          </Providers>        
        </body>
      </CSPostHogProvider>
    </html>
  );
}
