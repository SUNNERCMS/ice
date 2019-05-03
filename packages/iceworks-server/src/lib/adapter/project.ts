import * as path from 'path';
import * as pathExists from 'path-exists';
import * as fs from 'fs';
import junk from 'junk';
import * as util from 'util';
import { IProjectPage, IProjectDependency } from '../../interface';
const originalReaddir = util.promisify(fs.readdir);

const readdir = async (targetPath) => {
  if (pathExists.sync(targetPath)) {
    return (await originalReaddir(targetPath)).filter(junk.not);
  }
  return [];
};

const recursive = async function(dirPath) {
  const list = [];
  const files = await readdir(dirPath);
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.lstatSync(fullPath);
    if (stats.isDirectory()) {
      const { atime, birthtime, ctime, mtime } = stats;
      list.push({
        name: path.basename(fullPath),
        fullPath,
        atime,
        birthtime,
        ctime,
        mtime,
      });
    }
  });

  return list;
};

export default class Project {
  public readonly name: string;

  public readonly folderPath: string;

  constructor(folderPath: string) {
    this.name = path.basename(folderPath);
    this.folderPath = folderPath;
  }

  async getPages(): Promise<IProjectPage[]> {
    return recursive(path.join(this.folderPath, 'src', 'pages'));
  }

  async getDependencies(): Promise<IProjectDependency[]> {
    return [
      {
        package: 'icestore',
        dev: false,
        specifyingVersion: '^0.1.0'
      }
    ];
  }
}
