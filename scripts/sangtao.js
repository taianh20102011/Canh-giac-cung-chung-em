    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyA-w4aviFPK1-wtE_pVN01saRCq5bdgL9c",
      authDomain: "cungchungemcanhgiac.firebaseapp.com",
      databaseURL: "https://cungchungemcanhgiac-default-rtdb.firebaseio.com",
      projectId: "cungchungemcanhgiac",
      storageBucket: "cungchungemcanhgiac.appspot.com",
      messagingSenderId: "24327141155",
      appId: "1:24327141155:web:139b53155d697a7af87e96"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Convert file → Base64
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    }

    const formST = document.getElementById("formSangTao");
    const submitLoader = document.getElementById("submitLoader");
    const listLoader = document.getElementById("listLoader");
    const dsBox = document.getElementById("dsSangTao");

    // 📤 Gửi sáng tạo
    formST.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ten = document.getElementById("tenSangTao").value.trim();
      const moTa = document.getElementById("moTa").value.trim();
      const file = document.getElementById("anh").files[0];

      if (!ten || !moTa) {
        alert("⚠️ Vui lòng nhập tên và mô tả");
        return;
      }

      submitLoader.classList.remove("hidden");

      try {
        let anhBase64 = "";
        if (file) {
          anhBase64 = await fileToBase64(file);
        }

        await push(ref(db, "sang_tao"), {
          ten,
          moTa,
          anhBase64,
          time: Date.now()
        });

        formST.reset();
      } catch (err) {
        console.error("❌ Lỗi khi lưu:", err);
        alert("⚠️ Không thể gửi sáng tạo!");
      } finally {
        submitLoader.classList.add("hidden");
      }
    });

    // 👀 Hiển thị realtime
    onValue(ref(db, "sang_tao"), (snapshot) => {
      dsBox.innerHTML = "";
      listLoader.classList.add("hidden");

      const data = snapshot.val();
      if (!data) {
        dsBox.innerHTML = "<p class='center'>Chưa có sáng tạo nào.</p>";
        return;
      }

      Object.values(data)
        .sort((a, b) => b.time - a.time)
        .forEach((d) => {
          const div = document.createElement("div");
          div.className = "card";
          div.innerHTML = `<b>${d.ten}</b>: ${d.moTa}`;
          if (d.anhBase64) {
            const img = document.createElement("img");
            img.src = d.anhBase64;
            img.style.maxWidth = "100%";
            img.style.marginTop = "8px";
            div.appendChild(img);
          }
          dsBox.appendChild(div);
        });
    });
