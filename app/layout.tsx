import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Salon de Cristal Experience",
  description: "Create a table setting for your private dining experience at Morpheus Macau.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}