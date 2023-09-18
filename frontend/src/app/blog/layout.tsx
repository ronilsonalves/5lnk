import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Articles | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Guides that will help you to empower your business using our services.",
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}