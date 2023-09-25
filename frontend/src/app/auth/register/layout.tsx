import "@styles/globals.css";
import type { Metadata } from "next";
import { ServerAuthProvider } from "@/auth/server-auth-provider";

export const metadata: Metadata = {
  title: `Create an account | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Create a Free accoun to manage your links and view your stats.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <ServerAuthProvider>
    {children}
  </ServerAuthProvider>
  );
}
