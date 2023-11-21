import Base from "@dashboard/home";
import Head from "@dashboard/components/Head";
import StatsOverview from "./components/StatsOverview";

export const metadata = {
  title: `Analytics | ${process.env.NEXT_PUBLIC_SITE_NAME} - URL Shortener`,
  description: "Browse your analytics, view your stats, and more!",
};
export default async function StatsPage() {
  return (
    <main>
      <Base>
        <Head title="Analytics overview" />
        <StatsOverview />
      </Base>
    </main>
  );
}
