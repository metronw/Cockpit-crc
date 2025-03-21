import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify'; // Adicionado
import { TicketTypeProvider } from "./providers";
import { getCrcTicketTypes } from "@/app/actions/api";
import { use } from 'react';

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
  const ticketTypes = use(getCrcTicketTypes());
  const fatherTypes = ticketTypes.filter((el) => el.id == el.id_father)
  const childTypes = ticketTypes.filter((el) => el.id != el.id_father)

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} vsc-initialized`}>
        <Providers>
          <TicketTypeProvider iniContext={{fatherTypes, childTypes}}>
            {children}
          </TicketTypeProvider>
          <Toaster />
          <ToastContainer position="bottom-right" /> {/* Adicionado */}
        </Providers>        
      </body>
    </html>
  );
}
