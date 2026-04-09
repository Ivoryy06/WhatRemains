let userInitiatedAvatarPick = false;

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     ELEMENT REFERENCES
  =============================== */
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

  const resultCard  = document.getElementById("resultCard");
  const congratsDiv = document.getElementById("congrats");
  const saveBtn     = document.getElementById("saveBtn");
  const gradientBtn = document.getElementById("gradientBtn");

  const kenangCount = document.getElementById("kenangCount");
  const pesanCount  = document.getElementById("pesanCount");

  /* ===============================
     LOAD SAVED GRADIENT
  =============================== */
  const savedGradient = localStorage.getItem("userGradient");
  if (savedGradient) {
    document.body.style.background = savedGradient;
    document.getElementById("gradientInput").value = savedGradient;
  }

  /* ===============================
     INDEXEDDB SETUP
  =============================== */
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("MemoryAppDB", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("images");
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });

  /* ===============================
     AVATAR & CROPPER
  =============================== */
  const avatarInput  = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const cropModal    = document.getElementById("cropModal");
  const cropImage    = document.getElementById("cropImage");
  const cropConfirm  = document.getElementById("cropConfirm");
  const cropCancel   = document.getElementById("cropCancel");

  let cropper = null;

  // Force modal closed on load
  cropModal.style.display = "none";
  cropImage.src = "";

  // Load saved avatar
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) {
    avatarPreview.innerHTML = `<img src="${savedAvatar}" alt="Profile">`;
  }

  // Set flag when user intentionally clicks the label
  document.querySelector('label[for="avatarInput"]').addEventListener("click", () => {
    userInitiatedAvatarPick = true;
  });

  avatarInput.addEventListener("change", () => {
    if (!userInitiatedAvatarPick) {
      avatarInput.value = "";
      return;
    }

    const file = avatarInput.files[0];
    if (!file) return;
    userInitiatedAvatarPick = false;

    const reader = new FileReader();
    reader.onload = e => {
      cropImage.src = e.target.result;
      cropModal.style.display = "flex";

      if (cropper) { cropper.destroy(); cropper = null; }

      cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        background: false,
        responsive: true
      });
    };
    reader.readAsDataURL(file);
  });

  cropConfirm.addEventListener("click", () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingQuality: "high" });
    const dataUrl = canvas.toDataURL("image/png");

    avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Profile">`;
    localStorage.setItem("userAvatar", dataUrl);

    cropper.destroy();
    cropper = null;
    cropImage.src = "";
    cropModal.style.display = "none";
    avatarInput.value = "";
  });

  cropCancel.addEventListener("click", () => {
    if (cropper) { cropper.destroy(); cropper = null; }
    cropImage.src = "";
    cropModal.style.display = "none";
    avatarInput.value = "";
  });

  /* ===============================
     SAVE & RENDER
  =============================== */
  function loadFields() {
    nama.value   = localStorage.getItem("nama")   || "";
    kelas.value  = localStorage.getItem("kelas")  || "";
    tahun.value  = localStorage.getItem("tahun")  || "";
    impian.value = localStorage.getItem("impian") || "";
    kenang.value = localStorage.getItem("kenang") || "";
    pesan.value  = localStorage.getItem("pesan")  || "";

    kenangCount.textContent = kenang.value.length;
    pesanCount.textContent  = pesan.value.length;

    if (nama.value || kelas.value || tahun.value) {
      resultCard.classList.add("show");
    }
  }

  function updateOutput() {
    outNama.textContent   = nama.value;
    outKelas.textContent  = kelas.value;
    outTahun.textContent  = tahun.value;
    outImpian.textContent = impian.value;
    outKenang.textContent = kenang.value;
    outPesan.textContent  = pesan.value;
  }

  function renderCongrats() {
    const n  = nama.value   || "Friend";
    const k  = kelas.value  || "your class";
    const t  = tahun.value  || "this year";
    const i  = impian.value || "your dream";

    congratsDiv.innerHTML = `
      <p>
        Congratulations <b>${n}</b> from <b>${k}</b> on graduating in <b>${t}</b>!
        May your dream of becoming <b>${i}</b> come true.
      </p>
    `;
    congratsDiv.classList.add("show");
  }

  function saveData() {
    localStorage.setItem("nama",   nama.value);
    localStorage.setItem("kelas",  kelas.value);
    localStorage.setItem("tahun",  tahun.value);
    localStorage.setItem("impian", impian.value);
    localStorage.setItem("kenang", kenang.value);
    localStorage.setItem("pesan",  pesan.value);

    updateOutput();
    renderCongrats();
    resultCard.classList.add("show");
  }

  saveBtn.addEventListener("click", saveData);

  /* ===============================
     AUTO-SAVE (debounced)
  =============================== */
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const autoSave = debounce(() => {
    localStorage.setItem("nama",   nama.value);
    localStorage.setItem("kelas",  kelas.value);
    localStorage.setItem("tahun",  tahun.value);
    localStorage.setItem("impian", impian.value);
    localStorage.setItem("kenang", kenang.value);
    localStorage.setItem("pesan",  pesan.value);
    updateOutput();
  }, 800);

  [nama, kelas, tahun, impian, kenang, pesan].forEach(el => {
    el.addEventListener("input", autoSave);
  });

  /* ===============================
     CHARACTER COUNTER
  =============================== */
  kenang.addEventListener("input", () => {
    kenangCount.textContent = kenang.value.length;
  });

  pesan.addEventListener("input", () => {
    pesanCount.textContent = pesan.value.length;
  });

  /* ===============================
     GALLERY (IndexedDB)
  =============================== */
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
    } catch (err) {
      console.error("Failed to save gallery:", err);
    }
  }

  async function initGallery() {
    try {
      const db = await dbPromise;
      const request = db.transaction("images").objectStore("images").get("galleryImages");
      request.onsuccess = () => {
        images = request.result || [];
        renderGallery();
      };
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  }

  function renderGallery() {
    gallery.innerHTML = "";

    if (images.length === 0) {
      gallery.innerHTML = `
        <div style="
          width: 100%;
          text-align: center;
          padding: 30px 0;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
        ">
          📷 No photos yet.<br>Add your first memory above.
        </div>
      `;
      return;
    }

    images.forEach((src, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "gallery-item";
      wrapper.draggable = true;
      wrapper.dataset.index = index;

      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.alt = `Memory photo ${index + 1}`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.setAttribute("aria-label", "Remove photo");
      removeBtn.onclick = () => {
        images.splice(index, 1);
        saveGallery();
      };

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      gallery.appendChild(wrapper);
    });
  }

  imageInput.addEventListener("change", () => {
    Array.from(imageInput.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        images.push(e.target.result);
        saveGallery();
      };
      reader.readAsDataURL(file);
    });
    imageInput.value = "";
  });

  // Drag-to-reorder
  gallery.addEventListener("dragstart", e => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    dragIndex = Number(item.dataset.index);
  });

  gallery.addEventListener("dragover", e => e.preventDefault());

  gallery.addEventListener("drop", e => {
    const item = e.target.closest(".gallery-item");
    if (!item || dragIndex === null) return;
    const dropIndex = Number(item.dataset.index);
    const moved = images.splice(dragIndex, 1)[0];
    images.splice(dropIndex, 0, moved);
    dragIndex = null;
    saveGallery();
  });

  /* ===============================
     GRADIENT CUSTOMIZER
  =============================== */
  gradientBtn.addEventListener("click", () => {
    const val = document.getElementById("gradientInput").value.trim();
    if (!val) return;
    document.body.style.background = val;
    localStorage.setItem("userGradient", val);
  });

  /* ===============================
     DOWNLOAD
  =============================== */
  document.getElementById("downloadBtn").addEventListener("click", () => {
    html2canvas(resultCard, { scale: 2 }).then(canvas => {
      const a = document.createElement("a");
      a.download = "my-memories.png";
      a.href = canvas.toDataURL();
      a.click();
    });
  });

  /* ===============================
     INIT
  =============================== */
  loadFields();
  updateOutput();
  initGallery();

});
