(() => {
  "use strict";

  // Storage keys and backup field names are unchanged, so existing pages and backups keep working.
  const FIELDS = ["nama", "kelas", "tahun", "impian", "kenang", "pesan"];
  const DEFAULT_BG = "linear-gradient(160deg,#e9dcc6,#d7c3a3)";
  const BG_PRESETS = [
    DEFAULT_BG,
    "linear-gradient(160deg,#cfdccf,#a9c0ae)",
    "linear-gradient(160deg,#d6dfeb,#a9bcd6)",
    "linear-gradient(160deg,#ead3d0,#d4a9a4)",
    "linear-gradient(160deg,#e8e2f0,#c1b5d8)",
    "linear-gradient(160deg,#f3d9a8,#e0a65f)",
    "linear-gradient(160deg,#2b3a4a,#16202b)",
    "linear-gradient(160deg,#3d4a3a,#1f2a1d)",
  ];
  const QUOTES = [
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "It always seems impossible until it's done. — Nelson Mandela",
    "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
    "Well done is better than well said. — Benjamin Franklin",
    "A journey of a thousand miles begins with a single step. — Lao Tzu",
    "Nothing will work unless you do. — Maya Angelou",
    "Act as if what you do makes a difference. It does. — William James",
    "The only way to do great work is to love what you do. — Steve Jobs",
  ];

  const $ = (id) => document.getElementById(id);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  const toastEl = $("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------- theme (follows the system until you choose) ---------- */
  const themeBtn = $("themeToggle");
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    document.body.dataset.theme = t;
    themeBtn.textContent = t === "dark" ? "Light" : "Dark";
  }
  setTheme(store.get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    store.set("theme", next);
  });

  /* ---------- the card ---------- */
  const card = $("card");
  const frame = $("cardFrame");
  const inputs = Object.fromEntries(FIELDS.map((k) => [k, $(k)]));
  const outs = { nama: $("outNama"), kelas: $("outKelas"), tahun: $("outTahun"), impian: $("outImpian"), kenang: $("outKenang"), pesan: $("outPesan") };

  // quote changes at local midnight
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  $("quoteText").textContent = QUOTES[dayNumber % QUOTES.length];

  function renderCard() {
    for (const k of FIELDS) {
      const v = inputs[k].value.trim();
      const el = outs[k];
      const placeholder = el.dataset.empty ?? "";
      el.textContent = v || placeholder;
      el.classList.toggle("is-empty", !v && placeholder !== "");
    }
    // tags have no placeholder text in the card; they just disappear when empty
    $("outKelas").classList.toggle("is-empty", false);
    $("outTahun").classList.toggle("is-empty", false);
    if (!inputs.kelas.value.trim()) outs.kelas.textContent = "";
    if (!inputs.tahun.value.trim()) outs.tahun.textContent = "";
    $("dreamLine").hidden = !inputs.impian.value.trim() && card.classList.contains("exporting");
  }

  function updateCounters() {
    for (const [k, id] of [["kenang", "kenangCount"], ["pesan", "pesanCount"]]) {
      const n = inputs[k].value.length;
      $(id).textContent = n;
      $(id).parentElement.classList.toggle("warn", n >= 280);
    }
  }

  /* ---------- saving ---------- */
  const saveState = $("saveState");
  function persist() {
    let ok = true;
    for (const k of FIELDS) ok = store.set(k, inputs[k].value) && ok;
    return ok;
  }
  function saveData(explicit) {
    const ok = persist();
    renderCard();
    if (!ok) { saveState.textContent = "Couldn't save (storage is full or blocked)"; if (explicit) toast("Couldn't save. Your browser's storage is full or blocked."); return; }
    saveState.textContent = "Saved just now";
    if (explicit) {
      toast("Saved");
      if (!reducedMotion && typeof confetti === "function") confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
    }
  }

  let autoTimer;
  for (const k of FIELDS) {
    inputs[k].addEventListener("input", () => {
      renderCard(); updateCounters();
      saveState.textContent = "Saving…";
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => saveData(false), 600);
    });
  }
  $("saveBtn").addEventListener("click", () => saveData(true));
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveData(true); }
  });

  function loadFields() {
    for (const k of FIELDS) inputs[k].value = store.get(k) || "";
    updateCounters();
    renderCard();
  }

  /* ---------- background ---------- */
  const gradientInput = $("gradientInput");
  const swatchBox = $("presetSwatches");
  function applyBg(val, remember = true) {
    frame.style.setProperty("--backdrop", val);
    if (remember) store.set("userGradient", val);
    swatchBox.querySelectorAll(".swatch").forEach((s) => s.setAttribute("aria-pressed", String(s.dataset.bg === val)));
  }
  BG_PRESETS.forEach((bg, i) => {
    const s = document.createElement("button");
    s.type = "button";
    s.className = "swatch";
    s.dataset.bg = bg;
    s.style.background = bg;
    s.setAttribute("aria-label", `Background ${i + 1}`);
    s.addEventListener("click", () => { applyBg(bg); gradientInput.value = bg; });
    swatchBox.appendChild(s);
  });
  $("gradientBtn").addEventListener("click", () => {
    const val = gradientInput.value.trim();
    if (!val) return;
    if (!CSS.supports("background", val)) { toast("That isn't a valid CSS background."); return; }
    applyBg(val);
    toast("Background applied");
  });
  $("resetBgBtn").addEventListener("click", () => {
    applyBg(DEFAULT_BG, false); store.del("userGradient"); gradientInput.value = "";
    toast("Background reset");
  });
  const savedBg = store.get("userGradient");
  if (savedBg) { applyBg(savedBg, false); gradientInput.value = savedBg; } else applyBg(DEFAULT_BG, false);

  /* ---------- gallery storage (IndexedDB) ---------- */
  const dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
    const req = indexedDB.open("MemoryAppDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("images");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  dbPromise.catch(() => {});
  const idb = {
    async get() {
      const db = await dbPromise;
      return new Promise((res, rej) => { const r = db.transaction("images").objectStore("images").get("galleryImages"); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); });
    },
    async put(list) {
      const db = await dbPromise;
      return new Promise((res, rej) => { const tx = db.transaction("images", "readwrite"); tx.objectStore("images").put(list, "galleryImages"); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    },
    async del() {
      const db = await dbPromise;
      return new Promise((res, rej) => { const tx = db.transaction("images", "readwrite"); tx.objectStore("images").delete("galleryImages"); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    },
  };

  /* ---------- image helpers ---------- */
  // Big phone photos are shrunk before they are stored, so the gallery stays fast and backups stay small.
  function shrink(file, maxSide = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't open that image")); };
      img.src = url;
    });
  }
  const readAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(file); });

  /* ---------- profile photo ---------- */
  const avatarInput = $("avatarInput");
  const avatarPreview = $("avatarPreview");
  const resultAvatar = $("resultAvatar");
  const avatarRemove = $("avatarRemove");
  const cropModal = $("cropModal");
  const cropImage = $("cropImage");
  let cropper = null;

  function setAvatar(dataUrl) {
    if (!dataUrl) {
      avatarPreview.textContent = "+";
      resultAvatar.innerHTML = "";
      avatarRemove.hidden = true;
      return;
    }
    for (const target of [avatarPreview, resultAvatar]) {
      target.textContent = "";
      const img = document.createElement("img");
      img.src = dataUrl; img.alt = "";
      target.appendChild(img);
    }
    avatarRemove.hidden = false;
  }
  function closeCrop() {
    if (cropper) { cropper.destroy(); cropper = null; }
    cropImage.removeAttribute("src");
    cropModal.hidden = true;
  }
  const pickAvatar = () => avatarInput.click();
  $("avatarBtn").addEventListener("click", pickAvatar);
  $("avatarPick").addEventListener("click", pickAvatar);
  avatarRemove.addEventListener("click", () => { store.del("userAvatar"); setAvatar(null); toast("Photo removed"); });

  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    avatarInput.value = "";
    if (!file) return;
    try {
      const dataUrl = await readAsDataURL(file);
      cropImage.src = dataUrl;
      cropModal.hidden = false;
      if (cropper) cropper.destroy();
      cropper = typeof Cropper === "function" ? new Cropper(cropImage, { aspectRatio: 1, viewMode: 1, autoCropArea: 1, background: false }) : null;
      $("cropConfirm").focus();
    } catch { toast("Couldn't open that image"); }
  });

  $("cropConfirm").addEventListener("click", () => {
    let canvas;
    if (cropper) {
      canvas = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: "high" });
    } else {                                   // cropper library didn't load (offline): centre-crop instead
      const s = Math.min(cropImage.naturalWidth, cropImage.naturalHeight);
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      canvas.getContext("2d").drawImage(cropImage, (cropImage.naturalWidth - s) / 2, (cropImage.naturalHeight - s) / 2, s, s, 0, 0, 256, 256);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setAvatar(dataUrl);
    if (!store.set("userAvatar", dataUrl)) toast("Photo shown, but your browser couldn't store it.");
    else toast("Profile photo saved");
    closeCrop();
  });
  $("cropCancel").addEventListener("click", closeCrop);
  cropModal.addEventListener("click", (e) => { if (e.target === cropModal) closeCrop(); });

  /* ---------- gallery ---------- */
  const gallery = $("gallery");
  const imageInput = $("images");
  let images = [];
  let dragIndex = null;

  async function saveGallery() {
    try { await idb.put(images); }
    catch { toast("Couldn't store your photos in this browser."); }
    renderGallery();
  }

  function iconButton(label, text, cls, onClick) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = text; b.className = cls || "";
    b.setAttribute("aria-label", label); b.title = label;
    b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
    return b;
  }
  function move(from, to) {
    if (to < 0 || to >= images.length) return;
    images.splice(to, 0, images.splice(from, 1)[0]);
    saveGallery();
  }

  function renderGallery() {
    gallery.textContent = "";
    if (!images.length) {
      const empty = document.createElement("div");
      empty.className = "gallery-empty";
      empty.textContent = "No photos yet. Add the first one with the button above.";
      gallery.appendChild(empty);
      return;
    }
    images.forEach((src, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.draggable = true;
      item.dataset.index = index;

      const open = document.createElement("button");
      open.type = "button"; open.className = "open";
      open.setAttribute("aria-label", `Open photo ${index + 1} of ${images.length}`);
      const img = document.createElement("img");
      img.src = src; img.loading = "lazy"; img.alt = "";
      open.appendChild(img);
      open.addEventListener("click", () => openLightbox(index));

      const tools = document.createElement("div");
      tools.className = "tools";
      tools.append(
        iconButton("Move earlier", "‹", "", () => move(index, index - 1)),
        iconButton("Remove photo", "×", "rm", () => { images.splice(index, 1); saveGallery(); }),
        iconButton("Move later", "›", "", () => move(index, index + 1)),
      );
      item.append(open, tools);
      gallery.appendChild(item);
    });
  }

  $("addPhotos").addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", async () => {
    const files = [...imageInput.files];
    imageInput.value = "";
    if (!files.length) return;
    let added = 0;
    for (const f of files) {
      try { images.push(await shrink(f)); added++; } catch { /* skip unreadable files */ }
    }
    if (added) { await saveGallery(); toast(added === 1 ? "Photo added" : `${added} photos added`); }
    else toast("Couldn't open those images");
  });

  gallery.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    dragIndex = Number(item.dataset.index);
    item.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  gallery.addEventListener("dragend", () => { dragIndex = null; renderGallery(); });
  gallery.addEventListener("dragover", (e) => e.preventDefault());
  gallery.addEventListener("drop", (e) => {
    e.preventDefault();
    const item = e.target.closest(".gallery-item");
    if (!item || dragIndex === null) return;
    const to = Number(item.dataset.index), from = dragIndex;
    dragIndex = null;
    if (to !== from) move(from, to);
  });

  /* ---------- lightbox ---------- */
  const lightbox = $("lightbox");
  const lightboxImg = $("lightboxImg");
  let lbIndex = 0;
  function showLightbox(i) {
    if (!images.length) { closeLightbox(); return; }
    lbIndex = (i + images.length) % images.length;
    lightboxImg.src = images[lbIndex];
    lightboxImg.alt = `Memory photo ${lbIndex + 1} of ${images.length}`;
    const many = images.length > 1;
    $("lightboxPrev").hidden = !many; $("lightboxNext").hidden = !many;
  }
  function openLightbox(i) { lightbox.hidden = false; showLightbox(i); $("lightboxClose").focus(); }
  function closeLightbox() { lightbox.hidden = true; lightboxImg.removeAttribute("src"); }
  $("lightboxClose").addEventListener("click", closeLightbox);
  $("lightboxPrev").addEventListener("click", () => showLightbox(lbIndex - 1));
  $("lightboxNext").addEventListener("click", () => showLightbox(lbIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!lightbox.hidden) closeLightbox(); if (!cropModal.hidden) closeCrop(); }
    if (!lightbox.hidden && e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (!lightbox.hidden && e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  /* ---------- download and share ---------- */
  // The frame (card + chosen background) is what gets rendered, so the file matches the screen.
  async function renderImage() {
    if (typeof html2canvas !== "function") throw new Error("The image library didn't load. Connect to the internet once and reload.");
    card.classList.add("exporting");
    renderCard();
    try { return await html2canvas(frame, { scale: 2, useCORS: true, backgroundColor: null }); }
    finally { card.classList.remove("exporting"); renderCard(); }
  }
  const toBlob = (canvas) => new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Couldn't make the image"))), "image/png"));
  const fileName = () => `${(inputs.nama.value.trim() || "memories").replace(/[^\w\- ]+/g, "").trim() || "memories"}.png`;

  function saveBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function withBusy(btn, label, fn) {
    const text = btn.textContent;
    btn.disabled = true; btn.textContent = label;
    try { await fn(); } finally { btn.disabled = false; btn.textContent = text; }
  }

  $("downloadBtn").addEventListener("click", (e) => withBusy(e.currentTarget, "Preparing…", async () => {
    try { saveBlob(await toBlob(await renderImage()), fileName()); toast("Card downloaded"); }
    catch (err) { toast(err.message || "Couldn't download the card"); }
  }));

  $("shareBtn").addEventListener("click", (e) => withBusy(e.currentTarget, "Preparing…", async () => {
    try {
      const blob = await toBlob(await renderImage());
      const file = new File([blob], fileName(), { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "What Remains", files: [file] });
      } else if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast("Card copied to the clipboard");
      } else {
        saveBlob(blob, fileName());
        toast("Sharing isn't supported here, so the card was downloaded instead");
      }
    } catch (err) {
      if (err.name !== "AbortError") toast(err.message || "Couldn't share the card");
    }
  }));

  /* ---------- backup ---------- */
  $("exportBtn").addEventListener("click", async () => {
    let gallery_ = images;
    try { gallery_ = await idb.get(); } catch { /* use what is in memory */ }
    const data = { app: "what-remains", version: 2, exported_at: new Date().toISOString() };
    for (const k of FIELDS) data[k] = store.get(k) || "";
    data.avatar = store.get("userAvatar") || "";
    data.gradient = store.get("userGradient") || "";
    data.gallery = gallery_;
    saveBlob(new Blob([JSON.stringify(data)], { type: "application/json" }), `whatremains-backup-${new Date().toLocaleDateString("en-CA")}.json`);
    toast("Backup exported");
  });

  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !FIELDS.some((k) => typeof data[k] === "string") && !Array.isArray(data.gallery)) throw new Error("not a backup");
      const hasWork = FIELDS.some((k) => inputs[k].value.trim()) || images.length;
      if (hasWork && !confirm("Importing replaces what's on this page now. Continue?")) return;

      for (const k of FIELDS) { const v = typeof data[k] === "string" ? data[k].slice(0, k === "kenang" || k === "pesan" ? 300 : 200) : ""; store.set(k, v); }
      if (typeof data.avatar === "string" && data.avatar.startsWith("data:image/")) { store.set("userAvatar", data.avatar); setAvatar(data.avatar); } else { store.del("userAvatar"); setAvatar(null); }
      if (typeof data.gradient === "string" && data.gradient && CSS.supports("background", data.gradient)) { applyBg(data.gradient); gradientInput.value = data.gradient; }

      images = (Array.isArray(data.gallery) ? data.gallery : []).filter((s) => typeof s === "string" && s.startsWith("data:image/"));
      await saveGallery();
      loadFields();
      toast("Backup imported");
    } catch { toast("That doesn't look like a What Remains backup."); }
  });

  /* ---------- clear ---------- */
  $("clearBtn").addEventListener("click", async () => {
    if (!confirm("Clear everything on this page, including photos? This can't be undone.")) return;
    [...FIELDS, "userAvatar", "userGradient"].forEach(store.del);
    for (const k of FIELDS) inputs[k].value = "";
    setAvatar(null); applyBg(DEFAULT_BG, false); gradientInput.value = "";
    images = [];
    try { await idb.del(); } catch { /* nothing stored */ }
    renderGallery(); updateCounters(); renderCard();
    saveState.textContent = "Saves as you type";
    toast("Everything cleared");
  });

  /* ---------- start ---------- */
  loadFields();
  setAvatar(store.get("userAvatar"));
  renderGallery();
  idb.get().then((list) => { images = list; renderGallery(); }).catch(() => {});
})();
