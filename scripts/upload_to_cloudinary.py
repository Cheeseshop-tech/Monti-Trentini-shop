#!/usr/bin/env python3
"""
Upload the 71 local packshots to Cloudinary with DETERMINISTIC public IDs.

Why this exists: the Cloudinary product environment "sofcvmwa" has Dynamic Folder
Mode ON, which decouples the delivery Public ID from folders and display names.
That's why URLs like .../upload/monti/02005.jpg returned 404 — manual UI uploads
don't reliably set the Public ID. This script sets the Public ID EXPLICITLY to
"monti/<SKU code>", so every delivery URL becomes predictable:

    https://res.cloudinary.com/sofcvmwa/image/upload/monti/02005.jpg

After it runs, tell the assistant "uploaded" and it flips images.jsx to live.

------------------------------------------------------------------------------
SETUP (one time)
------------------------------------------------------------------------------
1. Install the SDK:
       python3 -m pip install cloudinary

2. Get your API key + secret:
       Cloudinary dashboard → Settings → API Keys (or the "API Environment
       variable" on the dashboard, which is the whole CLOUDINARY_URL string).

3. Set your credentials as an env var (cloud name is already sofcvmwa):
       export CLOUDINARY_URL="cloudinary://<API_KEY>:<API_SECRET>@sofcvmwa"

   ▶ Your secret stays on your machine. Do NOT paste it into the chat.

------------------------------------------------------------------------------
RUN
------------------------------------------------------------------------------
       python3 scripts/upload_to_cloudinary.py

   Re-running is safe — overwrite=True updates existing assets in place.
   Add --dry-run to preview what would upload without sending anything.
"""
import os, sys, glob, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "design", "assets", "products")
FOLDER = "monti"           # public-ID prefix → matches images.jsx CLOUDINARY.folder
CLOUD_NAME = "sofcvmwa"

def main():
    dry = "--dry-run" in sys.argv
    files = sorted(glob.glob(os.path.join(IMG_DIR, "*.jpg")))
    codes = [os.path.splitext(os.path.basename(f))[0] for f in files]
    bad = [c for c in codes if not re.match(r"^\d{4,6}$", c)]
    print(f"Found {len(files)} packshots in {IMG_DIR}")
    if bad:
        print(f"  ⚠ non-code filenames (skipped): {bad}")
    print(f"Target: https://res.cloudinary.com/{CLOUD_NAME}/image/upload/{FOLDER}/<code>.jpg\n")

    if dry:
        for f, c in zip(files, codes):
            if c in bad: continue
            print(f"  would upload {os.path.basename(f)}  ->  public_id={FOLDER}/{c}")
        print(f"\nDRY RUN — {len(files) - len(bad)} files would upload. Re-run without --dry-run to send.")
        return

    try:
        import cloudinary, cloudinary.uploader
    except ImportError:
        sys.exit("ERROR: cloudinary SDK not installed. Run:  python3 -m pip install cloudinary")

    import getpass
    cloudinary.config(secure=True)            # picks up CLOUDINARY_URL if it's set & valid
    cfg = cloudinary.config()
    key = (cfg.api_key or "")
    needs_prompt = (
        not key or not (cfg.api_secret or "")
        or key.upper() in ("API_KEY", "YOUR_API_KEY") or "<" in key
        or cfg.cloud_name != CLOUD_NAME
    )
    if needs_prompt:
        print(f"\nEnter your Cloudinary credentials for cloud '{CLOUD_NAME}'.")
        print("Find them in Cloudinary → Settings → API Keys.")
        print("Tip: the secret is HIDDEN as you paste/type — that's normal, just press Return.\n")
        api_key = input("  API key: ").strip()
        api_secret = getpass.getpass("  API secret (hidden): ").strip()
        if not api_key or not api_secret:
            sys.exit("ERROR: both API key and API secret are required.")
        cloudinary.config(cloud_name=CLOUD_NAME, api_key=api_key, api_secret=api_secret, secure=True)

    ok, fail = 0, 0
    for f, c in zip(files, codes):
        if c in bad: continue
        pid = f"{FOLDER}/{c}"
        try:
            cloudinary.uploader.upload(
                f, public_id=pid, overwrite=True, unique_filename=False,
                use_filename=False, resource_type="image",
            )
            ok += 1
            print(f"  ✓ {pid}")
        except Exception as e:
            fail += 1
            print(f"  ✗ {pid}  — {e}")

    print(f"\nDone: {ok} uploaded, {fail} failed.")
    if ok:
        print(f"Verify: https://res.cloudinary.com/{CLOUD_NAME}/image/upload/{FOLDER}/{codes[0]}.jpg")
        print('Then tell the assistant "uploaded" to switch the storefront to the CDN.')

if __name__ == "__main__":
    main()
