import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { APP } from "@/configs/consts/app.const";
import { images } from "@/configs/paths/images.path";
import { AuthProvider } from "@/providers/auth-provider";
import { ProjectsProvider } from "@/providers/projects-provider";
import { PushProvider } from "@/providers/push-provider";
import { QueryProvider } from "@/providers/query-provider";
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
  title: APP.TITLE,
  description: APP.DESCRIPTION,
  applicationName: APP.NAME,
  appleWebApp: {
    capable: true,
    title: APP.NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: images.FAVICON,
    apple: images.FAVICON,
  },
};

export const viewport: Viewport = {
  themeColor: APP.THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={interSans.variable}>
      <body className={`${interSans.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <PushProvider>
              <ProjectsProvider>{children}</ProjectsProvider>
            </PushProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
