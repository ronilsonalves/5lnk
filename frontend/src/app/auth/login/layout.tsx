import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Login | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Login to your account to manage your links.",
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
