//通用且与项目无关的方法
import fs from "fs";
import path from "path";

/**
 * @param path {string}
 * @returns {string}
 */
export function fsReadFile(path){
    return fs.readFileSync(path,{encoding: 'utf8'});
}

/**
 *
 * @param path {string}
 * @returns {boolean}
 */
export function fsExists(path) {
    try {
        fs.accessSync(path);
        return true;
    } catch {
        return false;
    }
}
//todo mv覆盖，已有子文件不删除
export function fsMove(sourcePath, targetPath) {
    return fs.renameSync(sourcePath, targetPath);
}

export function fsDelete(path) {
    return fs.rmSync(path, {force: true, recursive: true});
}

export function getFilNameWithoutExt(filename) {
    return path.parse(filename)?.name;
}

/**
 * 获取指定目录下的所有文件名
 * @param dirPath {string}
 * @param search {string}
 * @returns {string[]}
 */
export function getFilesByDir(dirPath, search = '') {
    let files = fs.readdirSync(dirPath, {withFileTypes: true});
    return files.filter((item) => {
        if (item.name.charAt(0) === '.' || !item.isFile()) {
            return false;
        }
        if (search) {
            return item.name.includes(search);
        }
        return true;
    }).map(item => item.name);
}

/**
 * 获取指定目录下的所有目录名
 * @param dirPath {string}
 * @param search {string}
 * @returns {string[]}
 */
export function getDirsByDir(dirPath, search = '') {
    let files = fs.readdirSync(dirPath, {withFileTypes: true});
    return files.filter((item) => {
        if (item.name.charAt(0) === '.' || !item.isDirectory()) {
            return false;
        }
        if (search) {
            return item.name.includes(search);
        }
        return true;
    }).map(item => item.name);
}
