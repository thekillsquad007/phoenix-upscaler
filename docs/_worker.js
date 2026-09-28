// Phoenix Labs site on Cloudflare Pages ("advanced mode": this file sits next
// to the static files and sees the requests _routes.json sends it, which are
// the public pages only; assets never pass through here).
//
// Two things for AI agents, nothing different for browsers:
//  - Markdown negotiation: a request that prefers text/markdown gets the
//    page's Markdown twin (md/<page>.md, built by scripts/build_site_agents.py).
//  - Link headers pointing at the machine-readable parts of the site
//    (RFC 8288 / RFC 9727): API catalog, OpenAPI, docs, llms.txt, and the
//    Markdown version of this page.

const DISCOVERY = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '<https://api.phoenixlabs.space/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  '</developers>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
];

// Pages answered by the worker don't get _headers applied, so repeat them.
const SECURITY = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
};

function pageSlug(pathname) {
  if (pathname === "/" || pathname === "/index.html") return "index";
  const m = pathname.match(/^\/([a-z0-9-]+)(?:\.html)?\/?$/);
  return m ? m[1] : null;
}

// True when the client ranks text/markdown at least as high as text/html.
function prefersMarkdown(accept) {
  if (!accept) return false;
  const q = {};
  for (const part of accept.toLowerCase().split(",")) {
    const [type, ...params] = part.trim().split(";");
    const qp = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    q[type.trim()] = qp ? Number(qp.slice(2)) : 1;
  }
  const md = q["text/markdown"] ?? 0;
  if (md <= 0) return false;
  return md >= (q["text/html"] ?? q["text/*"] ?? q["*/*"] ?? 0) || !("text/html" in q);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // One host for search engines: www pages redirect to the apex, which is
    // what every canonical, the sitemap and llms.txt already name.
    if (url.hostname === "www.phoenixlabs.space") {
      url.hostname = "phoenixlabs.space";
      return Response.redirect(url.toString(), 301);
    }
    const slug = pageSlug(url.pathname);
    const res = await env.ASSETS.fetch(request);
    const isHtml = (res.headers.get("content-type") || "").includes("text/html");
    if (!slug || res.status !== 200 || !isHtml) return res;

    const mdPath = `/md/${slug}.md`;
    const links = [`<${mdPath}>; rel="alternate"; type="text/markdown"`, ...DISCOVERY].join(", ");

    if (prefersMarkdown(request.headers.get("accept"))) {
      const md = await env.ASSETS.fetch(new Request(new URL(mdPath, url)));
      if (md.ok) {
        const text = await md.text();
        return new Response(request.method === "HEAD" ? null : text, {
          headers: {
            ...SECURITY,
            "content-type": "text/markdown; charset=utf-8",
            "content-location": mdPath,
            "cache-control": "public, max-age=0, must-revalidate",
            vary: "Accept",
            link: links,
            // Rough size for agents budgeting context: ~4 characters a token.
            "x-markdown-tokens": String(Math.ceil(text.length / 4)),
          },
        });
      }
    }

    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY)) if (!out.headers.has(k)) out.headers.set(k, v);
    out.headers.append("vary", "Accept");
    out.headers.set("link", links);
    return out;
  },
};
