// Shared helpers: Markdown -> sanitized HTML, YouTube embeds, small utilities
import { marked } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/+esm";

// A line that contains only a YouTube link becomes an embedded player
const YT = /^[ \t]*(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:\S*?&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})\S*[ \t]*$/gm;

export function render(md = "") {
  const ids = [];
  const src = md.replace(YT, (_, id) => `\n\n@@YT${ids.push(id) - 1}@@\n\n`);
  const html = DOMPurify.sanitize(marked.parse(src, { breaks: true }));
  return html.replace(/<p>@@YT(\d+)@@<\/p>/g, (_, i) =>
    `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${ids[i]}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`);
}

export const readTime = (t = "") => Math.max(1, Math.round(t.trim().split(/\s+/).length / 200)) + " min read";
export const fmt = (ts) => ts ? new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
export const $ = (id) => document.getElementById(id);
export const safeUrl = (u) => (/^https:\/\//.test(u || "") ? u : "");
export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
