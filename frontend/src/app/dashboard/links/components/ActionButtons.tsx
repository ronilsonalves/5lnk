"use client";

import React, { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useFirebaseAuth } from "@/auth/firebase";

import Link from "@/types/Link";

interface ActionButtonsProps {
  link: Link;
  onDelete: (id: string) => void;
  onSuccessfulUpdate: (data: Link) => void;
  setSuccess: Function;
}

export default function ActionButtons({
  link,
  onDelete,
  onSuccessfulUpdate,
  setSuccess,
}: ActionButtonsProps) {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  const modalByShortened = (shortened: string) => {
    const modal = document.getElementById(shortened);
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const closeModalByShortened = (shortened: string) => {
    const modal = document.getElementById(shortened);
    if (modal) {
      // @ts-ignore
      modal.close();
    }
  };

  const handleConfirmation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmation = (e.target as HTMLFormElement).confirmation.value;
    if (confirmation === link.original) {
      handleDelete();
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newUrl = (e.target as HTMLFormElement).newUrl.value;
    if (newUrl !== link.original) {
      handleEdit(e);
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/links", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userAccessToken,
        },
        body: JSON.stringify(link),
      });

      const data = await response.json();

      if (response.status !== 200) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }
      // Success
      onDelete(link.id);
      setSuccess("Your link has been deleted successfully");
      closeModalByShortened(`del_${link.shortened}`);
      setIsSubmitting(false);
      return;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        setTimeout(() => {
          setError("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newUrl = (e.target as HTMLFormElement).newUrl.value;
    try {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userAccessToken,
        },
        body: JSON.stringify({ ...link, original: newUrl, clicks: 0 }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }
      // Success
      onSuccessfulUpdate(data);
      setSuccess("Your shortened link has been updated!");
      closeModalByShortened(`edit_${link.shortened}`);
      setIsSubmitting(false);
      return;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        setTimeout(() => {
          setError("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }
    }
  };

  return (
    <div className="flex justify-start">
      <button
        className="btn btn-outline btn-sm hover:bg-indigo-500 hover:text-white"
        onClick={() => modalByShortened(`edit_${link.shortened}`)}
        title="Edit shortened URL"
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>
      <button
        className="btn btn-outline btn-sm hover:bg-red-500 hover:text-white"
        onClick={() => modalByShortened(`del_${link.shortened}`)}
        title="Delete shortened URL"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
      {/* Dialog for delete modal */}
      <dialog id={`del_${link.shortened}`} className="modal">
        <form
          method="dialog"
          className="modal-box"
          onSubmit={handleConfirmation}
        >
          <h3 className="font-bold text-lg">
            Are you sure of delete the shortened link?
          </h3>
          <p className="py-4">
            Please, to confirm deletion of the shortened link write{" "}
            <i>{link.original}</i> below. Remember, this action is irreversible.
          </p>
          <div className="join w-full">
            <input
              name="confirmation"
              type="url"
              required={true}
              className="input input-bordered join-item rounded-l-full w-full"
              placeholder="https://example.com/"
            />
            {isSubmitting ? (
              <button
                type="submit"
                className="btn join-item rounded-r-full w-1/4"
                disabled={true}
              >
                <div
                  className="loading loading-spinner loading-lg"
                  title="Deleting URL..."
                ></div>
              </button>
            ) : (
              <button
                type="submit"
                className="btn join-item rounded-r-full w-1/4"
              >
                Delete
              </button>
            )}
            {/* <button
              type="submit"
              className="btn join-item rounded-r-full w-1/4"
            >
              Delete
            </button> */}
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>Cancel</button>
        </form>
      </dialog>
      {/* Dialog for edit modal */}
      <dialog id={`edit_${link.shortened}`} className="modal">
        <form
          method="dialog"
          className="modal-box"
          onSubmit={handleUpdate}
        >
          <h3 className="font-bold text-lg">
            Editing Link Shortened: {link.shortened}
          </h3>
          <p className="py-4">
            Paste or write below the new long URL. Remember,{" "}
            <i>this action is irreversible</i> and will erase all the statistics
            of the shortened link.
          </p>
          <div className="join w-full">
            <input
              name="newUrl"
              type="url"
              required={true}
              className="input input-bordered join-item rounded-l-full w-full"
              placeholder="https://yournewlong.url"
            />
            {isSubmitting ? (
              <button
                type="submit"
                className="btn join-item rounded-r-full w-1/3"
                disabled={true}
              >
                <div
                  className="loading loading-spinner loading-lg"
                  title="Updating URL..."
                ></div>
              </button>
            ) : (
              <button
                type="submit"
                className="btn join-item rounded-r-full w-1/3"
              >
                Update URL
              </button>
            )}
            {/* <button
              type="submit"
              className="btn join-item rounded-r-full w-1/3"
            >
              Update URL
            </button> */}
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>Cancel</button>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}