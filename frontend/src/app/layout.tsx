import '@styles/globals.css'
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ServerAuthProvider } from "@/auth/server-auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Free URL shortener service built with Golang and Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <ServerAuthProvider>
      <html lang="en">
        {process.env.NEXT_PUBLIC_ANALYTICS_ID ? (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
        ) : null}
        <body className={inter.className}>{children}</body>
      </html>
     </ServerAuthProvider>
  );
}
