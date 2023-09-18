import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Profile | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Manage your information, settings, and more!",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
