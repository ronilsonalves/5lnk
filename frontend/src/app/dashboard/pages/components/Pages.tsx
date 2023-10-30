"use client";

import { useState, useEffect, Suspense } from "react";
import { useFirebaseAuth } from "@/auth/firebase";
import Form from "./Form";
import PagesList from "./PagesList";
import LinksPage from "@/types/LinksPage";
import { getPages } from "@/lib/hooks/usePages";

export default function Pages() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [pages, setPages] = useState<LinksPage[]>([]); // [] is the initial state value
  const [successMsg, setSuccessMsg] = useState("");
  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  const handleSuccessfulSubmit = (data: LinksPage) => {
    setPages((pages) => [...pages, data]);
  };

  const onSuccessfulUpdate = (data: LinksPage) => {
    setPages((pages) =>
      pages.map((page) => (page.id === data.id ? data : page))
    );
    setTimeout(() => {
      setSuccessMsg("");
    }, 1500);
  };

  const onDelete = (id: string) => {
    setPages((pages) => pages.filter((page) => page.id !== id));
    setTimeout(() => {
      setSuccessMsg("");
    }, 1500);
  };

  useEffect(() => {
    getPages(userAccessToken).then((pages) => {
      setPages(pages);
    });
  }, []);

  return (
    <div className="text-center mb-8">
        <div className="mb-6">
            <Form userAccessToken={userAccessToken} onSuccessfulSubmit={handleSuccessfulSubmit} />
        </div>
        <Suspense fallback={<div className="">Loading...</div>}>
            <PagesList pages={pages} userAccessToken={userAccessToken} onSuccessfulUpdate={onSuccessfulUpdate} onDelete={onDelete} setSuccess={setSuccessMsg} />
        </Suspense>
        {successMsg && (
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
            <p>{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};