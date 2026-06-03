#!/usr/bin/env python3
"""
Build a self-contained `dist/` folder that can be dropped straight onto Netlify
(or any static host) with a clean root URL — index.html at the top level.

The storefront in design/ui_kits/shopify-store/ references assets two levels up
(../../colors_and_type.css, ../../assets/...). This script copies everything into
dist/ with those paths flattened, so dist/index.html works as the site root.

Run:  python3 scripts/build_dist.py   →   then drag the dist/ folder onto Netlify.
"""
import os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_STORE = os.path.join(ROOT, "design", "ui_kits", "shopify-store")
SRC_CSS   = os.path.join(ROOT, "design", "colors_and_type.css")
SRC_ASSETS = os.path.join(ROOT, "design", "assets")
DIST = os.path.join(ROOT, "dist")

TEXT_EXT = {".html", ".jsx", ".js", ".css"}

def main():
    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    # 1. storefront files (index.html + components) → dist root
    for name in os.listdir(SRC_STORE):
        s = os.path.join(SRC_STORE, name)
        if os.path.isfile(s):
            shutil.copy2(s, os.path.join(DIST, name))

    # 2. brand stylesheet → dist root
    shutil.copy2(SRC_CSS, os.path.join(DIST, "colors_and_type.css"))

    # 3. assets/ → dist/assets/
    shutil.copytree(SRC_ASSETS, os.path.join(DIST, "assets"))

    # 4. flatten ../../ references (they all pointed at the design/ root,
    #    which is now the dist root)
    fixed = 0
    for dirpath, _, files in os.walk(DIST):
        for f in files:
            if os.path.splitext(f)[1].lower() in TEXT_EXT:
                p = os.path.join(dirpath, f)
                txt = open(p, encoding="utf-8", errors="ignore").read()
                if "../../" in txt:
                    open(p, "w", encoding="utf-8").write(txt.replace("../../", ""))
                    fixed += 1

    total = sum(len(fs) for _, _, fs in os.walk(DIST))
    print(f"Built dist/ — {total} files, flattened paths in {fixed} text files.")
    print("Entry: dist/index.html (root). Drag the dist/ folder onto Netlify Drop.")

if __name__ == "__main__":
    main()
