#!/usr/bin/env python3
"""
build_portal — sync the Monti portal into the published design/ folder
======================================================================
Netlify publishes `design/` only. This copies the self-contained portal
(clients/monti-trentini/) into design/portal/ with LOCAL copies of the core
engines, so it deploys at <site>/portal/ on the existing push-to-main auto-deploy.

Re-runnable: rebuild canonical JSON via the adapters, then run this to publish.
Skips the source xlsx. Rewrites ../../core/ → ./core/ in the copied pages.

Run:  python3 scripts/build_portal.py
"""
import shutil, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC  = ROOT / "clients" / "monti-trentini"
CORE = ROOT / "core"
OUT  = ROOT / "design" / "portal"

def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "core").mkdir(parents=True)
    (OUT / "brand").mkdir(parents=True)

    # html (rewrite core path) + json
    for f in sorted(SRC.glob("*.html")):
        html = f.read_text(encoding="utf-8").replace("../../core/", "./core/")
        (OUT / f.name).write_text(html, encoding="utf-8")
    for f in sorted(SRC.glob("*.json")):
        shutil.copy2(f, OUT / f.name)

    # brand assets (logos + brand.json) — skip nothing here, it's all needed
    for f in sorted((SRC / "brand").glob("*")):
        if f.is_file():
            shutil.copy2(f, OUT / "brand" / f.name)

    # local copies of the engines
    for f in ("pricing-core.js", "forecast-core.js"):
        shutil.copy2(CORE / f, OUT / "core" / f)

    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file())
    print(f"✓ built design/portal/  ({len(files)} files)")
    for f in files:
        print("   ", f)
    print("\nLive at: <site>/portal/  (e.g. https://mt-e-comm.netlify.app/portal/) after deploy.")

if __name__ == "__main__":
    main()
