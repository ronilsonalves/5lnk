import Base from "./home";
import DashboardStats from "./components/DashboardStats";
import DashboardRecentLinks from "./components/DashboardRecentLinks";


export default function Dashboard() {
  return (
    <main>
      <Base>
        <>
          <DashboardStats />
          <DashboardRecentLinks />
        </>
      </Base>
    </main>
  );
}
