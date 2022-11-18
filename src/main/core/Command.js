import child_process from "child_process";
import sudo from "sudo-prompt"
import {APP_NAME} from "@/shared/constant";
import App from "@/main/App";
import OS from "@/main/core/OS";

export default class Command {
    /**
     * 执行命令，等待进程退出返回结果（标准输出）
     * @param command
     * @param options
     * @returns {Promise<string>}
     */
    static async exec(command, options = {}) {
        if (App.isDev()) console.log('exec command', command)

        let formatCommand;
        if (OS.isWindows()) {
            formatCommand = '@chcp 65001 >nul & cmd /d/s/c ';
            command = formatCommand + command;
        }

        if (!options.encoding) {
            options.encoding = "utf8";
        }

        try {
            return child_process.execSync(command,options);
        } catch (error) {
            if (OS.isWindows()) {
                // eslint-disable-next-line no-ex-assign
                error = new Error(error.message.replace(formatCommand, ''))
            }
            throw error;
        }
    }

    /**
     *
     * @param command
     * @returns {Promise<unknown>}
     */
    static async sudoExec(command) {
        if (App.isDev()) console.log('sudo exec command', command)

        return await new Promise((resolve, reject) => {
            const options = {
                name: APP_NAME,
                icns:App.getIcnsPath(),
            }
            sudo.exec(command, options, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else if (stderr.lenght > 0) {
                    reject(new Error(stderr.toString()));
                } else {
                    resolve(stdout.toString());
                }
            });
        });
    }
}



