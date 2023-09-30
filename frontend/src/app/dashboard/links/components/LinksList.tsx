import Link from "next/link";
import ActionButtons from "./ActionButtons";
import * as link from "@/types/Link";

interface LinksListProps {
  links: link.default[];
  onDelete: (id: string) => void;
  onSuccessfulUpdate: (data: link.default) => void;
  setSuccess: Function;
}

const LinksList: React.FC<LinksListProps> = ({links,onDelete, onSuccessfulUpdate ,setSuccess}) => {
  return (
    <div className="overflow-x-auto h-96">
      <table className="table my-8 py-7">
        {/* head */}
        <thead className="px-7 bg-base-200">
          <tr>
            <th></th>
            <th>Original URL</th>
            <th>Shortened</th>
            <th>Created</th>
            <th>Clicks</th>
          </tr>
        </thead>
        <tbody className="px-8">
          {links.map((link) => (
            <tr key={link.id}>
            <td>{<ActionButtons link={link} onDelete={onDelete} onSuccessfulUpdate={onSuccessfulUpdate} setSuccess={setSuccess}/>}</td>
            <td>{link.original}</td>
            <td><Link href={link.finalUrl} target="_blank">/{link.shortened}</Link></td>
            <td title={new Date(link.createdAt).toLocaleString()}>{new Date(link.createdAt).toLocaleString()}</td>
            <td>{link.clicks}</td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LinksList;