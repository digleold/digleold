#!/usr/bin/env python3
"""Ricava la base di conoscenza dell'assistente dalle due pagine del sito (italiano e inglese).
Uso: python3 tools/build_kb.py   ->  scrive assistant-api/kb.it.json e assistant-api/kb.en.json
La base di conoscenza e' quindi sempre quella che i visitatori leggono sul sito: nessun testo duplicato da mantenere a mano."""
import html as H
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "NuovoSitoLD"
OUT = ROOT / "assistant-api"


def txt(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    s = re.sub(r"<br\s*/?>", ", ", s)
    s = re.sub(r"</strong>\s*(?=[A-Za-zÀ-ÿ0-9])", ": ", s)
    s = re.sub(r"</(p|li|div|h\d)>", " ", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def block(page, start, end):
    a = page.index(start)
    return page[a:page.index(end, a)]


def build(path):
    p = (SITE / path).read_text(encoding="utf-8")
    kb = {}
    kb["lang"] = re.search(r'<html lang="(\w+)"', p).group(1)
    kb["site_title"] = txt(re.search(r"<title>(.*?)</title>", p, re.S).group(1))
    kb["faq"] = [{"q": txt(q), "a": txt(a)} for q, a in re.findall(r'<details name="faq"[^>]*><summary><span>(.*?)</span>.*?</summary><p>(.*?)</p>', p, re.S)]
    kb["services"] = [{"name": txt(t), "area": txt(c), "text": txt(m)} for t, c, m in re.findall(r'<details name="svc"><summary>.*?<span class="t">(.*?)</span><span class="cat">.*?<span class="tx">(.*?)</span></span>.*?</summary><p class="more">(.*?)</p>', p, re.S)]
    items = {"projects": [], "partners": []}
    for kind, did, body in re.findall(r'<div id="d-(proj|partner)-(\d+)" data-g="[^"]*"[^>]*>(.*?)</div></div>(?=<div id="d-|</div>\s*<dialog)', p, re.S):
        title = txt(re.search(r'<h3 class="d-title">(.*?)</h3>', body, re.S).group(1))
        paras = [txt(x) for x in re.findall(r"<p[^>]*>(.*?)</p>", body, re.S)]
        bullets = [txt(x) for x in re.findall(r"<li>(.*?)</li>", body, re.S)]
        tags = [txt(x) for x in re.findall(r"<span class=\"c-\w+\">(.*?)</span>", body, re.S)]
        items["projects" if kind == "proj" else "partners"].append({"name": title, "category": tags, "text": paras, "points": bullets})
    kb.update(items)
    kb["industries"] = [txt(x) for x in re.findall(r"<li>(.*?)</li>", block(p, '<ul class="ind', "</ul>"), re.S)]
    kb["about"] = [txt(x) for x in re.findall(r'<p class="(?:lead|body)"[^>]*>(.*?)</p>', block(p, 'id="azienda"', 'id="storie"'), re.S)]
    kb["method"] = [{"step": txt(h), "text": txt(t)} for h, t in re.findall(r'<div class="rise[^"]*"><span class="n">\d+</span><h3>(.*?)</h3><p>(.*?)</p>', p, re.S)]
    kb["contact"] = {"company": "LD Technologies SRL", "address": "Via Enrico Fermi snc, 70024 Gravina in Puglia (BA)", "vat": "08921740729", "phone": "+39 080 849 3561",
                     "email_it_software": "info@ldtechnologies.it", "email_robotics": "info@ldrobotics.it", "facebook": "https://www.facebook.com/profile.php?id=100095597971748"}
    return kb


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for path, name in (("index.html", "kb.it.json"), ("en/index.html", "kb.en.json")):
        kb = build(path)
        (OUT / name).write_text(json.dumps(kb, ensure_ascii=False, indent=1), encoding="utf-8")
        print(name, {k: (len(v) if isinstance(v, list) else "ok") for k, v in kb.items() if k not in ("lang", "site_title", "contact")})
