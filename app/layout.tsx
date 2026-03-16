import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const titleFont = localFont({
  src: "./fonts/MyHeadingFont.ttf",
  variable: "--font-title",
});

const bodyFont = localFont({
  src: "./fonts/MyBodyFont.otf",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Pilot_Dev Portfolio",
  description: "Full Stack Space Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Inject BOTH variables into the HTML tag
    <html lang="en" className={`${titleFont.variable} ${bodyFont.variable} scroll-smooth`}>
      {/* 4. We apply the body font globally here */}
      <body className="font-body antialiased bg-slate-950 text-cyan-100 selection:bg-fuchsia-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}