import Link from "next/link";
import * as link from "@/types/Link";
import { GlobeAmericasIcon } from "@heroicons/react/24/outline";

interface LinksProps {
  links: link.default[];
}

const Links: React.FC<LinksProps> = ({ links }) => {
  return (
    <div className="join join-vertical">
      {links.map((link) => (
        <Link
          className="btn btn-primary my-2 flex flex-row justify-start items-center h-14 w-80 shadow-md rounded-md hover:animate-pulse"
          key={link.id}
          href={link.finalUrl}
          title={link.title}
        ><GlobeAmericasIcon
        className="h-8 w-8 mr-2"
        />
        <span>{link.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default Links;