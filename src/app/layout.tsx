import "@/app/globals.css";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Frea",
  description: "Frea is a simple and free chat app.",
  keywords: ["Frea", "Chat", "App"],
  authors: [{ name: "Rai", url: "https://frea.raic.jp" }],
  metadataBase: new URL("https://frea.raic.jp/"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Frea",
    description: "Frea is a simple and free chat app.",
    url: "https://frea.raic.jp/",
    siteName: "Frea",
    images: [
      {
        url: "https://frea.raic.jp/images/banner.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

const geist = Geist({
  subsets: ["latin"],
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="ja">
      <body className={cn(geist.className, "antialiased w-full h-full")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="w-full">{children}</main>
        </ThemeProvider>

        <Toaster richColors />
      </body>
    </html>
  );
};

export default Layout;
