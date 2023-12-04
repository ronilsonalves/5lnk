"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import LinksPage from "@/types/LinksPage";

interface ActionButtonsProps {
  page: LinksPage;
  onDelete: (id: string) => void;
  onSuccessfulUpdate: (data: LinksPage) => void;
  setSuccess: Function;
  userAccessToken: string;
}

export default function ActionButtons({
  page,
  onDelete,
  setSuccess,
  userAccessToken,
}: ActionButtonsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const modalByPageId = (pageId: string) => {
    const modal = document.getElementById(pageId);
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const closeModalByPageId = (pageId: string) => {
    const modal = document.getElementById(pageId);
    console.log(modal);
    if (modal) {
      // @ts-ignore
      modal.close();
    }
  };

  const handleConfirmation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmation = (e.target as HTMLFormElement).confirmation.value;
    if (confirmation === page.alias) {
      handleDelete();
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleEditClickButton = async () => {
    setIsSubmitting(true);
    if (router) {
      router.push(`/dashboard/pages/${page.id}`);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAccessToken}`,
        },
        body: JSON.stringify(page),
      });

      const data = await response.json();

      if (response.status !== 200) {
        setError(data.details);
        setIsSubmitting(false);
        return;
      }
      // Success
      onDelete(page.id);
      setSuccess("Page deleted successfully");
      closeModalByPageId(`del_${page.id}`);
      setIsSubmitting(false);
      return;
    } catch (e) {
      setError("Unable to delete page");
      setTimeout(() => {
        setError("");
      }, 3000);
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <div className="flex justify-start">
      <button
        className="btn btn-outline btn-sm hover:bg-indigo-500 hover:text-white"
        onClick={() => handleEditClickButton()}
        title="Edit Page"
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>
      <button
        className="btn btn-outline btn-sm hover:bg-red-500 hover:text-white"
        onClick={() => modalByPageId(`del_${page.id}`)}
        title="Delete Page"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
      {/* Dialog for delete modal */}
      <dialog id={`del_${page.id}`} className="modal">
        <form
          method="dialog"
          className="modal-box"
          onSubmit={handleConfirmation}
        >
          <h3 className="font-bold text-lg">
            Are you sure you want to delete this page?
          </h3>
          <p className="py-4">
            Please, to confirm deletion of the page, type the page's alias [
            <i>{page.alias}</i>] address below. Remember, this action is
            irreversible.
          </p>
          <div className="join w-full">
            <input
              name="confirmation"
              type="text"
              placeholder="Page's alias"
              className="input input-bordered join-item rounded-l-full w-full"
              required={true}
            />
            {isSubmitting ? (
              <button
                type="submit"
                className="btn join-item rounded-r-full w-1/4"
                disabled={true}
              >
                <div
                  className="loading loading-spinner loading-lg"
                  title="Deleting Page..."
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
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>Cancel</button>
        </form>
      </dialog>
    </div>
  );
}
