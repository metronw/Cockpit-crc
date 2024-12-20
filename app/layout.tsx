"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { TicketTypeProvider } from "./providers";
import { getCrcTicketTypes } from "@/app/actions/api";
import { use } from "react";
import WebPhone from "@/components/WebPhone";

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
  title: "Metro Crc Cockpit",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} vsc-initialized`}
      >
        <Providers>
          <TicketTypeProvider iniContext={JSON.parse(iniContext)}>
            <div>
              {children}
              <WebPhone />
            </div>
          </TicketTypeProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
