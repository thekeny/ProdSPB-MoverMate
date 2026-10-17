import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MoverMateLayout } from "@/components/movermate/layout";
import { MoverMateProvider } from "@/components/movermate/store";
import "./globals.css";

const interSans = localFont({
  src: [
    {
      path: "../../public/fonts/InterVariable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterVariable-Italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoverMate - Переезд без хаоса",
  description: "Планирование переезда и учет коробок.",
};

export const viewport: Viewport = {
  themeColor: "#F5F3EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={interSans.variable}>
      <body className={`${interSans.className} antialiased`}>
        <MoverMateProvider>
          <MoverMateLayout>{children}</MoverMateLayout>
        </MoverMateProvider>
      </body>
    </html>
  );
}
