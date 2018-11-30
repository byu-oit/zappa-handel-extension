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
import {
    DeployContext,
    PreDeployContext,
    ServiceConfig,
    ServiceContext,
    ServiceDeployer,
    UnDeployContext
} from 'handel-extension-api';
import * as zappa from './zappa';

const SERVICE_NAME = 'FLASK';

export class FlaskService implements ServiceDeployer {

    // Set each array to have zero or more output types that this service consumes and produces
    public readonly consumedDeployOutputTypes = [];
    public readonly producedDeployOutputTypes = [];

    // Set this to an instance of ServiceEventType if your service provides any AWS event types (i.e. SNS, Lambda, etc.)
    public readonly providedEventType = null;

    // Set this to have zero or more services that this can produce events to
    public readonly producedEventsSupportedTypes = [];

    // Set this to false if the resources you're deploying don't support tagging
    public readonly supportsTagging = true;

    public check(serviceContext: ServiceContext<ServiceConfig>, dependenciesServiceContexts: Array<ServiceContext<ServiceConfig>>): string[] {
        const errors: string[] = [];
        return errors;
    }

    // Implement the preDeploy and getPreDeployContext phases if your service uses security groups

    // Implement the bind phase if your service will add ingress rules to its security group from other services

    public async deploy(ownServiceContext: ServiceContext<ServiceConfig>, ownPreDeployContext: PreDeployContext, dependenciesDeployContexts: DeployContext[]): Promise<DeployContext> {
        await this.ensureZappaExists();
        console.log('Deploying Zappa application');
        const environmentName = 'dev'; // TODO - FILL THIS IN
        await zappa.deployEnv(environmentName);
        console.log('Finished deploying Zappa application');
        return new DeployContext(ownServiceContext);
    }

    public async unDeploy(ownServiceContext: ServiceContext<ServiceConfig>): Promise<UnDeployContext> {
        // TODO - DEPLOYMENT PROCESS:
        //   Copy code to staging directory
        //   Make sure they have a requirements.txt file
        //   Create virtual environment
        //   Install zappa and their requirements
        //   Do deploy
        //   Remove virtual environment
        //   Delete staging directory
        await this.ensureZappaExists();
        console.log('UnDeploying Zappa application');
        const environmentName = 'dev'; // TODO - FILL THIS IN
        const shouldDelete = await zappa.zappaDeploymentExists(environmentName);
        if(shouldDelete) {
            await zappa.deleteEnv(environmentName);
        }
        console.log('Finished undeploying Zappa application');
        return new UnDeployContext(ownServiceContext);
    }

    private async ensureZappaExists() {
        const zappaExists = await zappa.zappaExists();
        if(!zappaExists) {
            throw new Error('Could not find Zappa. Are you running Handel inside a virtual environment where Zappa is installed?');
        }
    }

    // Implement unPreDeploy if you created security groups in the preDeploy phase
}
