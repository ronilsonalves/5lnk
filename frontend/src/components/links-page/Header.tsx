import Image from "next/image";

interface HeaderProps {
  title: string;
  description: string;
  avatarUrl: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatarUrl,
}) => {
  return (
    <div className="xs:max-w-xs">
      <Image
        className="mx-auto w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
        src={avatarUrl}
        alt={title}
        width={460}
        height={460}
        priority={true}
      />
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="my-4">{description}</p>
    </div>
  );
};

export default Header;
