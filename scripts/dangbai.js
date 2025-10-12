// dangbai.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstaticcom/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);

// DOM elements
const loginCard = document.getElementById("loginCard");
const dangbaiCard = document.getElementById("dangbaiCard");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const loginLoader = document.getElementById("loginLoader");
const submitLoader = document.getElementById("submitLoader");
const listLoader = document.getElementById("listLoader");

// Đăng nhập
loginBtn.addEventListener("click", async () => {
  loginLoader.classList.remove("hidden");
  loginMsg.textContent = "Đang đăng nhập...";
  try {
    await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
    loginMsg.style.color = "green";
    loginMsg.textContent = "✅ Đăng nhập thành công!";
  } catch (err) {
    loginMsg.style.color = "red";
    loginMsg.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
  } finally {
    loginLoader.classList.add("hidden");
  }
});

// Khi trạng thái auth thay đổi
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginCard.style.display = "none";
    dangbaiCard.style.display = "block";
  } else {
    loginCard.style.display = "block";
    dangbaiCard.style.display = "none";
  }
});

// Toggle loại bài
const noiBoFields = document.getElementById("noiBoFields");
const ngoaiFields = document.getElementById("ngoaiFields");
document.querySelectorAll('input[name="loaiBai"]').forEach(r => {
  r.addEventListener("change", () => {
    noiBoFields.style.display = r.value === "noiBo" ? "block" : "none";
    ngoaiFields.style.display = r.value === "ngoai" ? "block" : "none";
  });
});

// Helper: file → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Form xử lý
const form = document.getElementById("formDangBai");
const tieuDeEl = document.getElementById("tieuDe");
const tacGiaEl = document.getElementById("tacGia");
const noiDungEl = document.getElementById("noiDung");
const anhEl = document.getElementById("anhBai");
const preview = document.getElementById("preview");
const dsBai = document.getElementById("dsBai");

anhEl.addEventListener("change", async () => {
  preview.innerHTML = "";
  if (anhEl.files[0]) {
    const b64 = await fileToBase64(anhEl.files[0]);
    const img = document.createElement("img");
    img.src = b64;
    img.style.maxWidth = "200px";
    preview.appendChild(img);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitLoader.classList.remove("hidden");

  const tieuDe = tieuDeEl.value.trim();
  const tacGia = tacGiaEl.value.trim() || "Bạn đọc";
  const loai = document.querySelector('input[name="loaiBai"]:checked').value;

  let noiDung = "";
  let anhBase64 = "";
  let linkNgoai = "";

  if (loai === "noiBo") {
    noiDung = noiDungEl.value.trim();
    if (!noiDung) {
      alert("Vui lòng nhập nội dung.");
      submitLoader.classList.add("hidden");
      return;
    }
    if (anhEl.files[0]) {
      anhBase64 = await fileToBase64(anhEl.files[0]);
    }
  } else if (loai === "ngoai") {
    linkNgoai = document.getElementById("linkNgoai").value.trim();
    if (!linkNgoai) {
      alert("Vui lòng nhập link ngoài.");
      submitLoader.classList.add("hidden");
      return;
    }
  }

  try {
    await addDoc(collection(db, "bai_bao"), {
      tieuDe,
      tacGia,
      noiDung,
      anhBase64,
      linkNgoai,
      loai,
      time: new Date()
    });
    alert("✅ Đăng thành công!");
    form.reset();
    preview.innerHTML = "";
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi đăng bài!");
  } finally {
    submitLoader.classList.add("hidden");
  }
});

// Hiển thị danh sách
const q = query(collection(db, "bai_bao"), orderBy("time", "desc"));
onSnapshot(q, (snapshot) => {
  dsBai.innerHTML = "";
  if (snapshot.empty) {
    listLoader.classList.add("hidden");
    dsBai.innerHTML = "<p>Chưa có bài báo nào.</p>";
    return;
  }
  listLoader.classList.add("hidden");
  snapshot.forEach((doc) => {
    const data = doc.data();
    const timeStr = data.time?.toDate ? data.time.toDate().toLocaleString("vi-VN") : "";
    let link = "";
    let icon = data.loai === "ngoai" ? "🔗" : "📄";

    if (data.loai === "ngoai" && data.linkNgoai) {
      link = `<a href="${data.linkNgoai}" target="_blank">${escapeHtml(data.tieuDe || "")}</a>`;
    } else {
      link = `<a href="baibao.html?id=${doc.id}">${escapeHtml(data.tieuDe || "")}</a>`;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${icon} ${link}</h3>
      <small>✍️ ${escapeHtml(data.tacGia || "")} — ${timeStr}</small>
      <p style="white-space:pre-wrap;">${escapeHtml((data.noiDung || "").slice(0, 200))}</p>
    `;
    dsBai.appendChild(card);
  });
});

function escapeHtml(t) {
  return t ? t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;") : "";
}
