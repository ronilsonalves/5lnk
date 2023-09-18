"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/auth/context";
import { useFirebaseAuth } from "@/auth/firebase";
import { signOut } from "firebase/auth";
import { useLoadingCallback } from "react-loading-hook";
import Image from "next/image";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth();
  const auth2 = getFirebaseAuth();
  const [handleLogout, isLogoutLoading, isLogoutError] = useLoadingCallback(
    async () => {
      const auth = getFirebaseAuth();
      await signOut(auth);
      await fetch("/api/logout", {
        method: "GET",
      });
      window.location.reload();
    }
  );

  return (
    <header className="navbar bg-base-100 p-0">
      <div className="navbar-start w-1/3"></div>
      <div className="navbar-center w-1/3 justify-center">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          {process.env.NEXT_PUBLIC_SITE_NAME}
        </a>
      </div>
      {!auth2.currentUser && (
        <div className="navbar-end w-1/3">
          <div className="min-h-full p-4 space-y-4 animate-pulse bg-white dark:bg-gray-800 mask mask-circle">
            <div className="w-24 min-h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      )}
      {auth2.currentUser && (
        <div className="navbar-end sm:w-1/3 md:w-1/3 lg:w-1/3 xl:w-1/3">
          <div className="dropdown dropdown-end">
            <label tabIndex={-10} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src={auth2.currentUser.photoURL?.toString() ?? "/avatar.png"}
                  alt={auth2.currentUser.displayName?.toString() ?? "User"}
                  title={auth2.currentUser.displayName?.toString()}
                  width={40}
                  height={40}
                />
              </div>
            </label>
            <ul
              tabIndex={-100}
              className="menu menu-sm dropdown-content mt-3 z-[10] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a
                  className="justify-between"
                  href={`/profile/`}
                >
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
