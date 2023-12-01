import React from "react";

import LinksPage from "@/types/LinksPage";
import PhoneMockup from "./PhoneMockup";

interface DetailsProps {
  page: LinksPage;
}

const Details: React.FC<DetailsProps> = ({ page }) => {
  return (
    <div className="flex flex-col w-full md:flex-row">
      <form className="space-y-8 md:w-2/4">
        <div className="form-control">
          <label className="label" htmlFor="title">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered"
            value={page.title}
            title="Title"
            name="title"
            disabled={true}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="alias">
            <span className="label-text">Alias/URL</span>
          </label>
          <input
            className="input input-bordered"
            value={page.alias}
            title="URL/Alias"
            name="alias"
            disabled={true}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="description">
            <span className="label-text">Description</span>
          </label>
          <input
            className="input input-bordered"
            value={page.description}
            title="Description"
            name="description"
            disabled={true}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="imageURL">
            <span className="label-text">Image URL</span>
          </label>
          {page.imageURL && (
            <input
              className="input input-bordered"
              value={page.imageURL}
              title="Image URL"
              name="imageURL"
              disabled={true}
            />
          )}
          {/* TODO: Add file uploader when update form */}
        </div>
        <div className="form-control">
            <label className="label" htmlFor="links">
                <span className="label-text">Links</span>
            </label>
            {page.links.map((link, index) => (
                <input
                    key={index}
                    className="input input-bordered"
                    value={link.original}
                    title="Link"
                    name={`link-${index}`}
                    disabled={true}
                />
            ))}
        </div>
      </form>
      <div className="flex flex-col py-4 md:w-2/4">
        <PhoneMockup page={page} />
      </div>
    </div>
  );
};

export default Details;
