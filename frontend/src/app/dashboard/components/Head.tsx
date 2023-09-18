export default function Head({ title }: { title: React.ReactNode }) {
  return (
    <h1 className="my-8 px-7 text-3xl font-bold">{title}</h1>
  );
}
