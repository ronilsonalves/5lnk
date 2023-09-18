"use client";
import { useState } from "react";

declare global {
  interface Window {
    short_url_form: any;
  }
}

export default function ShortLink() {
  const [shortUrl, setShortUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/public_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: (e.target as HTMLFormElement).url.value,
        domain: process.env.NEXT_PUBLIC_DEFAULT_SHORT_DOMAIN,
      }),
    });

    const data = await response.json();

    if (response.status !== 201) {
      setError(data.message);
      setTimeout(() => {
        setError("");
      }, 1500);
      return;
    }
    
    setShortUrl(data.finalUrl);
    (e.target as HTMLFormElement).reset();
    window.short_url_form.close();
  };

  const handleCopy = async (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(shortUrl);
    setCopySuccess(true);
  };

  return (
    <>
      {!shortUrl && (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => window.short_url_form.showModal()}
          >
            Shorten URL
          </button>
          <dialog id="short_url_form" className="modal">
              <form
                method="dialog"
                className="modal-box"
                onSubmit={handleSubmit}
              >
                <h3 className="font-bold text-lg">Shorten your URL!</h3>
                <p className="py-4">
                  Please, paste the URL you want to shorten in the field below.
                </p>
                <div className="join w-full">
                  <input
                    name="url"
                    type="url"
                    required={true}
                    className="input input-bordered join-item rounded-l-full w-full"
                    placeholder="https://example.com/"
                  />
                  <button
                    type="submit"
                    className="btn join-item rounded-r-full w-1/4"
                  >
                    Shorten URL
                  </button>
                </div>
              </form>
              <form method="dialog" className="modal-backdrop">
                <button>Close</button>
              </form>
            </dialog>
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
        </div>
      )}
      {shortUrl && (
        <div className="container w-full">
          <div className="join join-vertical w-full">
            <div className="mockup-browser border bg-base-300 max-w-sm">
              <div className="mockup-browser-toolbar">
                <div className="input">{shortUrl.replace("https://", "")}</div>
              </div>
            </div>
            {copySuccess ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Your shorten URL has been copied!</span>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={(e) => handleCopy(e)}
              >
                Copy link
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
