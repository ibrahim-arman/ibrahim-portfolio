// Public site logic: contact form -> Firebase, projects <- Firebase
import { db } from "./firebase.js";
import { optimize } from "./cloudinary.js";
import { STATIC_PROJECTS, slugOf } from "./projects-data.js";
import {
  ref, push, get, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// showToast() lives in script.js; fall back to alert if it is missing
const toast = (msg) => (typeof window.showToast === "function" ? window.showToast(msg) : alert(msg));

/* ---------- Contact form -> Realtime Database ---------- */
const form = document.getElementById("contact-form");
if (form) {
  const btn = document.getElementById("form-submit-btn");
  const idleHTML = btn ? btn.innerHTML : "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Simple spam guard: one message every 30 seconds per browser
    try {
      const last = Number(localStorage.getItem("lastMsg") || 0);
      if (Date.now() - last < 30000) return toast("Please wait a moment before sending another message.");
    } catch {}

    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const email = String(d.get("email") || "").trim();
    const message = String(d.get("message") || "").trim();
    const subject = String(d.get("subject") || "").trim() || `Message from ${name}`;

    if (!name || !email || !message) return toast("Please fill in your name, email, and message.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Please enter a valid email address.");

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
    }
    try {
      await push(ref(db, "messages"), {
        name: name.slice(0, 100),
        email: email.slice(0, 200),
        subject: subject.slice(0, 200),
        message: message.slice(0, 2000),
        createdAt: serverTimestamp(),
      });
      try { localStorage.setItem("lastMsg", String(Date.now())); } catch {}
      form.reset();
      toast("Message sent. Thank you!");
    } catch (err) {
      console.error(err);
      toast("Could not send. Please email iarman529@gmail.com instead.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = idleHTML;
      }
    }
  });
}

/* ---------- Projects <- Realtime Database ---------- */
const grid = document.getElementById("projects-grid");
if (grid) {
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const linkEl = (href, label, iconClass) => {
    const a = el("a", "project-link");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const icon = el("i", iconClass);
    a.append(icon, el("span", "", label));
    return a;
  };

  const merge = (fromDb) => {
    const seen = new Set(fromDb.map((p) => p.live).filter(Boolean));
    return [...STATIC_PROJECTS.filter((p) => !seen.has(p.live)), ...fromDb]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  };

  const draw = (items) => {
    grid.replaceChildren();
    if (!items.length) {
      grid.append(el("p", "projects-empty", "Projects will appear here soon."));
      return;
    }
    for (const p of items) {
      // "visible" is added so the scroll fade-in in script.js doesn't hide late-loaded cards
      const card = el("article", "card project-card fade-in visible");
      const tech = Array.isArray(p.tech) ? p.tech : [];

      if (p.image) {
        const img = el("img", "project-image");
        img.src = optimize(p.image, 800);
        img.alt = p.title ? `${p.title} screenshot` : "Project screenshot";
        img.loading = "lazy";
        card.append(img);
      }

      const header = el("div", "project-header");
      header.append(el("span", "project-category", tech[0] || "Project"));
      card.append(header);

      const body = el("div", "project-body");
      const h = el("h3", "project-title");
      const t = el("a", "", p.title);
      t.href = "/projects/" + slugOf(p);
      t.style.color = "inherit";
      t.style.textDecoration = "none";
      h.append(t);
      body.append(h, el("p", "project-description", p.description));
      card.append(body);

      if (tech.length) {
        const stack = el("div", "project-tech-stack");
        tech.forEach((t) => stack.append(el("span", "tech-pill", t)));
        card.append(stack);
      }

      const footer = el("div", "project-footer");
      const more = el("a", "project-link");
      more.href = "/projects/" + slugOf(p);
      more.append(el("i", "fas fa-circle-info"), el("span", "", "Details"));
      footer.append(more);
      if (p.github && /^https?:\/\//.test(p.github)) footer.append(linkEl(p.github, "GitHub", "fa-brands fa-github"));
      if (p.live && /^https?:\/\//.test(p.live)) footer.append(linkEl(p.live, "Live demo", "fas fa-arrow-up-right-from-square"));
      card.append(footer);

      grid.append(card);
    }
  };

  get(ref(db, "projects"))
    .then((snap) => draw(merge(snap.exists() ? Object.values(snap.val()) : [])))
    .catch((err) => {
      console.error(err);
      draw(merge([]));
    });
}

/* ---------- Codeforces <- public API (no key needed) ---------- */
const cfRating = document.getElementById("cf-rating");
if (cfRating) {
  const HANDLE = "ibrahim-arman";
  const API = "https://codeforces.com/api/";
  const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };

  const getJson = async (url) => {
    const r = await fetch(url);
    const j = await r.json();
    if (j.status !== "OK") throw new Error(j.comment || "Codeforces API error");
    return j.result;
  };

  (async () => {
    try {
      const [[user], rated, subs] = await Promise.all([
        getJson(`${API}user.info?handles=${HANDLE}`),
        getJson(`${API}user.rating?handle=${HANDLE}`),
        getJson(`${API}user.status?handle=${HANDLE}`),
      ]);
      const solved = new Set(
        subs.filter((s) => s.verdict === "OK").map((s) => `${s.problem.contestId}-${s.problem.index}`)
      );
      set("cf-rating", user.rating ?? "Unrated");
      set("cf-max", user.maxRating ?? "-");
      set("cf-rank", user.rank ? `${user.rank} (max: ${user.maxRank || user.rank})` : "Unrated");
      set("cf-contests", rated.length);
      set("cf-solved", solved.size);
    } catch (err) {
      console.error(err);
      set("cf-rank", "Live stats are unavailable right now. Open the profile to see them.");
    }
  })();
}
