// Shared by the home page (portfolio.js) and the project page (project.html).
// Projects here always show, even if Firebase is empty or unreachable.
// Fields: title, description (short card text), details (Markdown, long text),
// tech[], github, live, image (cover), gallery[] (image URLs), video (YouTube link), slug (optional), createdAt.
export const STATIC_PROJECTS = [
  {
    title: "Restaurant SaaS",
    description: "An online store platform for local businesses: a branded storefront, order tools for the team, and room to grow.",
    details:
      "Restaurant SaaS (branded Storecraft) helps local businesses in Pakistan get online fast. " +
      "Each business gets its own storefront link, a product catalog, and simple ordering for customers.\n\n" +
      "## What it does\n\n" +
      "- **Your store:** a branded storefront customers can open from one simple link.\n" +
      "- **Your team:** a live orders view so owners and staff always know what is new and what is being prepared.\n" +
      "- **Your growth:** weekly order insights so the business can see how it is growing.\n\n" +
      "## What I built\n\n" +
      "Replace this paragraph with what you personally built, the stack you used and what you learned.",
    tech: ["SaaS", "Web App"],
    live: "https://restaurant-saas-f6k5.vercel.app/",
    image: "/storecraft-home.webp",
    gallery: ["/storecraft-features.webp", "/storecraft-menu.webp"],
    video: "",
    createdAt: Number.MAX_SAFE_INTEGER, // keeps it first in the list
  },
];

export const slugify = (s = "") =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";

export const slugOf = (p) => slugify(p.slug || p.title);
