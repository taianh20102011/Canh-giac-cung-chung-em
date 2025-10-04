import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA-w4aviFPK1-wtE_pVN01saRCq5bdgL9c",
  authDomain: "cungchungemcanhgiac.firebaseapp.com",
  projectId: "cungchungemcanhgiac",
  storageBucket: "cungchungemcanhgiac.appspot.com",
  messagingSenderId: "24327141155",
  appId: "1:24327141155:web:139b53155d697a7af87e96"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lấy id từ URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const baibaoCard = document.getElementById("baibaoCard");

async function loadBaiBao() {
  if (!id) {
    baibaoCard.innerHTML = "<p>❌ Không tìm thấy ID bài báo.</p>";
    return;
  }

  try {
    const ref = doc(db, "bai_bao", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      baibaoCard.innerHTML = "<p>❌ Bài báo không tồn tại.</p>";
      return;
    }

    const data = snap.data();

    let html = `
      <h2>${data.tieuDe}</h2>
      <small>✍️ ${data.tacGia || "Bạn đọc"} — ${
        data.time?.toDate ? data.time.toDate().toLocaleString("vi-VN") : ""
      }</small>
    `;

    if (data.anhBase64) {
      html += `<div><img src="${data.anhBase64}" style="max-width:100%;margin:12px 0;border-radius:8px;"></div>`;
    }

    if (data.noiDung) {
      html += `<p style="white-space:pre-wrap;">${escapeHtml(data.noiDung)}</p>`;
    }

    baibaoCard.innerHTML = `<div class="fade-in">${html}</div>`;
  } catch (err) {
    console.error(err);
    baibaoCard.innerHTML = "<p>❌ Lỗi khi tải bài báo.</p>";
  }
}

function escapeHtml(t) {
  return t
    ? t.replaceAll("&", "&amp;")
         .replaceAll("<", "&lt;")
         .replaceAll(">", "&gt;")
    : "";
}

loadBaiBao();
