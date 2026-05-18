import { describe, expect, it } from "vitest";
import { parseSearxHtmlResults } from "@/lib/specs/searx-client";

const SAMPLE_HTML = `
<article class="result result-default category-general">
<a href="https://laptopmedia.com/series/lenovo-thinkpad-t450/" class="url_header" rel="noreferrer"></a>
<h3><a href="https://laptopmedia.com/series/lenovo-thinkpad-t450/" rel="noreferrer">Lenovo <span class="highlight">ThinkPad</span> <span class="highlight">T450</span></a></h3>
<p class="content">Processor: Intel Core i5-5300U. RAM: 8GB RAM.</p>
</article>
<article class="result result-default category-general">
<a href="https://www.notebookcheck.net/Lenovo-ThinkPad-T450-Ultrabook-Review.139988.0.html" class="url_header" rel="noreferrer"></a>
<h3><a href="https://www.notebookcheck.net/Lenovo-ThinkPad-T450-Ultrabook-Review.139988.0.html" rel="noreferrer">Review</a></h3>
<p class="content">14 inch business laptop.</p>
</article>
`;

describe("parseSearxHtmlResults", () => {
  it("extracts url, title, and content from SearXNG HTML", () => {
    const results = parseSearxHtmlResults(SAMPLE_HTML);
    expect(results).toHaveLength(2);
    expect(results[0]?.url).toContain("laptopmedia.com");
    expect(results[0]?.content).toContain("i5-5300U");
    expect(results[1]?.url).toContain("notebookcheck");
  });

  it("returns empty for non-result HTML", () => {
    expect(parseSearxHtmlResults("<html><body>nope</body></html>")).toEqual([]);
  });
});
