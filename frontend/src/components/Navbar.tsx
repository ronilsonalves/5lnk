"use client";

import * as React from "react";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 p-0">
      <div className="navbar-start">
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
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/#about" title="About us and our features">About</a>
            </li>
            <li>
              <a href="/#blog" title="Some useful tips">Articles</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          {process.env.NEXT_PUBLIC_SITE_NAME}
        </a>
      </div>
      <div className="navbar-end">
        <a href="/auth/login" title="Login to your account">
          <button className="btn btn-ghost">Login</button>
        </a>
        <a href="/auth/register" title="Create your account">
          <button className="btn btn-primary">Register</button>
        </a>
      </div>
    </div>
  );
}
