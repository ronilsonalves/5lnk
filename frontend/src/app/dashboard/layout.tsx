import "@styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Dashboard | ${process.env.NEXT_PUBLIC_SITE_NAME} – URL Shortener`,
  description: "Manage your links, view your stats, and more!",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
