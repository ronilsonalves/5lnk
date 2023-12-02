"use client";

import React from "react";
import UpdateForm from "./UpdateForm";
import PhoneMockup from "./BrowserMockup";
import LinksPage from "@/types/LinksPage";


interface DetailsProps {
  page: LinksPage;
}

const Details: React.FC<DetailsProps> = ({ page }) => {
  const [updatedPage, setUpdatedPage] = React.useState<LinksPage>(page);
  return (
    <div className="flex flex-col justify-center w-full min-h-screen md:flex-row">
      <UpdateForm page={page} handlePageChanges={setUpdatedPage}/>
      <div className="flex flex-col w-full mx-auto md:w-2/4 xl:w-2/5 mt-4">
        <PhoneMockup page={updatedPage} />
      </div>
    </div>
  );
};

export default Details;
