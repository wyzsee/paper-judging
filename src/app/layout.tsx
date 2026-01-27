import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import "./globals.css";

// Setup Font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Lengkap dari tipis ke tebal
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Paper Judging",
  description: "Exclusive Event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.className} antialiased bg-slate-950 text-gray-200`}>
        {children}
      </body>
    </html>
  );
}