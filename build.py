#!/usr/bin/env python3
"""Собирает Markdown-материалы в js/posts.js и js/cases.js (только стандартная библиотека)."""
import glob
import html
import json
import os
import re
import struct

ROOT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"мини": "mini", "mini": "mini", "s": "mini", "средняя": "medium", "medium": "medium", "m": "medium", "большая": "large", "large": "large", "l": "large", "статья": "large", "xl": "xl", "панорамная": "xl"}
IMAGE_LINE = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)$")


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)


def article_image(alt, src):
    alt_attr = html.escape(alt, quote=True)
    src_attr = html.escape(src.strip(), quote=True)
    caption = '<figcaption>%s</figcaption>' % html.escape(alt) if alt else ""
    return '<figure class="article-image"><img data-optional-image src="%s" alt="%s" loading="lazy">%s</figure>' % (src_attr, alt_attr, caption)


def first_article_image(text):
    for line in text.splitlines():
        image = IMAGE_LINE.match(line.strip())
        if image:
            return image.group(2).strip()
    return ""


def without_article_images(text):
    return "\n".join(line for line in text.splitlines() if not IMAGE_LINE.match(line.strip()))


def md(text, qa=False):
    out, li, list_tag = [], [], ["ul"]

    def flush():
        if li:
            tag = list_tag[0]
            out.append("<%s>" % tag + "".join("<li>%s</li>" % inline(x) for x in li) + "</%s>" % tag)
            li.clear()
            list_tag[0] = "ul"

    for block in re.split(r"\n\s*\n", text.strip()):
        lines = block.split("\n")
        if lines and all(line.strip().startswith(">") for line in lines):
            flush()
            quoted = " ".join(line.strip()[1:].strip() for line in lines)
            out.append("<blockquote><p>%s</p></blockquote>" % inline(quoted))
            continue
        for line in lines:
            line = line.strip()
            image = IMAGE_LINE.match(line)
            if image:
                flush()
                out.append(article_image(image.group(1), image.group(2)))
                continue
            ordered = re.match(r"^\d+[.)]\s+(.+)$", line)
            if line.startswith("- ") or ordered:
                tag = "ol" if ordered else "ul"
                if li and list_tag[0] != tag:
                    flush()
                if not li:
                    list_tag[0] = tag
                li.append(ordered.group(1) if ordered else line[2:])
                continue
            flush()
            heading = re.match(r"^(#{1,6})\s+(.+)$", line)
            if heading:
                tag = "h3" if len(heading.group(1)) <= 2 else "h4"
                out.append("<%s>%s</%s>" % (tag, inline(heading.group(2)), tag))
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


def image_dimensions(source):
    if not source or re.match(r"^(https?:|data:|/)", source, re.I):
        return None, None
    path = os.path.join(ROOT, source)
    if not os.path.isfile(path):
        return None, None
    try:
        with open(path, "rb") as image:
            header = image.read(24)
            if header[:8] == b"\x89PNG\r\n\x1a\n":
                return struct.unpack(">II", header[16:24])
            if header[:2] != b"\xff\xd8":
                return None, None
            image.seek(2)
            frame_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                             0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
            while True:
                prefix = image.read(1)
                if not prefix:
                    break
                if prefix != b"\xff":
                    continue
                marker = image.read(1)
                while marker == b"\xff":
                    marker = image.read(1)
                if not marker or marker in (b"\xd8", b"\xd9", b"\x00"):
                    continue
                length = image.read(2)
                if len(length) != 2:
                    break
                segment_length = struct.unpack(">H", length)[0]
                if segment_length < 2:
                    break
                if marker[0] in frame_markers:
                    frame = image.read(5)
                    if len(frame) == 5:
                        height, width = struct.unpack(">HH", frame[1:5])
                        return width, height
                    break
                image.seek(segment_length - 2, os.SEEK_CUR)
    except (OSError, struct.error):
        pass
    return None, None


posts = []
for path in glob.glob(os.path.join(ROOT, "content/posts/*.md")):
    meta, text = frontmatter(path)
    if meta.get("draft", "").lower() in ("true", "yes", "да", "1"):
        continue
    slug = os.path.basename(path)[:-3]
    cover = first_article_image(text) or meta.get("cover") or "assets/posts/%s/cover.jpg" % slug
    cover_width, cover_height = image_dimensions(cover)
    article_text = without_article_images(text)
    posts.append(dict(
        slug=slug, title=meta["title"], date=meta["date"],
        accent=meta.get("accent", "").lower() in ("true", "да", "yes", "1"),
        size=SIZES.get(meta.get("size", "мини").lower(), "mini"), kind=meta.get("kind", ""),
        featured=meta.get("featured") == "true", note=meta.get("note", ""), author=meta.get("author", ""),
        fmt=meta.get("format", ""), topic=meta.get("topic", ""),
        cover=cover, cover_width=cover_width, cover_height=cover_height,
        body=md(article_text, qa=meta.get("format", "").lower().startswith("q&a"))))
posts.sort(key=lambda post: post["date"], reverse=True)
with open(os.path.join(ROOT, "js/posts.js"), "w", encoding="utf-8") as output:
    output.write("window.POSTS=" + json.dumps(posts, ensure_ascii=False) + ";\n")
print(len(posts), "posts")

cases = []
for path in glob.glob(os.path.join(ROOT, "content/cases/*.md")):
    meta, text = frontmatter(path)
    slug = os.path.basename(path)[:-3]
    cover = meta.get("cover") or "assets/hackathon/cases/%s.jpg" % slug
    cover_width, cover_height = image_dimensions(cover)
    cases.append(dict(
        slug=slug, company=meta["company"], title=meta["title"], summary=meta["summary"],
        tags=[tag.strip() for tag in meta.get("tags", "").split(",") if tag.strip()],
        order=int(meta.get("order") or 99),
        logo=meta.get("logo") or "assets/logos/%s.png" % slug,
        cover=cover, cover_width=cover_width, cover_height=cover_height, body=md(text)))
cases.sort(key=lambda case: case["order"])
with open(os.path.join(ROOT, "js/cases.js"), "w", encoding="utf-8") as output:
    output.write("window.CASES=" + json.dumps(cases, ensure_ascii=False) + ";\n")
print(len(cases), "cases")
