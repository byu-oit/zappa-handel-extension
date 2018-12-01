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
import { DeployContext, PreDeployContext, ServiceContext } from 'handel-extension-api';
import { deployPhase, tagging } from 'handel-extension-support';
import { ZappaConfig, ZappaSettingsFile } from './datatypes';
import * as util from './util';

export async function createSettingsFile(
    serviceContext: ServiceContext<ZappaConfig>,
    preDeployContext: PreDeployContext,
    dependenciesDeployContexts: DeployContext[],
    roleArn: string,
    s3BucketName: string
) {
    const accountConfig = serviceContext.accountConfig;
    const serviceConfig = serviceContext.params;
    const projectName = serviceContext.appName;
    const description = `Handel-created Zappa app for ${projectName}`;
    const environmentSettings: ZappaSettingsFile = {
        apigateway_description: description,
        aws_environment_variables: deployPhase.getEnvVarsForDeployedService(serviceContext, dependenciesDeployContexts, serviceConfig.environment_variables),
        aws_region: accountConfig.region,
        cloud_watch_log_level: 'OFF', // TODO - Fill this in
        delete_local_zip: true,
        delete_s3_zip: false,
        keep_warm: true,
        lambda_description: description,
        lambda_handler: serviceConfig.handler,
        log_level: 'DEBUG',
        manage_roles: false,
        memory_size: serviceConfig.memory || 256,
        project_name: projectName,
        role_arn: roleArn,
        runtime: serviceConfig.runtime || 'python3.6',
        s3_bucket: s3BucketName,
        tags: tagging.getTags(serviceContext),
        timeout_seconds: serviceConfig.timeout || 30,
        use_precompiled_packages: true
    };
    if(serviceConfig.vpc) {
        environmentSettings.vpc_config = {
            SubnetIds: accountConfig.private_subnets,
            SecurityGroupIds: [preDeployContext.securityGroups[0].GroupId!]
        };
    }

    // Settings files have one or more environments with settings for each environment
    const settingsFile =  {
        [serviceContext.environmentName]: environmentSettings
    };
    util.writeJsonFile(`./zappa_settings.json`, settingsFile);
}
