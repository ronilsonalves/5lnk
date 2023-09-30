export default function RedirectingPage({
  children,
}: {
  children: string | JSX.Element;
}) {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 h-screen w-full mx-auto flex flex-col justify-center text-center align-middle">
      <p className="loading loading-spinner loading-lg h-10 mx-auto"></p>
      {children}
    </div>
  );
}
