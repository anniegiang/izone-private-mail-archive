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
  }
}

class BuildInbox {
  // convert xml to json
  // save mail locally
  // probably use node's fs
}
