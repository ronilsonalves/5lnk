import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Recover from "@/components/forms/Recover";

export const metadata: Metadata = {
  title: `Recover your password | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Recover access to your account.",
};
export default function RecoverPage() {
  return (
    <main>
      <Recover />
      <Footer />
    </main>
  );
}
