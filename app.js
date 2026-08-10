/* ============================================================
   findrix AI visibility audit report
   Vanilla JS. Data is the audit result; swap it for live
   API output later without touching the markup.
   ============================================================ */

const META = {
  site: "susinsight.com",
  generated: "August 9, 2026",
  duration: "42s",
  score: 68,
  verdict: "Almost there",
  narrative:
    "Susinsight is technically solid. 16 of 30 checks pass and the HTML, canonicals, sitemap, and Open Graph are clean. Three things are blocking AI assistants from quoting you: AI crawlers get a 403 at the edge, the heading structure is messy, and the Article and FAQ schema need work. Clear those first, then everything else compounds."
};

const CATEGORIES = [
  { name: "Access", score: 71, checks: 10 },
  { name: "Schema", score: 73, checks: 10 },
  { name: "Content", score: 66, checks: 5 },
  { name: "AI interaction", score: null, checks: 2 },
  { name: "Performance", score: 61, checks: 3 }
];

const STATUS_LABEL = { pass: "Pass", warn: "Partial", fail: "Missing" };

/* Each check: title, status (pass/warn/fail), priority, category,
   impact (one line), action (one explicit instruction), optional code. */
const CHECKS = [
  // ---- Access
  {
    id: "crawler-access", category: "Access", status: "warn", priority: "P1",
    title: "AI crawler access (live probe)",
    impact: "ChatGPT, Claude, and Perplexity get a 403 from your edge and cannot read a single page.",
    action: "Allow the verified AI bots in Cloudflare and keep robots.txt open.",
    code: `# Cloudflare WAF rule to allow AI crawlers
# Action: Skip all managed rules for matching requests
(http.user_agent contains "GPTBot") or
(http.user_agent contains "OAI-SearchBot") or
(http.user_agent contains "ChatGPT-User") or
(http.user_agent contains "ClaudeBot") or
(http.user_agent contains "PerplexityBot") or
(http.user_agent contains "Google-Extended") or
(http.user_agent contains "anthropic-ai") or
(http.user_agent contains "meta-externalagent")`
  },
  {
    id: "robots-txt", category: "Access", status: "warn", priority: "P1",
    title: "AI bots allowed in robots.txt",
    impact: "robots.txt explicitly disallows GPTBot, ClaudeBot, Google-Extended, and others.",
    action: "Remove the Disallow rules for the bots you want citing you.",
    code: `# public/robots.txt (target state)
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://susinsight.com/sitemap.xml
Sitemap: https://susinsight.com/feed.xml`
  },
  {
    id: "llms-txt", category: "Access", status: "fail", priority: "P3",
    title: "/llms.txt manifest present",
    impact: "Assistants have no curated map of your best pages, so they crawl all 444 to guess.",
    action: "Publish /llms.txt with your key pages and latest stories.",
    code: `# public/llms.txt
# Susinsight
> Susinsight is an independent media outlet covering
> sustainability, climate, and development in Africa.

## Key Pages
- [All Stories](https://susinsight.com/stories): The full archive
- [Ask Susinsight](https://susinsight.com/ask): Our AI assistant

## Latest Stories
- [Lagos and the Circular Economy](https://susinsight.com/lagos-waste-circular-economy)`
  },
  {
    id: "titles", category: "Access", status: "warn", priority: "P3",
    title: "Page titles unique and well-sized",
    impact: "13 of 50 sampled pages share a title, and the homepage title is 8 characters.",
    action: "Give every page a unique 30 to 60 character title."
  },
  {
    id: "descriptions", category: "Access", status: "warn", priority: "P3",
    title: "Meta descriptions present and unique",
    impact: "6 of 50 descriptions are out of the 50 to 160 character range.",
    action: "Write a unique 50 to 160 character description per page."
  },
  {
    id: "raw-html", category: "Access", status: "pass", priority: "P1",
    title: "Content present in raw HTML (no JS needed)",
    impact: "HTML is server-rendered, so crawlers and AI assistants see your real content.",
    action: "Keep server-side rendering on. Nothing to fix."
  },
  {
    id: "canonical", category: "Access", status: "pass", priority: "P2",
    title: "Canonical tags well-formed",
    impact: "Zero mismatched canonicals across 50 pages.",
    action: "Nothing to fix."
  },
  {
    id: "sitemap", category: "Access", status: "pass", priority: "P2",
    title: "Sitemap.xml exists and is valid",
    impact: "444 URLs, referenced from robots.txt.",
    action: "Nothing to fix."
  },
  {
    id: "hreflang", category: "Access", status: "pass", priority: "P3",
    title: "hreflang tags well-formed",
    impact: "The site is monolingual, so omitting hreflang is correct.",
    action: "Nothing to fix."
  },
  {
    id: "opengraph", category: "Access", status: "pass", priority: "P3",
    title: "Open Graph tags complete",
    impact: "og:title, og:description, og:image, and og:type are all present.",
    action: "Nothing to fix."
  },

  // ---- Schema
  {
    id: "faq", category: "Schema", status: "fail", priority: "P2",
    title: "FAQPage schema present",
    impact: "No FAQ markup exists, and FAQ is the format assistants reach for first.",
    action: "Mark up your most asked questions with FAQPage JSON-LD.",
    code: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How does Susinsight select its stories?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "We report on sustainability, climate, and development across Africa through an editorial team of African journalists."
    }
  }]
}`
  },
  {
    id: "article", category: "Schema", status: "fail", priority: "P3",
    title: "Article schema on blog content",
    impact: "The author name serializes as a nested object, so the schema is invalid and posts are not fully citeable.",
    action: "Fix the author field to a plain string and keep one schema type per post.",
    code: `// Before: name is a GraphQL node object, not a string
name: post.author || "Susinsight"

// After:
name: post.author?.node?.name || "Susinsight Staff",
url: absoluteUrl("/author/" + (post.author?.node?.slug || "susinsight-staff"))`
  },
  {
    id: "breadcrumb", category: "Schema", status: "warn", priority: "P3",
    title: "BreadcrumbList schema present",
    impact: "Only 16 of 50 pages carry breadcrumbs, so assistants lose the hierarchy on the rest.",
    action: "Add BreadcrumbList to every internal page."
  },
  {
    id: "org-jsonld", category: "Schema", status: "pass", priority: "P1",
    title: "Organization JSON-LD present",
    impact: "Your brand entity is present with name, URL, logo, and social profiles.",
    action: "Nothing to fix."
  },
  {
    id: "sameas", category: "Schema", status: "pass", priority: "P2",
    title: "Brand linked to entity hubs (sameAs)",
    impact: "Four hubs are linked, including LinkedIn.",
    action: "Add Wikidata and Wikipedia to sameAs once they exist."
  },
  {
    id: "product", category: "Schema", status: "pass", priority: "P3",
    title: "Product schema on commerce pages",
    impact: "Not an ecommerce site, so the check does not apply.",
    action: "Nothing to fix."
  },
  {
    id: "graph", category: "Schema", status: "pass", priority: "P3",
    title: "Structured-data entities interlinked (@id graph)",
    impact: "Entities resolve through @id references instead of being guessed.",
    action: "Nothing to fix."
  },
  {
    id: "parse", category: "Schema", status: "pass", priority: "P3",
    title: "Structured data parses cleanly",
    impact: "No JSON parse errors in your structured data.",
    action: "Note: the author bug above is semantic, so it passed this check but still needs the fix."
  },
  {
    id: "software", category: "Schema", status: "pass", priority: "P3",
    title: "SoftwareApplication schema on app pages",
    impact: "The /ask assistant is a feature, not an app product page, so the check does not apply.",
    action: "Nothing to fix."
  },
  {
    id: "website-jsonld", category: "Schema", status: "pass", priority: "P3",
    title: "WebSite JSON-LD present",
    impact: "Pairs with Organization and adds a site search action.",
    action: "Nothing to fix."
  },

  // ---- Content
  {
    id: "headings", category: "Content", status: "fail", priority: "P2",
    title: "Logical heading hierarchy",
    impact: "The homepage and /stories have no h1, and /contact skips levels. AI extractors rely on this to build summaries.",
    action: "Give every page exactly one h1 and no skipped heading levels.",
    code: `<!-- Homepage: one h1 with no visual change -->
<h1 class="visually-hidden">Susinsight</h1>
<!-- hero continues with h2 and h3 as today -->

<!-- /stories: promote the existing page title to h1 -->
<h1>All Stories</h1>`
  },
  {
    id: "freshness", category: "Content", status: "warn", priority: "P2",
    title: "Content freshness signals present",
    impact: "Your newest article is 86 days old, close to the 90 day freshness preference.",
    action: "Keep dateModified accurate and current, and never set it to a future date."
  },
  {
    id: "alt", category: "Content", status: "pass", priority: "P2",
    title: "Images have descriptive alt text",
    impact: "1262 of 1264 images have alt text.",
    action: "Nothing to fix."
  },
  {
    id: "links", category: "Content", status: "pass", priority: "P2",
    title: "Internal-link depth is shallow",
    impact: "139 unique internal links from the homepage keep deep pages discoverable.",
    action: "Nothing to fix."
  },
  {
    id: "landmarks", category: "Content", status: "pass", priority: "P2",
    title: "HTML5 landmark elements present",
    impact: "Clean main, nav, and section landmarks on all 50 sampled pages.",
    action: "Nothing to fix."
  },

  // ---- AI interaction
  {
    id: "wikidata", category: "AI interaction", status: "warn", priority: "P3",
    title: "Recognized as a Wikidata entity",
    impact: "No Wikidata item lists susinsight.com as the official website, so assistants cannot confirm you as a real entity.",
    action: "Create a Wikidata item with property P856 set to your domain. A few hours, compounds over time."
  },
  {
    id: "wikipedia", category: "AI interaction", status: "warn", priority: "P3",
    title: "Has a Wikipedia article",
    impact: "No article exists, so Wikipedia is missing a signal it would use to recommend the brand.",
    action: "Build independent, reliable coverage, then pursue a well sourced article. This is a long-term brand signal, not a defect."
  },

  // ---- Performance
  {
    id: "cwp", category: "Performance", status: "warn", priority: "P1",
    title: "Core Web Vitals (LCP / INP / CLS / TTFB)",
    impact: "No field data was returned, so this is currently unmeasured.",
    action: "Run PageSpeed Insights, then act only if LCP, INP, or CLS miss the targets."
  },
  {
    id: "ttfb", category: "Performance", status: "warn", priority: "P2",
    title: "Fast server response (TTFB)",
    impact: "No measurement was available. AI crawlers abandon slow origins on busy days.",
    action: "Measure TTFB first, then cache HTML at the edge if it is slow."
  },
  {
    id: "payload", category: "Performance", status: "pass", priority: "P2",
    title: "HTML payload size is reasonable",
    impact: "The homepage is 442 KB, under the 1 MB limit for AI crawlers.",
    action: "Nothing to fix."
  }
];

const GAPS = [
  { rank: 1, status: "warn", priority: "P1", title: "AI crawler access", impact: "ChatGPT, Claude, and Perplexity get a 403 and cannot read any page.", action: "Allow the verified AI bots in Cloudflare. This is the single biggest lever." },
  { rank: 2, status: "warn", priority: "P1", title: "AI bots blocked in robots.txt", impact: "GPTBot, ClaudeBot, and Google-Extended are explicitly disallowed.", action: "Remove those Disallow rules, or keep them as a deliberate policy choice." },
  { rank: 3, status: "fail", priority: "P2", title: "Heading structure", impact: "No h1 on the homepage or /stories, so AI extractors guess what each page is about.", action: "One h1 per page, no skipped levels, no visual change needed." },
  { rank: 4, status: "fail", priority: "P2", title: "FAQPage schema", impact: "No FAQ markup, and FAQ is what assistants quote first.", action: "Mark up your most asked questions." },
  { rank: 5, status: "fail", priority: "P3", title: "Article schema author bug", impact: "The author name is a nested object, so posts are not fully citeable.", action: "Fix one line in story-page.tsx to use a plain author string." },
  { rank: 6, status: "fail", priority: "P3", title: "No /llms.txt", impact: "Assistants have no curated index of your best pages.", action: "Publish the file. Fastest win on this report." },
  { rank: 7, status: "warn", priority: "P1", title: "Core Web Vitals unmeasured", impact: "The grader returned no field data, so nothing is known yet.", action: "Measure first. Do not optimize against a guess." }
];

const PLAN = [
  {
    role: "Dev and infrastructure", icon: "server",
    items: [
      { id: "plan-dev-1", p: "P1", text: "Allow AI crawlers in Cloudflare. Turn off Bot Fight Mode for verified bots or add an exception, and stop Cloudflare managed robots.txt from disallowing GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.", policyBlocked: true },
      { id: "plan-dev-2", p: "P3", text: "Publish /llms.txt so assistants get a curated index of your best pages." },
      { id: "plan-dev-3", p: "P1", text: "Measure Core Web Vitals and TTFB with real field data before touching performance." }
    ]
  },
  {
    role: "Frontend", icon: "code",
    items: [
      { id: "plan-fe-1", p: "P2", text: "Give every page exactly one h1 and no skipped heading levels. The homepage and /stories have no h1 today." },
      { id: "plan-fe-2", p: "P3", text: "Fix the NewsArticle JSON-LD author. The name serializes as a nested object, which invalidates the schema." },
      { id: "plan-fe-3", p: "P3", text: "Make page titles unique and well sized. The homepage title is 8 characters." }
    ]
  },
  {
    role: "Content", icon: "pen",
    items: [
      { id: "plan-con-1", p: "P3", text: "Write a unique 50 to 160 character meta description per page." },
      { id: "plan-con-2", p: "P2", text: "Plan FAQ content from the questions readers actually ask, then mark it up." },
      { id: "plan-con-3", p: "P2", text: "Keep dateModified accurate and current so sources look fresh." }
    ]
  }
];

const LONGTERM = [
  {
    title: "Wikidata entity",
    status: "warn", priority: "P3",
    impact: "Assistants ground brand facts in Wikidata. Without an item, they cannot confirm Susinsight as a real entity.",
    action: "Create a Wikidata item with your name, website (property P856), logo, and key identifiers."
  },
  {
    title: "Wikipedia article",
    status: "warn", priority: "P3",
    impact: "A Wikipedia article is one of the strongest signals that a brand is notable and real.",
    action: "Build independent, reliable coverage, then pursue a well sourced article linked to your Wikidata item."
  }
];

const ICONS = {
  server: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
  code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  pen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>'
};

/* ================= renderers ================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const chip = (status) => `<span class="chip chip--${status}">${STATUS_LABEL[status]}</span>`;
const tag = (priority) => `<span class="tag tag--${priority === "P1" ? "p1" : ""}">${priority}</span>`;

function renderHero() {
  $("#narrative").textContent = META.narrative;
  $("#hero-site").textContent = META.site;
  $("#hero-meta-date").textContent = META.generated;
  $("#hero-meta-dur").textContent = `Ran in ${META.duration}`;

  const C = 2 * Math.PI * 52;
  const fill = $("#score-fill");
  fill.style.strokeDasharray = C;
  const target = C * (1 - META.score / 100);
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.strokeDashoffset = target; }));
  $("#score-num").textContent = META.score;
  $("#score-verdict").textContent = META.verdict;
}

function renderCats() {
  const wrap = $("#cats");
  wrap.innerHTML = CATEGORIES.map((c) => {
    const scored = c.score !== null;
    return `
      <div class="cat">
        <div class="cat__top">
          <span class="cat__name">${c.name}</span>
          <span class="cat__pct">${scored ? `${c.score}%` : "n/a"}</span>
        </div>
        <div class="cat__bar" aria-hidden="true"><div class="cat__fill" data-score="${scored ? c.score : 0}" data-scored="${scored}"></div></div>
        <div class="cat__checks">${c.checks} checks &middot; ${scored ? `${c.score}% of the category` : "not scored"}</div>
      </div>`;
  }).join("");
  requestAnimationFrame(() => {
    $$(".cat__fill").forEach((el) => {
      if (el.dataset.scored === "true") el.style.width = `${el.dataset.score}%`;
      else el.style.background = "#D6DCD8";
    });
  });
}

function renderPlan() {
  const wrap = $("#plan-roles");
  wrap.innerHTML = PLAN.map((role) => `
    <div class="plan__role">
      <div class="plan__role-head">
        <span class="plan__role-icon" aria-hidden="true">${ICONS[role.icon]}</span>
        <span class="plan__role-name">${role.role}</span>
        <span class="plan__role-count">${role.items.length} items</span>
      </div>
      <div class="plan__items">
        ${role.items.map((it) => `
          <label class="plan-item" data-item="${it.id}" data-policy="${it.policyBlocked ? "blocked" : "ok"}">
            <input type="checkbox" ${it.policyBlocked ? "disabled" : ""}>
            <span class="plan-item__title">${it.text}</span>
            <span class="plan-item__p tag">${it.p}</span>
          </label>`).join("")}
      </div>
    </div>`).join("");
  restorePlan();
}

function restorePlan() {
  const saved = JSON.parse(localStorage.getItem("findrix-plan-v1") || "[]");
  saved.forEach((id) => {
    const item = $(`.plan-item[data-item="${id}"]`);
    if (item) {
      const box = item.querySelector("input");
      box.checked = true;
      item.classList.add("is-done");
    }
  });
  updatePlanCounts();
}

function updatePlanCounts() {
  $$(".plan__role").forEach((role) => {
    const total = role.querySelectorAll(".plan-item").length;
    const done = role.querySelectorAll(".plan-item.is-done").length;
    const countEl = role.querySelector(".plan__role-count");
    countEl.textContent = done === total ? "Done" : `${done} of ${total} done`;
  });
}

function renderGaps() {
  $("#gaps").innerHTML = GAPS.map((g) => `
    <div class="gap">
      <span class="gap__rank">${g.rank}</span>
      <div>
        <div class="gap__head">${chip(g.status)} ${tag(g.priority)} <h3 class="gap__title">${g.title}</h3></div>
        <p class="gap__impact">${g.impact}</p>
        <p class="gap__action"><b>Do this:</b> ${g.action}</p>
      </div>
    </div>`).join("");
}

function renderLongterm() {
  $("#longterm").innerHTML = LONGTERM.map((l) => `
    <div class="card card__pad">
      <div class="gap__head" style="margin-bottom:10px">${chip(l.status)} ${tag(l.priority)} <span class="tag tag--long">Long term</span></div>
      <h3 style="margin-bottom:8px">${l.title}</h3>
      <p class="gap__impact">${l.impact}</p>
      <p class="gap__action" style="margin-top:10px"><b>Do this:</b> ${l.action}</p>
    </div>`).join("");
}

function groupChecks() {
  const order = ["Access", "Schema", "Content", "AI interaction", "Performance"];
  return order.map((cat) => {
    const items = CHECKS.filter((c) => c.category === cat);
    const catMeta = CATEGORIES.find((c) => c.name === cat);
    return { cat, items, catMeta };
  });
}

function renderChecklist() {
  const wrap = $("#check-groups");
  wrap.innerHTML = groupChecks().map((g) => {
    const scored = g.catMeta.score !== null;
    return `
      <div class="cat-group" data-category="${g.cat}">
        <div class="cat-group__head">
          <span class="cat-group__name">${g.cat}</span>
          <span class="cat-group__score">${scored ? `${g.catMeta.score}%` : "Not scored"}</span>
          <span class="cat-group__count">${g.items.length} checks</span>
        </div>
        ${g.items.map((c) => renderCheckRow(c)).join("")}
      </div>`;
  }).join("");
  updateFilters();
  renderRail();
}

function renderRail() {
  const counts = { pass: 0, warn: 0, fail: 0 };
  CHECKS.forEach((c) => { counts[c.status] += 1; });
  $("#stat-pass").textContent = counts.pass;
  $("#stat-warn").textContent = counts.warn;
  $("#stat-fail").textContent = counts.fail;
  $("#bottom-score").textContent = META.score;
}

function renderCheckRow(c) {
  const code = c.code ? `
    <div class="snippet">
      <p style="font-size:12.5px;font-weight:700;margin-bottom:6px">Implementation</p>
      <pre class="code">${c.code}</pre>
    </div>` : "";
  return `
    <details class="check" data-status="${c.status}" data-category="${c.category}">
      <summary>
        ${chip(c.status)}
        <span class="check__title">${c.title}</span>
        ${tag(c.priority)}
        <span class="check__chev" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </summary>
      <div class="check__body">
        <p><b>Why it matters.</b> ${c.impact}</p>
        <p><b>Action.</b> ${c.action}</p>
        ${code}
      </div>
    </details>`;
}

/* ================= filters ================= */

const FILTERS = {
  status: "all",
  category: "all"
};

function updateFilters() {
  const statusCounts = { all: CHECKS.length, pass: 0, warn: 0, fail: 0 };
  const catCounts = {};
  CHECKS.forEach((c) => {
    statusCounts[c.status] += 1;
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  });

  const statusBar = $("#filter-status");
  statusBar.innerHTML = [
    ["all", "All"],
    ["pass", "Pass"],
    ["warn", "Partial"],
    ["fail", "Missing"]
  ].map(([k, label]) => `
    <button class="filter ${FILTERS.status === k ? "filter--on" : ""}" data-filter-status="${k}">
      ${label} <span class="filter__count">${statusCounts[k]}</span>
    </button>`).join("");

  const catBar = $("#filter-category");
  catBar.innerHTML = [
    ["all", CHECKS.length],
    ...Object.entries(catCounts)
  ].map(([k, n]) => `
    <button class="filter ${FILTERS.category === k ? "filter--on" : ""}" data-filter-category="${k}">
      ${k === "all" ? "All categories" : k} <span class="filter__count">${n}</span>
    </button>`).join("");

  applyFilters();
}

function applyFilters() {
  let visible = 0;
  $$(".check").forEach((el) => {
    const statusOk = FILTERS.status === "all" || el.dataset.status === FILTERS.status;
    const catOk = FILTERS.category === "all" || el.dataset.category === FILTERS.category;
    const show = statusOk && catOk;
    el.classList.toggle("is-filtered-out", !show);
    if (show) visible += 1;
  });
  $$(".cat-group").forEach((g) => {
    const any = g.querySelector(".check:not(.is-filtered-out)");
    g.classList.toggle("is-filtered-out", !any);
  });
  $("#check-none").style.display = visible === 0 ? "block" : "none";
}

/* ================= policy ================= */

function setPolicy(value) {
  const yes = value === "yes";
  $("#policy-yes").classList.toggle("seg__opt--on", yes);
  $("#policy-no").classList.toggle("seg__opt--on", !yes);
  $("#policy-note").textContent = yes
    ? "The plan below assumes yes. The Cloudflare and robots.txt changes are the first thing to ship, and the two Access P1s clear automatically."
    : "The plan below skips the Cloudflare and robots.txt items. The Access P1s become a deliberate choice rather than a bug, and the score stays capped near the current tier.";
  $$('.plan-item[data-policy="blocked"]').forEach((item) => {
    item.classList.toggle("is-policy-blocked", !yes);
    const box = item.querySelector("input");
    box.disabled = !yes;
    if (!yes) { box.checked = false; item.classList.remove("is-done"); }
  });
  updatePlanCounts();
}

/* ================= init ================= */

function init() {
  renderHero();
  renderCats();
  renderPlan();
  renderGaps();
  renderLongterm();
  renderChecklist();
  setPolicy("yes");

  const saved = JSON.parse(localStorage.getItem("findrix-impl-on") || "false");
  document.body.classList.toggle("impl-on", saved);
  $("#impl-toggle").setAttribute("aria-pressed", saved ? "true" : "false");
  if (saved) $$(".check").forEach((el) => { el.open = true; });

  // events
  $("#impl-toggle").addEventListener("click", () => {
    const on = document.body.classList.toggle("impl-on");
    $("#impl-toggle").setAttribute("aria-pressed", on ? "true" : "false");
    localStorage.setItem("findrix-impl-on", JSON.stringify(on));
    $$(".check").forEach((el) => { el.open = on; });
  });

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-filter-status]");
    if (s) {
      FILTERS.status = s.dataset.filterStatus;
      updateFilters();
      return;
    }
    const c = e.target.closest("[data-filter-category]");
    if (c) {
      FILTERS.category = c.dataset.filterCategory;
      updateFilters();
      return;
    }
    const opt = e.target.closest("[data-policy-opt]");
    if (opt) setPolicy(opt.dataset.policyOpt);
  });

  document.addEventListener("change", (e) => {
    const item = e.target.closest(".plan-item");
    if (!item) return;
    item.classList.toggle("is-done", e.target.checked);
    const ids = $$('.plan-item input[type="checkbox"]:checked').map((el) => el.closest(".plan-item").dataset.item);
    localStorage.setItem("findrix-plan-v1", JSON.stringify(ids));
    updatePlanCounts();
  });

  $("#expand-all").addEventListener("click", () => {
    $$(".check").forEach((el) => { if (!el.classList.contains("is-filtered-out")) el.open = true; });
  });
  $("#collapse-all").addEventListener("click", () => {
    $$(".check").forEach((el) => { el.open = false; });
  });
}

document.addEventListener("DOMContentLoaded", init);
