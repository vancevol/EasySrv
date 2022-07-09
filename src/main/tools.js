import Command from "@/main/Command";
import {hostsPathMap} from "@/main/constant";

export async function openTextFile(filePath) {
    if (!await vscodeIsInstalled()) {
        throw new Error('vscode没有安装');
    }
    let command = `code ${filePath}`;
    await Command.sudoExec(command);
}

export async function vscodeIsInstalled() {
    let command = "code -v";
    let output = await Command.exec(command);
    let reg = /\d+\.\d+\.\d+/;
    return reg.test(output)
}

export async function openHosts() {
    let path = hostsPathMap[process.platform];
    await openTextFile(path);
}
