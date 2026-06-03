# Cloudinary upload — Monti Trentini packshots

Pushes the 71 product photos in `design/assets/products/` (named `<SKU>.jpg`) to
Cloudinary with **explicit Public IDs** `monti/<SKU>`, so each delivers at:

```
https://res.cloudinary.com/sofcvmwa/image/upload/monti/02005.jpg
```

## Why a script (not the web uploader)
The `sofcvmwa` environment has **Dynamic Folder Mode ON**, which decouples the
delivery Public ID from folders and display names. Manual UI uploads therefore
don't produce predictable `monti/<code>` URLs. Setting `public_id` explicitly
(which this script does) is the reliable way.

## Steps
1. Install the SDK:
   ```bash
   python3 -m pip install cloudinary
   ```
2. Grab your API key + secret: Cloudinary dashboard → **Settings → API Keys**
   (the dashboard also shows the full `CLOUDINARY_URL` string under "API Environment variable").
3. Export your credentials — cloud name is already `sofcvmwa`. **Keep your secret local; never paste it into chat.**
   ```bash
   export CLOUDINARY_URL="cloudinary://<API_KEY>:<API_SECRET>@sofcvmwa"
   ```
4. Preview (optional), then upload:
   ```bash
   python3 scripts/upload_to_cloudinary.py --dry-run   # lists what would upload
   python3 scripts/upload_to_cloudinary.py             # does it (overwrite-safe)
   ```
5. Verify the URL it prints loads a cheese photo, then tell the assistant
   **"uploaded"** — it sets `cloud: "sofcvmwa"` in
   `design/ui_kits/shopify-store/images.jsx` and the storefront serves all 34
   products from the CDN. Any ID that doesn't resolve falls back to the local
   copy, so it's non-destructive.

Re-running is safe — `overwrite=True` updates assets in place.
