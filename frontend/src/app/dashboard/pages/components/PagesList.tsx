import Link from "next/link";
import LinksPage from "@/types/LinksPage";
import ActionButtons from "./ActionButtons";

interface PagesListProps {
  pages: LinksPage[];
  userAccessToken: string;
  onSuccessfulUpdate: (data: LinksPage) => void;
  onDelete: (id: string) => void;
  setSuccess: Function;
}

const PagesList: React.FC<PagesListProps> = ({ pages, userAccessToken, onSuccessfulUpdate, onDelete, setSuccess }) => {
  return (
    <div className="oveflow-x-auto h-96">
      <table className="table my-8 py-7">
        {/* head */}
        <thead className="px-7 bg-base-200">
          <tr>
            <th></th>
            <th>Page Title</th>
            <th>URL</th>
            <th>Created</th>
            <th>Views</th>
          </tr>
        </thead>
        {/* body */}
        <tbody className="px-8">
          {pages.map((page) => (
            <tr key={page.id}>
              <td>{<ActionButtons page={page} userAccessToken={userAccessToken} onSuccessfulUpdate={onSuccessfulUpdate} onDelete={onDelete} setSuccess={setSuccess}/>}</td>
              <td>{page.title}</td>
              <td>
                <Link
                  href={page.finalURL + `?utm_source=Dashboard`}
                  target="_blank"
                >
                  {page.finalURL}
                </Link>
              </td>
              <td title={new Date(page.createdAt).toLocaleString()}>
                {new Date(page.createdAt).toLocaleString()}
              </td>
              <td>{page.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PagesList;