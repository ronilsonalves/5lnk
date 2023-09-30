import Head from "@dashboard/components/Head";
import Base from "@dashboard/home";
import Links from "./components/Links";


export const metadata = {
  title: `My Links | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Manage your links, view your stats, and more!",
};

export default async function LinksPage() {
  return (
    <main>
      <Base>
        <Head title="Links" />
        <Links />
      </Base>
    </main>
  );
}
