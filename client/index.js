document.addEventListener('DOMContentLoaded', function () {
  const allMails = document.querySelectorAll('.mail');
  for (const mailEL of allMails) {
    mailEL.onclick = function () {
      window.location.href = mailEL.dataset.src;
    };
  }
});
