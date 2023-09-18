import Head from "../components/Head";
import Base from "../home";
import NoLinks from "./components/Links";


export const metadata = {
  title: `Links | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Manage your links, view your stats, and more!",
};

export default async function LinksPage() {
  return (
    <main>
      <Base>
        <Head title="Links" />
        <NoLinks />
      </Base>
    </main>
  );
}
