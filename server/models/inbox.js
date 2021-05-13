class Inbox {
  constructor() {
    this.members = {};
  }

  addMember(member) {
    this.members[member.id] = member;
  }

  set userProfile(user) {
    this.user = user;
  }
}

module.exports = Inbox;
