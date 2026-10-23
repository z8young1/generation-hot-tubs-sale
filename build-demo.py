#!/usr/bin/env python3
"""Build demo.html: all three pages in one file, switched by #home / #quiz / #thanks.
Used only for sharing a review link. The deployable pages are the separate .html files."""
import re, pathlib
root = pathlib.Path(__file__).parent

def body_of(name):
    src = (root / name).read_text(encoding="utf-8")
    body = re.search(r"<body[^>]*>(.*?)</body>", src, re.S).group(1)
    scripts = re.findall(r"<script>(.*?)</script>", body, re.S)
    body = re.sub(r"<script[^>]*>.*?</script>\s*", "", body, flags=re.S)
    return body, scripts

def relink(html):
    html = html.replace('href="quiz.html"', 'href="#quiz"')
    html = html.replace('href="thank-you.html"', 'href="#thanks"')
    html = html.replace('href="index.html#lineup"', 'href="#home"')
    html = html.replace('href="index.html"', 'href="#home"')
    html = html.replace('href="#top"', 'href="#home"')
    html = html.replace('data-next="thank-you.html"', 'data-next="#thanks"')
    return html

home, _ = body_of("index.html")
quiz, quiz_scripts = body_of("quiz.html")
thanks, thanks_scripts = body_of("thank-you.html")

home, quiz, thanks = relink(home), relink(quiz), relink(thanks)
thanks = thanks.replace('class="ticket" id="pass"', 'class="ticket" id="ty-pass"')

quiz_js = quiz_scripts[0]
quiz_js = quiz_js.replace(
    "if (step > 4 || e.metaKey || e.ctrlKey || e.altKey) return;",
    "if (step > 4 || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[data-view=\"quiz\"]').hidden) return;")
assert "data-view" in quiz_js

thanks_js = thanks_scripts[0].strip()
assert thanks_js.startswith("(function () {") and thanks_js.endswith("})();")
thanks_js = "window.renderThanks = function () {" + thanks_js[len("(function () {"):-len("})();")] + "};"

router = """
(function () {
  var titles = { home: "Generation Factory Sale", quiz: "Find Your Perfect Hot Tub", thanks: "Your Factory Pass" };
  var views = document.querySelectorAll("[data-view]");
  function show() {
    var h = (location.hash || "#home").replace("#", "");
    if (!titles[h]) h = "home";
    views.forEach(function (v) { v.hidden = v.getAttribute("data-view") !== h; });
    if (h === "thanks" && window.renderThanks) window.renderThanks();
    document.title = titles[h];
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);
  show();
})();
"""

head = """<meta name="claude:viewport-fit-sides" content="cover">
<title>Generation Factory Sale</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shrikhand&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="styles.css">
<!-- Review build. Pages: #home, #quiz, #thanks. Built by build-demo.py from the separate deployable files. -->
"""
out = (head
  + '<div data-view="home">' + home + '</div>\n'
  + '<div data-view="quiz" hidden>' + quiz + '</div>\n'
  + '<div data-view="thanks" hidden>' + thanks + '</div>\n'
  + '<script src="config.js"></script>\n<script src="app.js"></script>\n'
  + '<script>' + quiz_js + '</script>\n'
  + '<script>' + thanks_js + '</script>\n'
  + '<script>' + router + '</script>\n')
(root / "demo.html").write_text(out, encoding="utf-8")
# a standalone copy with a document skeleton for local viewing
full = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + out.split("\n",1)[1].split("<div data-view", 1)[0] + "</head>\n<body>\n<div data-view" + out.split("<div data-view", 1)[1] + "</body>\n</html>\n"
(root / "demo-local.html").write_text(full, encoding="utf-8")
print("built demo.html", len(out), "bytes; demo-local.html", len(full), "bytes")
