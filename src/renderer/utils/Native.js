import path from "path";
import Command from "@/main/core/Command";
import {shell} from "@electron/remote";
import MessageBox from "@/renderer/utils/MessageBox";
import fixPath from "fix-path";
import Hosts from "@/main/core/Hosts";
import GetPath from "@/shared/utils/GetPath";
import Directory from "@/main/utils/Directory";
import File from "@/main/utils/File";
import OS from "@/main/core/OS";

export default class Native {
    /**
     *
     * @param filePath {string}
     * @param isSudo {boolean}
     * @returns {Promise<void>}
     */
    static async openTextFile(filePath, isSudo = false) {
        if (OS.isMacOS()) {
            fixPath();  //mac下修复环境变量不识别的问题
        }
        try {
            if (!File.Exists(filePath)) {
                throw new Error('文件不存在');
            }

            //todo 默认系统文本编辑器，macos打开hosts时提示，可能无法编辑，请在设置里切换文本编辑器
            let editorPath = path.join('/Applications/','Visual Studio Code.app');
            if (!Directory.Exists(editorPath)) {
                throw new Error('VS Code没有安装');
            }
            let command;
            if(OS.isMacOS()){
                command = `open -a "${editorPath}"  "${filePath}"`;
            }

            //let command = `code ${filePath}`;
            if (isSudo) {
                await Command.sudoExec(command);
            } else {
                await Command.exec(command);
            }
        } catch (error) {
            MessageBox.error(error.message ?? error, '打开文件出错！');
        }

    }

    static async openPath(path) {
        await shell.openPath(path);
    }

    static async openUrl(url) {
        return await shell.openExternal(url);
    }

    static async vscodeIsInstalled() {
        let command = "which code";
        try {
            let output = await Command.exec(command);
            return output && output.trim() !== '';
        } catch {
            return false;
        }
    }

    static async openHosts() {
        let path = GetPath.getHostsPath();
        if (OS.isWindows()) {
            await Native.openTextFile(path);
        } else {
            if (!Hosts.canEditHosts()) {
                await Command.sudoExec(`chmod 666 ${path}`);
            }
            await Native.openTextFile(path);
        }
    }

}
