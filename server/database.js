const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const { MEMBER_NAMES } = require('../utils');
class Database {
  constructor() {
    this.indexFilePath = path.join(
      __dirname,
      '../',
      settings.app.mailViewerFile
    );
    this.mailsDirectory = path.join(__dirname, '../', settings.app.mailFolder);
    this.imagesDirectory = settings.app.imagesFolder;
    this.defaultIndexFileName = 'index.html';
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

  async memberDirectoryPaths(directory = this.mailsDirectory) {
    const dirs = await fs.promises.readdir(directory);

    const memberPaths = await Promise.all(
      dirs.map(async (file) => {
        const newPath = path.join(directory, file);
        const stat = await fs.promises.lstat(newPath);

        if (stat.isDirectory()) {
          const parsedDir = path.parse(file);
          if (MEMBER_NAMES.includes(parsedDir.name)) {
            return file;
          }
        }
      })
    );

    return memberPaths.filter((path) => !!path);
  }

  async localMails(directory = this.mailsDirectory, fullPath = false) {
    const files = await fs.promises.readdir(directory);

    const htmlFiles = await Promise.all(
      files.map(async (file) => {
        const newPath = path.join(directory, file);
        const stat = await fs.promises.lstat(newPath);

        if (stat.isDirectory()) {
          return this.localMails(newPath, fullPath);
        }

        const parsedFile = path.parse(file);
        if (
          stat.isFile() &&
          parsedFile.ext === '.html' &&
          parsedFile.name !== 'index'
        ) {
          return fullPath ? newPath : file;
        }
      })
    );

    const filtered = htmlFiles.flat().filter((file) => file !== undefined);
    return fullPath ? filtered : filtered.map((file) => file.slice(0, 6));
  }
}

module.exports = Database;
