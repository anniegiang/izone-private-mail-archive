const userSettings = require('./userSettings');

const MEMBER_NAMES = [
  '운영팀',
  '권은비',
  '미야와키 사쿠라',
  '강혜원',
  '최예나',
  '이채연',
  '김채원',
  '김민주',
  '야부키 나코',
  '혼다 히토미',
  '조유리',
  '안유진',
  '장원영',
  'Tim operasional',
  'KWON EUN BI',
  'MIYAWAKI SAKURA',
  'SAKURA MIYAWAKI',
  'KANG HYE WON',
  'CHOI YE NA',
  'LEE CHAE YEON',
  'KIM CHAE WON',
  'KIM MIN JU',
  'YABUKI NAKO',
  'NAKO YABUKI',
  'HONDA HITOMI',
  'HITOMI HONDA',
  'AHN YU JIN',
  'JANG WON YOUNG',
  '運営チーム',
  'クォン・ウンビ',
  '宮脇 咲良',
  'カン・へウォン',
  'チェ・イェナ',
  'イ・チェヨン',
  'キム・チェウォン',
  'キム・ミンジュ',
  '矢吹奈子',
  '本田仁美',
  'チョ・ユリ',
  'アン・ユジン',
  'チャン・ウォニョン',
  'ทีมผู้ให้บริการ',
];

const fileName = (mail, mimeType = 'html', key = '') => {
  const { mailFileName } = userSettings;

  let fileName = `${mail.id}__`;

  if (mailFileName.date) {
    const mailDate = new Date(mail.createdAt).toDateString();
    fileName += `${mailDate}__`;
  }

  if (mailFileName.subject) {
    fileName += `${mail.subject}__`;
  }

  if (key) {
    fileName += `${key}__`;
  }

  fileName += `.${mimeType}`;

  return fileName.replace(/ /g, '-').replace(/\//g, '-');
};

const encodeFullFilePath = (path) => {
  const reg = new RegExp('[mib][0-9]{5}');
  const startIdx = path.search(reg);

  const rootPath = path.slice(0, startIdx);
  const fileName = path.slice(startIdx);
  const encoded = encodeURIComponent(fileName);

  return rootPath + encoded;
};

module.exports = { fileName, encodeFullFilePath, MEMBER_NAMES };
