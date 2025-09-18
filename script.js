// Quiz chấm điểm
function kiemTraQuiz() {
  let diem = 0;
  const answers = { q1: "b", q2: "c", q3: "a", q4: "d", q5: "b" };
  Object.keys(answers).forEach(q => {
    const chon = document.querySelector(`input[name="${q}"]:checked`);
    if (chon && chon.value === answers[q]) diem++;
  });
  document.getElementById("quizResult").innerHTML =
    `✅ Bạn được ${diem}/5 điểm. ${diem >= 4 ? "Xuất sắc! 👏" : "Hãy xem lại kiến thức nhé!"}`;
}


