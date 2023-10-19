"use client";

import { useState, useEffect, Suspense } from "react";
import { useFirebaseAuth } from "@/auth/firebase";
import PagesList from "./PagesList";
import LinksPage from "@/types/LinksPage";
import { getPages } from "@/lib/hooks/usePages";

export default function Pages() {
  const [error, setError] = useState("");
  const [userAccessToken, setUserAccessToken] = useState("");
  const [pages, setPages] = useState<LinksPage[]>([]); // [] is the initial state value
  const [loading, setLoading] = useState(true);
  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  useEffect(() => {
    getPages(userAccessToken).then((pages) => {
      setPages(pages);
      setLoading(false);
    });
  }, []);

  return (
    <div className="text-center mb-8">
        <div className="mb-6">
            <button className="btn btn-disabled">CREATE NEW PAGE BUTTON GOES HERE</button>
        </div>
        <Suspense fallback={<div className="">Loading...</div>}>
            <PagesList pages={pages} />
        </Suspense>
    </div>
  );
};