import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from '~/components/ui/sonner';

export const metadata: Metadata = {
  title: "double.talk",
  description: "Enterprise A.I. Voice Solutions",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>{children}

        <Toaster />
      </body>
    </html>
  );
}
