import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@repo/ui/components/toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkConnect",
  description: "WorkConnect recruitment task",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Toasts portal to the body, outside every `light-surface`, so the
            viewport must carry the class itself or they render dark. */}
        <NuqsAdapter>
          <Toaster viewportClassName="light-surface">{children}</Toaster>
        </NuqsAdapter>
      </body>
    </html>
  );
}
