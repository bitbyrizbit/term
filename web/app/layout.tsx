import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "TERM | The Executable Contract Graph",
  description: "Deterministic graph traversal for legal contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-paper-100 text-ink-900 font-sans antialiased min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
