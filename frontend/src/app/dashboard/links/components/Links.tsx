"use client";

import { useState, useEffect, Suspense } from "react";
import { useFirebaseAuth } from "@/auth/firebase";
import Form from "./Form";
import LinksList from "./LinksList";
import Link from "@/types/Link";
import { userLinks } from "@/lib/hooks/useLinks";
import LoadingLinks from "@/components/skeleton/LoadingLinks";

export default function Links() {
  const [error, setError] = useState("");
  const [userAccessToken, setUserAccessToken] = useState("");
  const [links, setLinks] = useState<Link[]>([]); // [] is the initial state value
  const [loading, setLoading] = useState(true);
  const [success, setSuccessMsg] = useState("");
  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  const handleSuccessfulSubmit = (data: Link) => {
    setLinks((links) => [...links, data]);
  };

  const onSuccessfulUpdate = (data: Link) => {
    setLinks((links) =>
      links.map((link) => (link.id === data.id ? data : link))
    );
    setTimeout(() => {
      setSuccessMsg("");
    }, 1500);
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
    <div className="text-center mb-8">
      <div className="mb-6">
        <Form onSuccessfulSubmit={handleSuccessfulSubmit} />
      </div>
      <Suspense fallback={<LoadingLinks />}>
        <LinksList
          links={links}
          onDelete={onDelete}
          onSuccessfulUpdate={onSuccessfulUpdate}
          setSuccess={setSuccessMsg}
        />
      </Suspense>
      {!loading && links.length === 0 && (
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-base-900">
            No shortened links
          </h3>
          <p className="mt-1 text-sm text-base-500">
            Get started by shortening a new URL.
          </p>
        </div>
      )}
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
            <span>{error}</span>
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
  );
}
