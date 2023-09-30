"use client";

import { Suspense, useEffect, useState } from "react";
import { useFirebaseAuth } from "@/auth/firebase";
import Link from "@/types/Link";
import LinksList from "../links/components/LinksList";
import { userLinks } from "@/lib/hooks/useLinks";
import Form from "../links/components/Form";
import LoadingLinks from "@/components/skeleton/LoadingLinks";

export default function DashboardRecentLinks() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [links, setLinks] = useState<Link[]>([]); // [] is the initial state value
  const [success, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  const handleSuccessfulSubmit = (data: Link) => {
    setLinks((links) => [...links, data]);
  };

  const onSuccessfulUpdate = (data: Link) => {
    setLinks((links) => links.map((link) => link.id === data.id ? data : link));
  };

  const onDelete = (id: string) => {
    setLinks((links) => links.filter((link) => link.id !== id));
    setTimeout(() => {
      setSuccessMsg("");
    }, 1500);
  };

  useEffect(() => {
    userLinks(userAccessToken, setLinks, setError);
  }, []);

  return (
    <>
      <div className="mt-2 flex flex-row shrink-0 items-center justify-between">
        <section className="my-2 px-6 flex flex-col">
          <h2 className="text-3xl font-bold">Recent links</h2>
          <p className="mt-1 text-1xl">Your recently created links</p>
        </section>
      </div>

      <div className="mx-6">
        <Form onSuccessfulSubmit={handleSuccessfulSubmit} />
        <Suspense fallback={<LoadingLinks />}>
          <LinksList
            links={links}
            onDelete={onDelete}
            onSuccessfulUpdate={onSuccessfulUpdate}
            setSuccess={setSuccessMsg}
          />
        </Suspense>
        {error && (
          <div className="toast toast-end">
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error || error.toString()}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="toast toast-end">
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>{success}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row-reverse mb-4 pr-6">
        <a href="/dashboard/links">
          <button className="btn btn-neutral">View all links</button>
        </a>
      </div>
    </>
  );
}
