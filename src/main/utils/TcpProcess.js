import { electronRequire } from '@/main/utils/electron'
import Shell from '@/main/utils/Shell'
import ProcessExtend from '@/main/utils/ProcessExtend'
import { isMacOS, isWindows } from '@/main/utils/utils'

const app = electronRequire('app')

export default class TcpProcess {

    static async getList() {
        if (isMacOS) {
            return await this.getListForMacOS();
        } else if (isWindows) {
            return await this.getListForWindows();
        }
        return [];
    }

    static async getListForMacOS() {
        let commandStr = `lsof -iTCP -sTCP:LISTEN -P -n|awk 'NR!=1{print $1,$2,$3,$5,$9}'`;
        try {
            let resStr = await Shell.sudoExec(commandStr);
            resStr = resStr.trim();
            if (!resStr) {
                return [];
            }
            let list = resStr.split('\n');

            return await Promise.all(
                list.map(async line => {
                    let lineArr = line.split(' ');
                    let name, pid, user, type, ipAndPort;
                    [name, pid, user, type, ipAndPort] = lineArr;
                    let tempArr = ipAndPort.match(/^(.*):(\d+)$/);
                    let ip, port;
                    [,ip, port] = tempArr;

                    let path = await ProcessExtend.getPathByPid(pid);
                    return {name, pid, user, type, ip, port, path, status: 'Listen'};
                })
            );
        } catch (e) {
            return [];
        }
    }

    static async getListForWindows() {
        let commandStr = ` Get-NetTCPConnection -State Listen|select-Object OwningProcess,LocalAddress,LocalPort`;
        commandStr += ', @{n="Name" ;e= {(Get-Process -Id $_.OwningProcess).Name } }  , @{n="Path" ;e= {(Get-Process -Id $_.OwningProcess).Path } }';
        commandStr += ' | fl | Out-String -Width 999';

        try {
            let resStr = await Shell.exec(commandStr, {shell: 'powershell'});
            resStr = resStr.trim();
            if (!resStr) {
                return [];
            }
            let list = resStr.split(/\r?\n\r?\n/);

            return await Promise.all(
                list.map(async item => {
                    let lineArr = item.split(/r?\n/);

                    let arr = lineArr.map(line => {
                        return line.split(' : ')[1]?.trim()
                    });
                    let pid, ip, port, name, path;
                    [pid, ip, port, name, path] = arr;

                    let icon = path ? (await app.getFileIcon(path))?.toDataURL() : null;
                    return {pid, ip, port, name, path, status: 'Listen', icon};
                })
            );
        } catch (e) {
            return [];
        }
    }


    /**
     *
     * @param port
     * @returns {Promise<number|null>}
     */
    static async getPidByPort(port) {
        try {
            let commandStr, resStr, pid;

            if (isWindows) {
                commandStr = `(Get-NetTCPConnection -LocalPort ${port} -State Listen).OwningProcess`;
                resStr = await Shell.exec(commandStr, {shell: 'powershell'});
            } else {
                commandStr = `lsof -t -sTCP:LISTEN -i:${port}`;
                resStr = await Shell.exec(commandStr);
            }

            if (!resStr) {
                return null;
            }
            pid = resStr.trim().split("\n")[0];
            return parseInt(pid);
        } catch {
            return null;
        }
    }

    /**
     * @param port
     * @returns {Promise<null|string>}
     */
    static async getPathByPort(port) {
        try {
            let commandStr, resStr, path;

            if (isWindows) {
                commandStr = `(Get-Process -Id (Get-NetTCPConnection -LocalPort ${port} -State Listen).OwningProcess).Path"`;
                resStr = await Shell.exec(commandStr, {shell: 'powershell'});
            } else {
                commandStr = `lsof -t -sTCP:LISTEN -i:${port}|head -n 1|xargs lsof -a -w -d txt -Fn -p|awk 'NR==3{print}'|sed "s/n//"`;
                resStr = await Shell.exec(commandStr);
            }

            if (!resStr) {
                return null;
            }
            path = resStr.trim().split("\n")[0];
            return path.trim();
        } catch {
            return null;
        }
    }


    static async killByPort(port) {
        let pid = await TcpProcess.getPidByPort(port);
        if (pid) {
            await ProcessExtend.kill(pid);
        }
    }
}
