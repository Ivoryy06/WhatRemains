let userInitiatedAvatarPick = false;

const BG_PRESETS = [
  "linear-gradient(160deg,#0f2027,#203a43,#2c5364)",
  "linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)",
  "linear-gradient(160deg,#200122,#6f0000)",
  "linear-gradient(160deg,#0d324d,#7f5a83)",
  "linear-gradient(160deg,#134e5e,#71b280)",
  "linear-gradient(160deg,#1f1c2c,#928dab)",
  "linear-gradient(160deg,#373b44,#4286f4)",
  "linear-gradient(160deg,#2d1b69,#11998e)",
];

document.addEventListener("DOMContentLoaded", () => {

  /* ── ELEMENTS ── */
  const nama   = document.getElementById("nama");
  const kelas  = document.getElementById("kelas");
  const tahun  = document.getElementById("tahun");
  const impian = document.getElementById("impian");
  const kenang = document.getElementById("kenang");
  const pesan  = document.getElementById("pesan");

  const outNama   = document.getElementById("outNama");
  const outKelas  = document.getElementById("outKelas");
  const outTahun  = document.getElementById("outTahun");
  const outImpian = document.getElementById("outImpian");
  const outKenang = document.getElementById("outKenang");
  const outPesan  = document.getElementById("outPesan");

  const resultCard   = document.getElementById("resultCard");
  const resultAvatar = document.getElementById("resultAvatar");
  const saveBtn      = document.getElementById("saveBtn");
  const gradientBtn  = document.getElementById("gradientBtn");
  const resetBgBtn   = document.getElementById("resetBgBtn");
  const kenangCount  = document.getElementById("kenangCount");
  const pesanCount   = document.getElementById("pesanCount");

  /* ── TOAST ── */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
  }

  /* ── THEME TOGGLE ── */
  const themeToggle = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  /* ── BACKGROUND ── */
  const DEFAULT_BG = "linear-gradient(160deg,#0f2027,#203a43,#2c5364)";

  function applyBg(val) {
    document.body.style.background = val;
    localStorage.setItem("userGradient", val);
  }

  const savedGradient = localStorage.getItem("userGradient");
  if (savedGradient) {
    document.body.style.background = savedGradient;
    document.getElementById("gradientInput").value = savedGradient;
  }

  // Preset swatches
  const swatchContainer = document.getElementById("presetSwatches");
  BG_PRESETS.forEach(bg => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.background = bg;
    s.title = bg;
    s.addEventListener("click", () => {
      applyBg(bg);
      document.getElementById("gradientInput").value = bg;
      toast("Background applied");
    });
    swatchContainer.appendChild(s);
  });

  gradientBtn.addEventListener("click", () => {
    const val = document.getElementById("gradientInput").value.trim();
    if (!val) return;
    applyBg(val);
    toast("Background applied");
  });

  resetBgBtn.addEventListener("click", () => {
    applyBg(DEFAULT_BG);
    document.getElementById("gradientInput").value = "";
    toast("Background reset");
  });

  /* ── INDEXEDDB ── */
  const dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open("MemoryAppDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("images");
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });

  /* ── AVATAR & CROPPER ── */
  const avatarInput   = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const cropModal     = document.getElementById("cropModal");
  const cropImage     = document.getElementById("cropImage");
  const cropConfirm   = document.getElementById("cropConfirm");
  const cropCancel    = document.getElementById("cropCancel");
  let cropper = null;

  cropModal.style.display = "none";
  cropImage.src = "";

  function setAvatar(dataUrl) {
    avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Profile">`;
    resultAvatar.innerHTML  = `<img src="${dataUrl}" alt="Profile">`;
    localStorage.setItem("userAvatar", dataUrl);
  }

  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) setAvatar(savedAvatar);

  document.querySelector('label[for="avatarInput"]').addEventListener("click", () => {
    userInitiatedAvatarPick = true;
  });

  avatarInput.addEventListener("change", () => {
    if (!userInitiatedAvatarPick) { avatarInput.value = ""; return; }
    const file = avatarInput.files[0];
    if (!file) return;
    userInitiatedAvatarPick = false;

    const reader = new FileReader();
    reader.onload = e => {
      cropImage.src = e.target.result;
      cropModal.style.display = "flex";
      if (cropper) { cropper.destroy(); cropper = null; }
      cropper = new Cropper(cropImage, { aspectRatio: 1, viewMode: 1, autoCropArea: 1, background: false });
    };
    reader.readAsDataURL(file);
  });

  cropConfirm.addEventListener("click", () => {
    if (!cropper) return;
    const dataUrl = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: "high" }).toDataURL("image/png");
    setAvatar(dataUrl);
    cropper.destroy(); cropper = null;
    cropImage.src = "";
    cropModal.style.display = "none";
    avatarInput.value = "";
    toast("Profile photo saved");
  });

  cropCancel.addEventListener("click", () => {
    if (cropper) { cropper.destroy(); cropper = null; }
    cropImage.src = "";
    cropModal.style.display = "none";
    avatarInput.value = "";
  });

  /* ── FIELDS ── */
  function loadFields() {
    nama.value   = localStorage.getItem("nama")   || "";
    kelas.value  = localStorage.getItem("kelas")  || "";
    tahun.value  = localStorage.getItem("tahun")  || "";
    impian.value = localStorage.getItem("impian") || "";
    kenang.value = localStorage.getItem("kenang") || "";
    pesan.value  = localStorage.getItem("pesan")  || "";
    kenangCount.textContent = kenang.value.length;
    pesanCount.textContent  = pesan.value.length;
    if (nama.value || kelas.value || tahun.value) resultCard.classList.add("show");
  }

  function updateOutput() {
    outNama.textContent   = nama.value;
    outKelas.textContent  = kelas.value;
    outTahun.textContent  = tahun.value;
    outImpian.textContent = impian.value;
    outKenang.textContent = kenang.value;
    outPesan.textContent  = pesan.value;
  }

  function saveData() {
    ["nama","kelas","tahun","impian","kenang","pesan"].forEach(k =>
      localStorage.setItem(k, document.getElementById(k).value)
    );
    updateOutput();
    resultCard.classList.add("show");
    toast("Memories saved ✓");
  }

  saveBtn.addEventListener("click", saveData);

  // Debounced auto-save
  let autoTimer;
  [nama, kelas, tahun, impian, kenang, pesan].forEach(el => {
    el.addEventListener("input", () => {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(saveData, 900);
    });
  });

  // Char counters
  kenang.addEventListener("input", () => kenangCount.textContent = kenang.value.length);
  pesan.addEventListener("input",  () => pesanCount.textContent  = pesan.value.length);

  /* ── CLEAR ALL ── */
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear all saved data? This cannot be undone.")) return;
    localStorage.clear();
    [nama, kelas, tahun, impian, kenang, pesan].forEach(el => el.value = "");
    kenangCount.textContent = "0";
    pesanCount.textContent  = "0";
    avatarPreview.innerHTML = "👤";
    resultAvatar.innerHTML  = "";
    resultCard.classList.remove("show");
    updateOutput();
    images = [];
    renderGallery();
    dbPromise.then(db => {
      const tx = db.transaction("images", "readwrite");
      tx.objectStore("images").delete("galleryImages");
    });
    document.body.style.background = DEFAULT_BG;
    toast("All data cleared");
  });

  /* ── GALLERY ── */
  const gallery    = document.getElementById("gallery");
  const imageInput = document.getElementById("images");
  let images    = [];
  let dragIndex = null;

  async function saveGallery() {
    try {
      const db = await dbPromise;
      const tx = db.transaction("images", "readwrite");
      tx.objectStore("images").put(images, "galleryImages");
      tx.oncomplete = () => renderGallery();
    } catch (err) { console.error(err); }
  }

  async function initGallery() {
    try {
      const db  = await dbPromise;
      const req = db.transaction("images").objectStore("images").get("galleryImages");
      req.onsuccess = () => { images = req.result || []; renderGallery(); };
    } catch (err) { console.error(err); }
  }

  function renderGallery() {
    gallery.innerHTML = "";
    if (images.length === 0) {
      gallery.innerHTML = `<div class="gallery-empty">📷 No photos yet.<br>Add your first memory above.</div>`;
      return;
    }
    images.forEach((src, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "gallery-item";
      wrapper.draggable = true;
      wrapper.dataset.index = index;

      const img = document.createElement("img");
      img.src = src; img.loading = "lazy"; img.alt = `Memory photo ${index + 1}`;
      img.addEventListener("click", () => openLightbox(src));

      const btn = document.createElement("button");
      btn.className = "remove-btn";
      btn.textContent = "✕";
      btn.setAttribute("aria-label", "Remove photo");
      btn.onclick = e => { e.stopPropagation(); images.splice(index, 1); saveGallery(); };

      wrapper.append(img, btn);
      gallery.appendChild(wrapper);
    });
  }

  imageInput.addEventListener("change", () => {
    Array.from(imageInput.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => { images.push(e.target.result); saveGallery(); };
      reader.readAsDataURL(file);
    });
    imageInput.value = "";
    toast("Photos added");
  });

  gallery.addEventListener("dragstart", e => {
    const item = e.target.closest(".gallery-item");
    if (item) dragIndex = Number(item.dataset.index);
  });
  gallery.addEventListener("dragover", e => e.preventDefault());
  gallery.addEventListener("drop", e => {
    const item = e.target.closest(".gallery-item");
    if (!item || dragIndex === null) return;
    const dropIndex = Number(item.dataset.index);
    images.splice(dropIndex, 0, images.splice(dragIndex, 1)[0]);
    dragIndex = null;
    saveGallery();
  });

  /* ── LIGHTBOX ── */
  const lightbox      = document.getElementById("lightbox");
  const lightboxImg   = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add("open");
  }

  lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") lightbox.classList.remove("open"); });

  /* ── DOWNLOAD ── */
  document.getElementById("downloadBtn").addEventListener("click", () => {
    html2canvas(resultCard, { scale: 2, useCORS: true }).then(canvas => {
      const a = document.createElement("a");
      a.download = `${nama.value || "memories"}.png`;
      a.href = canvas.toDataURL();
      a.click();
      toast("Card downloaded");
    });
  });

  /* ── INIT ── */
  loadFields();
  updateOutput();
  initGallery();

});
