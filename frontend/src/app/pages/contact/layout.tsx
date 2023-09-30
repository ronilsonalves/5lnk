import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Contact | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    openGraph: {
        title: `Contact | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
        description: "",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/contact`,
    },
};

export default function ContactLayout({
    children,
} : {children: React.ReactNode}) {
    return children;
}