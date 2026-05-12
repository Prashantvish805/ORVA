export const siteConfig = {
  name: "ORVA",
  description: "Intelligent Regeneration, Redefined.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com",
  },
} as const;
