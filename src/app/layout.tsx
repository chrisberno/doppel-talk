import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from '~/components/ui/sonner';
import { PasteThemeProvider } from '~/components/paste-theme-provider';

export const metadata: Metadata = {
  title: "Doppel Center",
  description: "Enterprise voice tech application with AI TTS, Twilio integration, and IVR exports",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body>
        <PasteThemeProvider>
          {children}
          <Toaster />
        </PasteThemeProvider>
      </body>
    </html>
  );
}
