class Inbox {
  constructor() {
    this.members = {};
    this.mails = [];
  }

  addMail(mail) {
    this.mails.push(mail);
  }

  addMember(member) {
    this.members[member.id] = member;
  }

  set userProfile(user) {
    this.user = user;
  }
}

module.exports = Inbox;
