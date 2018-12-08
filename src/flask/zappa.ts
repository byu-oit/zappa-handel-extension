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
import * as util from './util';

export async function zappaExists(): Promise<boolean> {
    try {
        await util.runCommand('zappa', []);
        return true;
    }
    catch(err) {
        return false;
    }
}

export async function zappaDeploymentExists(environmentName: string): Promise<boolean> {
    try {
        await util.runCommand('zappa', ['status', environmentName]);
        return true;
    }
    catch(err) {
        return false;
    }
}

export async function deployEnv(environmentName: string): Promise<void> {
    const update = await zappaDeploymentExists(environmentName);
    if(update) { // Update
        await util.runCommand('zappa', ['update', environmentName], true, true);
    }
    else { // Create
        await util.runCommand('zappa', ['deploy', environmentName], true, true);
    }
}

export async function deleteEnv(environmentName: string): Promise<void> {
    const shouldDelete = await zappaDeploymentExists(environmentName);
    if(shouldDelete) {
        await util.runCommand('zappa', ['undeploy', environmentName, '--yes'], true, true);
    }
}
