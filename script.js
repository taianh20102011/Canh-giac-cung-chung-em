document.addEventListener("DOMContentLoaded", () => {
  // Slideshow ảnh header
  const slides = document.querySelectorAll(".header-slider img");
  if (slides.length > 0) {
    let index = 0;
    slides[index].classList.add("active");
    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 2500);
  }

  // Quiz chấm điểm
  document.getElementById("submitQuiz")?.addEventListener("click", () => {
    let diem = 0;

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

    const tong = Object.keys(answers).length;
    document.getElementById("quizResult").innerHTML =
      `✅ Bạn được ${diem}/${tong} điểm. ${
        diem >= tong * 0.8 ? "Xuất sắc! 👏" : "Hãy ôn lại thêm nhé!"
      }`;
  });
});
