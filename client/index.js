document.addEventListener('DOMContentLoaded', function () {
  const allMails = document.querySelectorAll('.mail');
  for (const mailEL of allMails) {
    mailEL.onclick = function () {
      const mailPath = mailEL.dataset.src;

      const reg = new RegExp('[mib][0-9]{5}');
      const startIdx = mailPath.search(reg);

      const root = mailPath.slice(0, startIdx);
      const fileName = mailPath.slice(startIdx);
      const encoded = encodeURIComponent(fileName);

      window.location.href = root + encoded;
    };
  }
});
