# findrix

A standalone AI visibility audit report, built as a self contained static page for findrix. This repo currently ships the audit report for susinsight.com and is served on GitHub Pages at [tomiabe.github.io/findrix](https://tomiabe.github.io/findrix/).

## Why this project exists

AI assistants now answer the questions your audience used to type into a search box. ChatGPT, Claude, Perplexity, and Google AI decide who gets cited and who gets left out. Most teams do not know how they are doing, because the signals AI reads are scattered across robots.txt, structured data, heading structure, page speed, and off-site sources.

findrix turns that raw signal check into an owner's report. One page that tells you, in plain language, what is blocking AI assistants from quoting your site and exactly what to do about it this week.

## What this page does

The report opens with a one paragraph narrative verdict, then works through five layers:

1. **Score by category.** A 68/100 score dial plus five category scores with weight noted.
2. **The one policy question.** A strategic fork before any plan: let AI assistants cite you, or keep them blocked. The plan and the checklist react to the choice.
3. **Week 1 plan.** Nine actions split across three roles, Dev and infrastructure, Frontend, and Content, each with a P1, P2, or P3 priority and a tick box that persists in localStorage.
4. **Where the score is stuck.** The seven gaps that move the score fastest, ranked, each with exactly one action.
5. **Full 30 point checklist.** Every check grouped by category, with status, priority, why it matters, the action, and, where available, a ready to paste implementation snippet shown through the Implementation view toggle.

## Tech

Vanilla HTML, CSS, and JavaScript. No build step, no framework, no dependencies. All data lives in `app.js`, so the report can be repointed at any audit result by editing the data arrays without touching the markup.

- `index.html` page structure
- `styles.css` design system, findrix brand palette, responsive, reduced motion support
- `app.js` data and renderers, filters, policy toggle, plan persistence, implementation view

## Run locally

Open `index.html` in any browser. No server required.

Or serve it from the repo root:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

The site is published from the `main` branch root by GitHub Pages. A `.nojekyll` file is committed so GitHub serves the static files as is.

## Brand

Findrix uses the findrix visual identity: ink `#0A0A0A`, pop lime `#00FF88`, signal green `#00B25E`, ember `#FF5C38`, amber `#FFB020`, warm off white background `#FAFAF7`, and Inter for all type.

## License

No license specified.
