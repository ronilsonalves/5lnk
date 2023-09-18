import {
  CurrencyDollarIcon,
  FolderIcon,
  GlobeAmericasIcon,
  LinkIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
} from "@heroicons/react/20/solid";

const features = [
  {
    name: "Short Links.",
    description: "Shorten any link with our easy to use, free URL shortener. ",
    icon: LinkIcon,
  },
  {
    name: "Analytics.",
    description:
      "Empower your decisions with our built-in analytics to track your visitors. ",
    icon: PresentationChartLineIcon,
  },
  {
    name: "Biolink Pages.",
    description: "Add multiple links to your bio with our bio link pages. ",
    icon: RectangleGroupIcon,
    isComingSoon: true,
  },
  {
    name: "Projects.",
    description: "Organize your links with our projects feature. ",
    icon: FolderIcon,
    isComingSoon: true,
  },
  {
    name: "Custom Domains.",
    description: "Use your own custom domain with our URL shortener. ",
    icon: GlobeAmericasIcon,
    isComingSoon: true,
  },
  {
    name: "Completly FREE.",
    description:
      "Don't worry about paying for our service, it's completly free. ",
    icon: CurrencyDollarIcon,
  },
];

export default function Features() {
  return (
    <section className="px-6 py-12 sm:py-16 lg:px-8" id="about">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
          About our URL Shortener
        </h2>
        <p className="mt-6 text-lg leading-8 ">
          We provide a simple and easy to use URL shortener. With endless
          possibilities comming.
        </p>
      </div>
      <div className="pb-24 sm:pb-32">
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <img
              src="http://localhost:3000/screenshot-dev.png"
              alt="App screenshot"
              className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 dark:ring-white-900/10"
              width={2432}
              height={1442}
            />
            <div className="relative" aria-hidden="true">
              <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%] dark:from-base-100" />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-white-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <div className="inline font-semibold text-white-900">
                  <feature.icon
                    className="absolute left-1 top-1 h-5 w-5 text-white-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </div>{" "}
                <div className="inline">{feature.description}</div>
                {feature.isComingSoon && (
                  <div>
                    <br />
                    <p className="stat-desc badge badge-secondary">
                      COMING SOON
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
