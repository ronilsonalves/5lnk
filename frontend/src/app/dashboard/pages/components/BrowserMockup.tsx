import React from "react";
import Links from "@/components/links-page/Links";
import Header from "@/components/links-page/Header";

import LinksPage from "@/types/LinksPage";

interface BrowserMockupProps {
  page: LinksPage;
}

const BrowserMockup: React.FC<BrowserMockupProps> = ({ page }) => {
  const { imageURL, title, description, links, finalURL } = page;

  return (
    <div className="mockup-browser border border-base-300 md:ml-4 sticky top-0">
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-300">{finalURL}</div>
      </div>
      <div className="text-center px-4 py-16 border-t border-base-300">
        <Header title={title} description={description} avatarUrl={imageURL} />
        <Links links={links} />
      </div>
    </div>
  );
};

export default BrowserMockup;
