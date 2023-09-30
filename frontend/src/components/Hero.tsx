export default function Hero({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero min-h-screen bg-base-200 w-full">
      <div className="hero-content text-center max-w-md">
        <div className="max-w-xs md:max-w-sm">
          <h1 className="text-5xl font-bold">{process.env.NEXT_PUBLIC_SITE_NAME}</h1>
          <p className="py-6">
            A faster URL shortener. With endless possibilities comming.
            Shorten your links and share them with the world.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
