import React from "react";

import Link from "@/types/Link";

interface DetailsProps {
  link: Link;
};

const Details: React.FC<DetailsProps> = ({ link }) => {
  return (
    <form className="space-y-8">
      <div className="form-control">
        <label className="label" htmlFor="shortened">
          <span className="label-text">Short URL</span>
        </label>
        <input
          className="input input-bordered"
          value={link.finalUrl}
          placeholder="/short-alias"
          title="Shorten URL"
          name="shortened"
          disabled={true}
        ></input>
      </div>
      <div className="form-control">
        <label className="label" htmlFor="original">
          <span className="label-text">Original URL</span>
        </label>
        <input
          className="input input-bordered"
          value={link.original}
          placeholder="https://example.com/"
          title="Original URL"
          name="original"
          disabled={true}
        ></input>
      </div>
      <div className="form-control">
        <label className="label" htmlFor="title">
          <span className="label-text">Title</span>
        </label>
        <input
          className="input input-bordered"
          value={link.title}
          title="Title"
          name="title"
          disabled={true}
        ></input>
      </div>
      <div className="form-control">
        <label className="label" htmlFor="clicks">
          <span className="label-text">Clicks</span>
        </label>
        <input
          className="input input-bordered"
          value={link.clicks}
          title="Clicks"
          name="clicks"
          disabled={true}
        ></input>
      </div>
    </form>
  );
};

export default Details;
