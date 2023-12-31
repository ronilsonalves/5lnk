"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MinusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { array, ValidationError, object, string } from "yup";
import FileUploader from "@components/FileUploader";
import LinksPage from "@/types/LinksPage";
import Link from "@/types/Link";

interface ActionButtonsProps {
  page: LinksPage;
  onDelete: (id: string) => void;
  onSuccessfulUpdate: (data: LinksPage) => void;
  setSuccess: Function;
  userAccessToken: string;
}

let linksPageValidationSchema = object({
  title: string()
    .min(2, "Please provide a title with minimum of 2 characters")
    .required("Title is required"),
  description: string()
    .min(2, "Please provide a description with minimum of 16 characters")
    .required("Description is required"),
  alias: string()
    .matches(
      /^[a-zA-Z0-9-]+$/,
      "Alias can only contain letters, numbers and dashes"
    )
    .required("Alias is required"),
  imageURL: string().required("Image is required, please upload one"),
  links: array().of(
    object({
      original: string()
        .url("Please, provide a valid URL")
        .required("Link is required"),
      title: string().required("Title is required"),
    })
  ),
});

export default function ActionButtons({
  page,
  onDelete,
  onSuccessfulUpdate,
  setSuccess,
  userAccessToken,
}: ActionButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: page.id,
    title: page.title,
    description: page.description,
    imageURL: page.imageURL,
    alias: page.alias,
    links: page.links,
    userId: page.userId,
    finalURL: page.finalURL,
    views: page.views,
    createdAt: page.createdAt,
  } as LinksPage);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const addLink = () => {
    setFormData({
      ...formData,
      links: [
        ...formData.links,
        {
          id: "",
          title: "",
          original: "",
          shortened: "",
          finalUrl: "",
          userId: page.userId,
          pageRefer: page.id,
          createdAt: new Date(),
          clicks: 0,
        } as Link,
      ],
    });
  };

  const removeLink = async (index: number) => {
    setIsSubmitting(true);
    if (formData.links.length === 1) {
      setError("You can't delete all links from page");
      setTimeout(() => {
        setError("");
      }, 2000);
      setIsSubmitting(false);
      return;
    }
    if (formData.links[index].id !== "") {
      try {
        const response = await fetch("/api/links", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAccessToken}`,
          },
          body: JSON.stringify(formData.links[index]),
        });
        const data = await response.json();
        if (response.status !== 200) {
          setError(data.details);
          setTimeout(() => {
            setError("");
          }, 3000);
          setIsSubmitting(false);
          return;
        }
        // Success
        setSuccess("Link deleted successfully");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          ...formData,
          links: [...formData.links.filter((link, i) => i !== index)],
        });
        setIsSubmitting(false);
      } catch (e) {
        console.log(e);
        setError("An error occurred while deleting link");
        setTimeout(() => {
          setError("");
        }, 3000);
        return;
      }
    }
    setFormData({
      ...formData,
      links: [...formData.links.filter((link, i) => i !== index)],
    });
    setSuccess("Link deleted successfully");
    setTimeout(() => {
      setSuccess("");
    }, 3000);
    setIsSubmitting(false);
  };

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

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await linksPageValidationSchema.validate(formData, {
        abortEarly: false,
      });

      const response = await fetch("/api/pages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAccessToken}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.status !== 200) {
        setError(data.details);
        setTimeout(() => {
          setError("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }
      // Success
      onSuccessfulUpdate(data);
      setSuccess("Page updated successfully");
      (e.target as HTMLFormElement).reset();
      closeModalByPageId(`edit_${page.id}`);
      setIsSubmitting(false);
      return;
    } catch (e) {
      if (e instanceof ValidationError) {
        const errors: { [key: string]: string } = {};
        e.inner.forEach((validationErr) => {
          if (validationErr.path) {
            errors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }
      console.log(e);
      setError("An error occurred while updating page");
      setTimeout(() => {
        setError("");
      }, 3000);
      setIsSubmitting(false);
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

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLinkChanges = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    switch (e.target.name) {
      case "original":
        formData.links[index].original = e.target.value;
        break;
      case "title":
        formData.links[index].title = e.target.value;
        break;
      default:
        break;
    }
  };

  const handleAliasChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === page.alias) {
      setFormData({
        ...formData,
        alias: e.target.value,
      });
      setFormErrors({
        ...formErrors,
        alias: "",
      });
      return;
    }
    try {
      const response = await fetch(`/api/pages/?alias=${e.target.value}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAccessToken}`,
        },
      });

      await response.json();
      switch (response.status) {
        case 200:
          setFormErrors({
            ...formErrors,
            alias: "Alias already in use",
          });
          return;
        case 404:
          // If alias is not in use, set it to formData
          setFormData({
            ...formData,
            alias: e.target.value,
          });
          setFormErrors({
            ...formErrors,
            alias: "",
          });
          break;
        default:
          setFormErrors({
            ...formErrors,
            alias: "Unable to verify if alias is available.",
          });
          return;
      }
    } catch (e) {
      setError("Unable to verify alias");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
  };

  return (
    <div className="flex justify-start">
      <button
        className="btn btn-outline btn-sm hover:bg-indigo-500 hover:text-white"
        onClick={() => modalByPageId(`edit_${page.id}`)}
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
      {/* Dialog for edit modal */}
      <dialog id={`edit_${page.id}`} className="modal">
        <form
          method="dialog"
          className="modal-box w-full "
          onSubmit={handleUpdate}
        >
          <h3 className="font-bold text-lg">Editing your page: {page.title}</h3>
          <p className="py-4">
            You can edit your page here; you can change the title, description,
            image, add or remove links!
          </p>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Page's title</span>
            </label>
            <input
              name="title"
              type="text"
              placeholder="Page's title"
              className={
                formErrors.title ? "input input-error" : "input input-bordered"
              }
              required={true}
              defaultValue={formData.title}
              onChange={handleChanges}
            />
            {formErrors.title && (
              <span className="my-1 text-xs text-error">
                {formErrors.title}
              </span>
            )}
            <label className="label">
              <span className="label-text">Page's Alias/URL</span>
            </label>
            <input
              name="alias"
              type="text"
              placeholder="Page's title"
              className={
                formErrors.alias ? "input input-error" : "input input-bordered"
              }
              required={true}
              defaultValue={formData.alias}
              onChange={handleAliasChange}
            />
            {formErrors.alias && (
              <span className="my-1 text-xs text-error">
                {formErrors.alias}
              </span>
            )}
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              name="description"
              type="text"
              placeholder="Description"
              className={
                formErrors.description
                  ? "input input-error"
                  : "input input-bordered"
              }
              required={true}
              defaultValue={formData.description}
              onChange={handleChanges}
            />
            {formErrors.description && (
              <span className="my-1 text-xs text-error">
                {formErrors.description}
              </span>
            )}
            <label className="label">
              <span className="label-text">Image URL</span>
              <div className="m-2 flex flex-col place-items-center gap-2">
                {formData.imageURL && (
                  <Image
                    className="w-24 rounded-full"
                    src={formData.imageURL}
                    alt={formData.title}
                    width={460}
                    height={460}
                    loading="lazy"
                  />
                )}
                <FileUploader
                  name="imageURL"
                  fieldName="imageURL"
                  onChange={handleChanges}
                  s3Path={"pages/" + formData.alias}
                  disabled={formData.alias === ""}
                  accept={"image/jpg, image/jpeg, image/png"}
                  setError={setUploadError}
                />
                <span className="label-text-alt">
                  Only images .JPG, .JPEG or .PNG. Up to 3MB
                </span>
                {uploadError ||
                  (formErrors.imageURL && (
                    <span className="my-1 text-xs text-error">
                      {uploadError || formErrors.imageURL}
                    </span>
                  ))}
              </div>
            </label>
            <label className="py-2 font-bold text-lg">Links</label>
            {formData.links.map((link, index) => (
              <div key={index} className="flex flex-col gap-1 my-2">
                <div className="flex flex-row justify-between align-middle">
                  <span className="label-text">Link #{index + 1}</span>
                  <button
                    className="btn btn-sm btn-error"
                    title="Delete this link from page?"
                    type="button"
                    disabled={formData.links.length === 1 || isSubmitting}
                    onClick={() => removeLink(index)}
                  >
                    <MinusCircleIcon className="h-4 w-4" />
                  </button>
                </div>
                <label className="label">
                  <span className="label-text">URL</span>
                </label>
                <input
                  name="original"
                  type="URL"
                  placeholder="Put here the link"
                  className="input input-bordered"
                  required={true}
                  defaultValue={link.original}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleLinkChanges(e, index)
                  }
                />
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Put here the title"
                  className="input input-bordered"
                  required={true}
                  defaultValue={link.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleLinkChanges(e, index)
                  }
                />
                <div className="divider"></div>
              </div>
            ))}
            <button
              className="mb-4 btn btn-outline btn-sm hover:bg-green-400 hover:text-white"
              onClick={addLink}
              title="Add link"
            >
              Add new link
            </button>
          </div>
          {isSubmitting ? (
            <button
              type="submit"
              className="btn btn-primary rounded-full w-full"
              disabled={true}
            >
              <div
                className="loading loading-spinner loading-lg"
                title="Updating page..."
              ></div>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary rounded-full w-full"
              disabled={formErrors.alias !== undefined}
            >
              Update page
            </button>
          )}
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
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
      </dialog>
    </div>
  );
}
