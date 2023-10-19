import Head from "@dashboard/components/Head";
import Base from "@dashboard/home";
import Pages from "./components/Pages";

export const metadata = {
  title: `My Pages | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Manage your pages, view your stats, and more!",
};

export default async function PagesPage() {
  return (
    <main>
      <Base>
        <Head title="My links pages" />
        <Pages />
      </Base>
    </main>
  );
}
