class Member {
  constructor(member) {
    this.id = member.id;
    this.koreanName = member.realname_ko;
    this.imageUrl = member.image_url;
  }
}

class Mail {
  constructor(mail) {
    this.id = mail.id;
    this.koreanSubject = mail.subject_ko;
    this.koreanContent = mail.content_ko;
    this.receivedDateTime = mail.receive_datetime;
    this.detail = mail.detail;
  }
}

class Inbox {
  constructor() {
    this.mails = {};
  }

  add(mail, member) {
    this.mails[mail.id] = {
      mail,
      member,
    };
  }

  list() {
    return this.mails;
  }
}

module.exports = { Member, Mail, Inbox };
