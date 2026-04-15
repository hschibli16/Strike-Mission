import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strike Mission",
  description: "Score the best waves and snow on earth. Last-minute trips, perfectly timed.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
