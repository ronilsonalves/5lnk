import ShortLink from "./ShortLink";
export default function Hero() {
  return (
    <div className="hero min-h-screen bg-base-200 w-full">
      <div className="hero-content text-center max-w-xs">
        <div className="max-w-xs md:max-w-sm">
          <h1 className="text-5xl font-bold">5lnk.live</h1>
          <p className="py-6">
            A faster URL shortener. With endless possibilities comming.
            Shorten your links and share them with the world.
          </p>
          <ShortLink />
        </div>
      </div>
    </div>
  );
}
