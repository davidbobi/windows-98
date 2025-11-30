import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetroOS 98",
  description: "A retro-styled web desktop inspired by late 90s operating systems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
