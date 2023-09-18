import { AuthContext } from "@/auth/context";
import ProfileForm from "./form";
import Base from "@dashboard/home";

export default function ProfilePage() {
  return (
    <>
      <main>
        <div className="">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="card shadow-lg compact side bg-base-100">
              SOME CONTENT
            </div>
          </div> */}
          <Base>
            <ProfileForm />
          </Base>
        </div>
      </main>
    </>
  );
}
