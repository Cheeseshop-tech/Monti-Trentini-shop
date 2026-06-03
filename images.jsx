// Product imagery helper.
// Photos are named by SKU code (e.g. 02005.jpg). productImage(code) returns a
// Cloudinary CDN URL once you set the cloud name below; until then it serves the
// local packshots in assets/products/. Components keep the brand-green gradient
// behind the <img>, so a missing photo degrades gracefully to the gradient.
//
//   To switch to Cloudinary: set window.CLOUDINARY.cloud to your cloud name
//   (and folder, if your public IDs live under one, e.g. "monti"). Public IDs
//   are assumed to be the SKU code.
(function () {
  // Cloud name is "sofcvmwa" (verified). Plan: re-upload the 71 packshots from
  // assets/products/ into a Cloudinary folder "monti", with public IDs = SKU code
  // (unique-filename OFF), so monti/02005 etc. resolve.
  //   ▶ TO ACTIVATE once uploaded: change cloud: "" to cloud: "sofcvmwa".
  // While inactive, local packshots are served. The folder is pre-set; the
  // onError handler also falls back to local for any ID that doesn't resolve.
  window.CLOUDINARY = window.CLOUDINARY || { cloud: "sofcvmwa", folder: "monti" };

  window.productImage = function (code, opts) {
    opts = opts || {};
    const w = opts.w || 600;
    if (!code) return "";
    const cloud = window.CLOUDINARY.cloud;
    if (cloud) {
      const folder = window.CLOUDINARY.folder ? window.CLOUDINARY.folder.replace(/\/+$/, "") + "/" : "";
      const tx = `f_auto,q_auto,c_fill,w_${w}`;
      return `https://res.cloudinary.com/${cloud}/image/upload/${tx}/${folder}${code}.jpg`;
    }
    return `../../assets/products/${code}.jpg`; // local fallback (relative to shopify-store/)
  };

  // Drop-in <img> props: fills its (position:relative) parent. On error it first
  // falls back to the local packshot (so enabling Cloudinary is non-destructive —
  // any unresolved public ID still shows the local photo), then hides itself so
  // the parent's gradient shows through. Spread onto an <img>.
  window.productImgProps = function (code, opts) {
    const localUrl = `../../assets/products/${code}.jpg`;
    return {
      src: window.productImage(code, opts),
      loading: "lazy",
      onError: function (e) {
        const img = e.target;
        if (!img.dataset.fellBack && img.src.indexOf("res.cloudinary.com") !== -1) {
          img.dataset.fellBack = "1";   // CDN miss → try the local copy
          img.src = localUrl;
        } else {
          img.style.display = "none";   // give up → reveal gradient
        }
      },
      style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" },
    };
  };
})();
