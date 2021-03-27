const fs = require('fs');
const path = require('path');

const saveFile = (htmlContent, directory, fileName) => {
  const directory = path.join(__dirname, directory);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const file = path.join(directory, fileName);

  if (fs.existsSync(file)) {
    return false;
  }

  fs.writeFile(file, htmlContent, 'utf8', function (error) {
    return error ? error : true;
  });
};

const mailHeader = (data) => {
  return `<div id="mail-header">
      <div
        style="display:flex; justify-content: space-between; padding: 20px 15px; border-bottom: 1px solid Gainsboro;">
        <div style="display:flex;">
          <img
            src=${data.memberPhoto}
            style="width: 3rem;
    border-radius: 50%;" />
          <div>
            <h4 style="margin:0;">${data.memberName}</h4>
            <h5 style="font-weight: lighter;  margin:0;">To: <span style="color:gray;">${data.receiverName}</span>
            </h5>
          </div>
        </div>
        <h4 style="color:silver; font-weight: lighter; margin:0;">${mail.date}</h4>
      </div>
      <div style="padding: 20px 15px; border-bottom: 1px solid Gainsboro;">
        <h3 style="margin:0;">${mailSubject}</h3>
      </div>
    </div>`;
};

const htmlStringToDom = (htmlString) => {
  return new JSDOM(htmlString);
};

const removeElements = (document, elementType) => {
  const elements = document.querySelectorAll(elementType);
  for (let element of elements) {
    element.remove();
  }
};

const imageUrlToBase64 = async (imageUrl) => {
  const image = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(image.data).toString('base64');
};
