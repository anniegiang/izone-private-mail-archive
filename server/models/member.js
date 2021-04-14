class Member {
  constructor(member) {
    this.id = member.id;
    this.name = member.realname_ko;
    this.imageUrl = member.image_url;
  }

  setImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
  }
}

module.exports = Member;
