import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Library",
  description: "AI-powered prompt builder with TCWEI framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-light">
        {children}
      </body>
    </html>
  );
}
