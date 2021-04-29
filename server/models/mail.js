const { fileName } = require('../../utils');

class Mail {
  constructor(mail) {
    this.id = mail.id;
    this.memberId = mail.member.id;
    this.subject = mail.subject_ko;
    this.content = mail.content_ko;
    this.createdAt = mail.receive_datetime;
  }

  set mailDetailHTML(mailDetails) {
    this.mailDetails = mailDetails;
  }

  get fileName() {
    return fileName({
      id: this.id,
      createdAt: this.createdAt,
      subject: this.subject,
    });
  }
}

module.exports = Mail;
