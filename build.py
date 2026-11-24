#!/usr/bin/env python3
"""Собирает Markdown-материалы в js/posts.js и js/cases.js (только стандартная библиотека)."""
import glob
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"мини": "mini", "mini": "mini", "средняя": "medium", "medium": "medium", "большая": "large", "large": "large", "статья": "large"}
IMAGE_LINE = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)$")


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)


def article_image(alt, src):
    alt_attr = html.escape(alt, quote=True)
    src_attr = html.escape(src.strip(), quote=True)
    caption = '<figcaption>%s</figcaption>' % html.escape(alt) if alt else ""
    return '<figure class="article-image"><img data-optional-image src="%s" alt="%s" loading="lazy">%s</figure>' % (src_attr, alt_attr, caption)


def md(text, qa=False):
    out, li = [], []

    def flush():
        if li:
            out.append("<ul>" + "".join("<li>%s</li>" % inline(x) for x in li) + "</ul>")
            li.clear()

    for block in re.split(r"\n\s*\n", text.strip()):
        for line in block.split("\n"):
            line = line.strip()
            image = IMAGE_LINE.match(line)
            if image:
                flush()
                out.append(article_image(image.group(1), image.group(2)))
                continue
            if line.startswith("- "):
                li.append(line[2:])
                continue
            flush()
            if line.startswith("## "):
                out.append("<h3>%s</h3>" % inline(line[3:]))
            elif line:
                if qa and line.startswith("— "):
                    out.append('<p class="qa-question"><b>%s</b></p>' % inline(line))
                else:
                    out.append("<p>%s</p>" % inline(line))
        flush()
    return "".join(out)


def frontmatter(path):
    raw = open(path, encoding="utf-8").read()
    match = re.match(r"---\n(.*?)\n---\n(.*)", raw, re.S)
    if not match:
        raise ValueError("Missing YAML-style front matter: " + path)
    meta = {}
    for line in match.group(1).split("\n"):
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, match.group(2)


posts = []
for path in glob.glob(os.path.join(ROOT, "content/posts/*.md")):
    meta, text = frontmatter(path)
    if meta.get("draft", "").lower() in ("true", "yes", "да", "1"):
        continue
    slug = os.path.basename(path)[:-3]
    posts.append(dict(
        slug=slug, title=meta["title"], date=meta["date"],
        accent=meta.get("accent", "").lower() in ("true", "да", "yes", "1"),
        size=SIZES.get(meta.get("size", "мини").lower(), "mini"), kind=meta.get("kind", ""),
        featured=meta.get("featured") == "true", note=meta.get("note", ""), author=meta.get("author", ""),
        fmt=meta.get("format", ""), topic=meta.get("topic", ""),
        cover=meta.get("cover") or "assets/posts/%s/cover.jpg" % slug,
        body=md(text, qa=meta.get("format", "").lower().startswith("q&a"))))
posts.sort(key=lambda post: post["date"], reverse=True)
with open(os.path.join(ROOT, "js/posts.js"), "w", encoding="utf-8") as output:
    output.write("window.POSTS=" + json.dumps(posts, ensure_ascii=False) + ";\n")
print(len(posts), "posts")

cases = []
for path in glob.glob(os.path.join(ROOT, "content/cases/*.md")):
    meta, text = frontmatter(path)
    slug = os.path.basename(path)[:-3]
    cases.append(dict(
        slug=slug, company=meta["company"], title=meta["title"], summary=meta["summary"],
        tags=[tag.strip() for tag in meta.get("tags", "").split(",") if tag.strip()],
        order=int(meta.get("order") or 99),
        logo=meta.get("logo") or "assets/logos/%s.png" % slug,
        cover=meta.get("cover") or "assets/hackathon/cases/%s.jpg" % slug, body=md(text)))
cases.sort(key=lambda case: case["order"])
with open(os.path.join(ROOT, "js/cases.js"), "w", encoding="utf-8") as output:
    output.write("window.CASES=" + json.dumps(cases, ensure_ascii=False) + ";\n")
print(len(cases), "cases")
