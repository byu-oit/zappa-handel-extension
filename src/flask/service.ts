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
    DeployOutputType,
    PreDeployContext,
    ServiceConfig,
    ServiceContext,
    ServiceDeployer,
    UnDeployContext,
    UnPreDeployContext
} from 'handel-extension-api';
import { awsCalls, checkPhase, deletePhases, deployPhase, preDeployPhase, tagging } from 'handel-extension-support';
import * as appResources from './app-resources';
import { ZappaConfig } from './datatypes';
import * as settings from './settings';
import * as zappa from './zappa';

const SERVICE_NAME = 'Flask';

export class FlaskService implements ServiceDeployer {

    // Set each array to have zero or more output types that this service consumes and produces
    public readonly consumedDeployOutputTypes = [
        DeployOutputType.EnvironmentVariables,
        DeployOutputType.Policies,
        DeployOutputType.SecurityGroups
    ];
    public readonly producedDeployOutputTypes = [];

    // Set this to an instance of ServiceEventType if your service provides any AWS event types (i.e. SNS, Lambda, etc.)
    public readonly providedEventType = null; // TODO - Add support for events later?

    // Set this to have zero or more services that this can produce events to
    public readonly producedEventsSupportedTypes = [];

    // Set this to false if the resources you're deploying don't support tagging
    public readonly supportsTagging = true;

    public check(serviceContext: ServiceContext<ZappaConfig>, dependenciesServiceContexts: Array<ServiceContext<ServiceConfig>>): string[] {
        console.log(__dirname);
        const errors: string[] = checkPhase.checkJsonSchema(`${__dirname}/params-schema.json`, serviceContext);
        return errors;
    }

    public async preDeploy(serviceContext: ServiceContext<ZappaConfig>): Promise<PreDeployContext> {
        if (serviceContext.params.vpc) {
            return preDeployPhase.preDeployCreateSecurityGroup(serviceContext, null, SERVICE_NAME);
        } else {
            return new PreDeployContext(serviceContext);
        }
    }

    public async getPreDeployContext(serviceContext: ServiceContext<ZappaConfig>): Promise<PreDeployContext> {
        if (serviceContext.params.vpc) {
            return preDeployPhase.getSecurityGroup(serviceContext);
        } else {
            return new PreDeployContext(serviceContext);
        }
    }

    public async deploy(ownServiceContext: ServiceContext<ZappaConfig>, ownPreDeployContext: PreDeployContext, dependenciesDeployContexts: DeployContext[]): Promise<DeployContext> {
        // TODO - DEPLOYMENT PROCESS:
        //   Copy code to staging directory
        //   Make sure they have a requirements.txt file
        //   Create virtual environment
        //   Install zappa and their requirements
        //   Do deploy
        //   Remove virtual environment
        //   Delete staging directory
        await this.ensureZappaExists();
        console.log('Deploying Zappa application');
        const uploadsBucketName = await this.createZappaBucket(ownServiceContext);
        const stack = await appResources.deployManagedTemplate(ownServiceContext, dependenciesDeployContexts);
        const roleArn = awsCalls.cloudFormation.getOutput('RoleArn', stack);
        if(!roleArn) {
            throw new Error('Expected to receive Bucket Name and Role Arn back from CloudFormation');
        }
        await settings.createSettingsFile(
            ownServiceContext,
            ownPreDeployContext,
            dependenciesDeployContexts,
            roleArn,
            uploadsBucketName
        );
        await zappa.deployEnv(ownServiceContext.environmentName);
        console.log('Finished deploying Zappa application');
        return new DeployContext(ownServiceContext);
    }

    public async unDeploy(ownServiceContext: ServiceContext<ZappaConfig>): Promise<UnDeployContext> {
        await this.ensureZappaExists();
        console.log('UnDeploying Zappa application');
        const environmentName = 'dev'; // TODO - FILL THIS IN
        await zappa.deleteEnv(environmentName);
        // TODO - MAKE THIS NEXT SECTION QUITE A BIT LONGER TIMEOUT
        return deletePhases.unDeployService(ownServiceContext, SERVICE_NAME);
    }

    public async unPreDeploy(ownServiceContext: ServiceContext<ZappaConfig>): Promise<UnPreDeployContext> {
        if (ownServiceContext.params.vpc) {
            return deletePhases.unPreDeploySecurityGroup(ownServiceContext, SERVICE_NAME);
        } else {
            return new UnPreDeployContext(ownServiceContext);
        }
    }

    private async createZappaBucket(ownServiceContext: ServiceContext<ZappaConfig>): Promise<string> {
        const accountConfig = ownServiceContext.accountConfig;
        const bucketName = `zappa-uploads-${accountConfig.region}-${accountConfig.account_id}`;
        await awsCalls.s3.createBucketIfNotExists(bucketName, accountConfig.region);
        return bucketName;
    }

    private async ensureZappaExists(): Promise<void> {
        const zappaExists = await zappa.zappaExists();
        if(!zappaExists) {
            throw new Error('Could not find Zappa. Are you running Handel inside a virtual environment where Zappa is installed?');
        }
    }
}
