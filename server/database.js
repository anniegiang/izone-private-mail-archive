const fs = require('fs');
const path = require('path');
const settings = require('../settings');

class Database {
  constructor() {
    this.mailsDirectory = path.join(__dirname, '../', settings.app.mailFolder);
    this.indexFilePath = path.join(
      __dirname,
      '../',
      settings.app.mailViewerFile
    );
    this.imagesDirectory = settings.app.imagesFolder;
  }

  async setupOutputDirectory() {
    await this.makeDirectory(this.mailsDirectory);
  }

  async writeFile(path, data, dataType) {
    await fs.promises.writeFile(path, data, dataType);
  }

  async readFile(path, data, dataType) {
    return fs.promises.readFile(path, data, dataType);
  }

  async makeDirectory(directory) {
    return fs.promises.mkdir(directory, { recursive: true });
  }

  async directoryExists(directory) {
    try {
      await fs.promises.access(directory);
      return true;
    } catch (error) {
      return false;
    }
  }

  async localMails(directory = this.mailsDirectory) {
    const files = await fs.promises.readdir(directory);

    const htmlFiles = await Promise.all(
      files.map(async (file) => {
        const newPath = path.join(directory, file);
        const stat = await fs.promises.lstat(newPath);

        if (stat.isDirectory()) {
          return this.localMails(newPath);
        }

        const parsedFile = path.parse(file);
        if (
          stat.isFile() &&
          parsedFile.ext === '.html' &&
          parsedFile.name !== 'index'
        ) {
          return file;
        }
      })
    );

    return htmlFiles
      .flat()
      .filter((file) => file !== undefined)
      .map((file) => file.slice(0, 6));
  }
}

module.exports = Database;
