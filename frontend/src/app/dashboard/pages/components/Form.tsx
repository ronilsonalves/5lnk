"use client";

import { useState } from "react";
import Image from "next/image";
import { MinusCircleIcon } from "@heroicons/react/20/solid";
import { array, ValidationError, object, string } from "yup";
import FileUploader from "@components/FileUploader";
import Link from "@/types/Link";
import LinksPage from "@/types/LinksPage";

declare global {
  interface Window {
    create_page: any;
  }
}

interface FormProps {
  userAccessToken: string;
  onSuccessfulSubmit: (data: LinksPage) => void;
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

const Form: React.FC<FormProps> = ({ userAccessToken, onSuccessfulSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LinksPage>({
    id: "",
    title: "",
    description: "",
    imageURL: "",
    alias: "",
    links: [
      {
        id: "",
        title: "",
        original: "",
        shortened: "",
        finalUrl: "",
        userId: "",
        pageRefer: "",
        createdAt: new Date(),
        clicks: 0,
      },
    ] as Link[],
    userId: "",
    finalURL: "",
    views: 0,
    createdAt: new Date(),
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

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
            alias: "Unable to verify if alias is available",
          });
          return;
      }
    } catch (e) {
      console.log(e);
      setFormErrors({
        ...formErrors,
        alias: "Unable to verify if alias is available",
      });
      return;
    }
  };

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
          userId: "",
          pageRefer: "",
          createdAt: new Date(),
          clicks: 0,
        } as Link,
      ],
    });
  };

  const removeLink = (index: number) => {
    if (formData.links.length === 1) {
      setFormErrors({
        ...formErrors,
        links: "You can't remove all links from page.",
      });
      return;
    }
    setFormData({
      ...formData,
      links: [...formData.links.filter((link, i) => i !== index)],
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await linksPageValidationSchema.validate(formData, {
        abortEarly: false,
      });

      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userAccessToken,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageURL: formData.imageURL,
          alias: formData.alias,
          links: formData.links,
          userId: formData.userId,
        }),
      });

      const data = await response.json();

      if (response.status !== 201) {
        console.log(data);
        setIsSubmitting(false);
        setError(data.message);
        return;
      }

      (e.target as HTMLFormElement).reset();
      window.create_page.close();
      setIsSubmitting(false);
      onSuccessfulSubmit(data as LinksPage);
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
      if (e instanceof Error) {
        console.log(e.message);
        setError(e.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => window.create_page.showModal()}
      >
        Create new page
      </button>
      <dialog id="create_page" className="modal">
        <form
          method="dialog"
          className="modal-box w-full text-left"
          onSubmit={handleSubmit}
        >
          <h3 className="font-bold text-lg">Creating a new page</h3>
          <p className="py-4">Create a new page to group your links.</p>
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
              placeholder="/your-url"
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
                    title="Remove this link from page?"
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
                title="Creating page..."
              ></div>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary rounded-full w-full"
            >
              Create page
            </button>
          )}
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
    </>
  );
};

export default Form;
