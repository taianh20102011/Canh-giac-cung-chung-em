// Quiz chấm điểm
function kiemTraQuiz() {
  let diem = 0;

  // ✅ Đáp án đúng (bạn có thể thêm q6, q7... tùy ý)
  const answers = {
    q1: "b",
    q2: "b",
    q3: "a",
    q4: "a",
    q5: "b",
    q6: "b",
    q7: "a",
    q8: "b",
    q9: "b",
    q10: "b"
  };

  Object.keys(answers).forEach(q => {
    const chon = document.querySelector(`input[name="${q}"]:checked`);
    if (chon && chon.value === answers[q]) diem++;
  });

  const tong = Object.keys(answers).length; // tự động tính tổng số câu
  document.getElementById("quizResult").innerHTML =
    `✅ Bạn được ${diem}/${tong} điểm. ${
      diem >= tong * 0.8 ? "Xuất sắc! 👏" : "Hãy ôn lại thêm nhé!"
    }`;
}

// Slideshow ảnh header
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".header-slider img");
  let index = 0;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 2500); // đổi ảnh mỗi 2.5 giây
});
