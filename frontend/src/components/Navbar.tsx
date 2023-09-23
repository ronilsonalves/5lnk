"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/auth/context";
import { useFirebaseAuth } from "@/auth/firebase";
import { signOut } from "firebase/auth";
import { useLoadingCallback } from "react-loading-hook";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { getFirebaseAuth } = useFirebaseAuth();
  const auth = getFirebaseAuth();
  const { user } = useAuth();
  const [handleLogout] = useLoadingCallback(async () => {
    await signOut(auth);
    await fetch("/api/logout", {
      method: "GET",
    });
    window.location.reload();
  });

  return (
    <header className="navbar bg-base-200 p-0">
      {!pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/profile") ? (
        <div className="navbar-start w-1/3">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
            >
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/#about" title="About us and our features">
                  About
                </a>
              </li>
              <li>
                <a href="/blog" title="Some useful tips">
                  Articles
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="navbar-start w-1/3"></div>
      )}
      <div className="navbar-center w-1/3 justify-center">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          {process.env.NEXT_PUBLIC_SITE_NAME}
        </a>
      </div>
      {user ? (
        <div className="navbar-end sm:w-1/3">
          <div className="dropdown dropdown-end">
            <label tabIndex={-10} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src={user.photoURL?.toString() ?? "/avatar.png"}
                  alt={user.displayName?.toString() ?? "User"}
                  title={user.displayName?.toString()}
                  width={40}
                  height={40}
                />
              </div>
            </label>
            <ul
              tabIndex={-100}
              className="menu menu-sm dropdown-content mt-3 z-[10] p-4 shadow bg-base-200 rounded-box w-52"
            >
              <li>
                {pathname.startsWith("/blog") || pathname.length === 1 ? (
                  <a className="justify-between" href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>
                    Dashboard
                    <span className="badge">New</span>
                  </a>
                ) : (
                  <a className="justify-between" href={`${process.env.NEXT_PUBLIC_SITE_URL}/profile/`}>
                    Profile
                    <span className="badge">New</span>
                  </a>
                )}
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="navbar-end w-1/3 p-1">
          <a href="/auth/login" title="Login to your account">
            <button className="btn btn-ghost" title="Login to your account">Login</button>
          </a>
          <a href="/auth/register" title="Create your account">
            <button className="btn btn-primary" title="Create your account">Register</button>
          </a>
        </div>
      )}
    </header>
  );
}