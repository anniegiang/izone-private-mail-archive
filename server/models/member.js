const { NAMES_JAP_TO_KOR } = require('../../utils');
class Member {
  constructor(member) {
    this.id = member.id;
    this.name = NAMES_JAP_TO_KOR[member.name];
    this.imageUrl = member.image_url;
  }

  addMail(mail) {
    this.mails.push(mail);
  }

  set localDirectoryPath(path) {
    this.localPath = path;
  }

  set setImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
  }
}

module.exports = Member;
