/*
 * Copyright 2018 Brigham Young University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import * as childProcess from 'child_process';
import * as fs from 'fs';

export function writeFile(path: string, fileContents: string) {
    fs.writeFileSync(path, fileContents);
}

export async function writeJsonFile(path: string, obj: any) {
    writeFile(path, JSON.stringify(obj, null, 2));
}

export async function runCommand(cmd: string, params: string[], printStdout: boolean = false, printStderr: boolean = false) {
    return new Promise((resolve, reject) => {
        const child = childProcess.spawn(cmd, params);
        child.stdout.on('data', (data) => {
            if(printStdout) {
                console.log(data.toString());
            }
        });
        child.stderr.on('data', (data) => {
            if(printStderr) {
                console.log(data.toString());
            }
        });
        child.on('close', (code) => {
            if(code !== 0) {
                reject(new Error(`Error when calling ${cmd}`));
            }
            else {
                resolve(true);
            }
        });
        child.on('error', (err) => {
            reject(err);
        });
    });
}
