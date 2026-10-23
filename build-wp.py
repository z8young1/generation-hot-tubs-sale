#!/usr/bin/env python3
"""Build WordPress-ready bundles of the three pages.

Each bundle is one Custom HTML block (styles, markup and scripts inline) for a
WordPress page that uses the "Elementor Canvas" template, so the theme's header
and footer stay off the page. Output goes to wp-bundles/*.txt.

Pages on generationhottubs.com:
  /factory-sale/             <- wp-bundles/factory-sale.txt  (index.html)
  /factory-sale/quiz/        <- wp-bundles/quiz.txt          (quiz.html)
  /factory-sale/thank-you/   <- wp-bundles/thank-you.txt     (thank-you.html)

The CSS is scoped under #ght, with the theme's styles reset inside it, so
Hello Elementor and the Elementor kit cannot restyle the page.
"""
import base64, re, pathlib
root = pathlib.Path(__file__).parent
out_dir = root / "wp-bundles"
out_dir.mkdir(exist_ok=True)

BASE = "/factory-sale/"
URLS = {"index.html": BASE, "quiz.html": BASE + "quiz/", "thank-you.html": BASE + "thank-you/"}
MEDIA = "https://generationhottubs.com/wp-content/uploads/2023/11/"
IMAGES = ["GHT-Location-1.webp", "Generation-GH-700-Classic.jpg", "Generation-GH-700-Deluxe.jpg",
          "Generation-GH-800-Deluxe-1.jpg", "Generation-GH-800-Deluxe.jpg",
          "Generation-Hot-Tub-Logo-Circle.png", "Product-Classic-BG-1.webp"]
SCOPE = "#ght"


def media(text):
    for name in IMAGES:
        text = text.replace("img/" + name, MEDIA + name)
    assert "img/" not in re.sub(r"<img", "", text), "unmapped image path"
    return text


# ---------- CSS scoping ----------
def split_top(s, sep=","):
    parts, depth, cur = [], 0, ""
    for ch in s:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(cur); cur = ""
        else:
            cur += ch
    parts.append(cur)
    return [p.strip() for p in parts if p.strip()]


def scope_selector(sel):
    if sel == ":root":
        return SCOPE
    if sel.startswith("html"):
        return sel  # page-level only; these pages are standalone
    if sel == "body" or sel.startswith("body "):
        return SCOPE + sel[4:]
    return SCOPE + " " + sel


def scope_css(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            break
        head = css[i:j].strip()
        # find the matching close brace
        depth, k = 1, j + 1
        while depth:
            if css[k] == "{": depth += 1
            elif css[k] == "}": depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if head.startswith("@media") or head.startswith("@supports"):
            out.append(head + " {\n" + scope_css(body) + "}\n")
        elif head.startswith("@"):
            out.append(head + " {" + body + "}\n")
        else:
            sels = ", ".join(scope_selector(s) for s in split_top(head))
            if head == "body":
                body = body.replace("overflow-x: hidden", "overflow-x: clip")
            out.append(sels + " {" + body + "}\n")
        i = k
    return "".join(out)


RESET = """
/* WordPress wrapper: reset theme and Elementor kit styles inside the page */
html, body { margin: 0; padding: 0; background: #fffaf2; }
body { overflow-x: hidden; }
#ght *, #ght *::before, #ght *::after { all: revert; }
#ght { display: block; min-height: 100vh; }
"""

css = RESET + scope_css(media((root / "styles.css").read_text(encoding="utf-8")))
# Unscoped rules for the page itself; the #ght rules above cover everything else.
assert ":root" not in css

app_js = (root / "app.js").read_text(encoding="utf-8")
assert app_js.count('"thank-you.html"') == 1
app_js = app_js.replace('"thank-you.html"', '"' + URLS["thank-you.html"] + '"')
app_js = media(app_js)
config_js = (root / "config.js").read_text(encoding="utf-8")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shrikhand&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap">\n')
NOOPT = ' data-no-optimize="1" data-no-defer="1" data-no-minify="1"'


def relink(html):
    html = html.replace('href="index.html#', 'href="' + URLS["index.html"] + '#')
    for name, url in URLS.items():
        html = html.replace('href="' + name + '"', 'href="' + url + '"')
        html = html.replace('data-next="' + name + '"', 'data-next="' + url + '"')
    assert not re.search(r'(href|data-next)="(index|quiz|thank-you)\.html', html)
    return html


def bundle(src, dest):
    page = (root / src).read_text(encoding="utf-8")
    body = re.search(r"<body[^>]*>(.*?)</body>", page, re.S).group(1)
    inline = re.findall(r"<script>(.*?)</script>", body, re.S)
    body = re.sub(r"<script[^>]*>.*?</script>\s*", "", body, flags=re.S)
    body = media(relink(body))
    scripts = [config_js, app_js] + inline
    html = ("<!-- wp:html -->\n" + FONTS
            + "<style" + NOOPT + ">\n" + css + "</style>\n"
            + '<div id="ght">\n' + body.strip() + "\n</div>\n"
            # WordPress's text formatter turns && and < inside inline scripts into HTML
            # entities, so each script travels as a base64 data URL it cannot touch.
            + "".join('<script src="data:text/javascript;charset=utf-8;base64,'
                      + base64.b64encode(s.strip().encode("utf-8")).decode("ascii")
                      + '"' + NOOPT + '></script>\n' for s in scripts)
            + "<!-- /wp:html -->\n")
    # The block parser ends the block at this marker, so it may appear only once.
    assert html.count("<!-- /wp:html -->") == 1
    (out_dir / dest).write_text(html, encoding="utf-8")
    print(dest, len(html), "bytes")


bundle("index.html", "factory-sale.txt")
bundle("quiz.html", "quiz.txt")
bundle("thank-you.html", "thank-you.txt")
