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
/**
 * This function deploys the IAM role and S3
 * bucket required for the application.
 */
import * as AWS from 'aws-sdk';
import {
    AccountConfig,
    DeployContext,
    ServiceContext
} from 'handel-extension-api';
import {
    deployPhase,
    handlebars,
    tagging
} from 'handel-extension-support';
import { ZappaConfig } from './datatypes';

function getLambdaArn(accountConfig: AccountConfig, resourceName: string) {
    return `arn:aws:lambda:${accountConfig.region}:${accountConfig.account_id}:function:${resourceName}`;
}

async function getPolicyStatementsForRole(
    serviceContext: ServiceContext<ZappaConfig>,
    dependenciesDeployContexts: DeployContext[],
    resourceName: string
): Promise<any[]> {
    const handlebarsParams = {
        ownLambdaArn: getLambdaArn(serviceContext.accountConfig, resourceName)
    };
    let compiledTemplate;
    if (serviceContext.params.vpc) {
        compiledTemplate = await handlebars.compileTemplate(`${__dirname}/lambda-role-statements-vpc.json`, handlebarsParams);
    } else {
        compiledTemplate = await handlebars.compileTemplate(`${__dirname}/lambda-role-statements.json`, handlebarsParams);
    }
    const ownPolicyStatements = JSON.parse(compiledTemplate);
    return deployPhase.getAllPolicyStatementsForServiceRole(serviceContext, ownPolicyStatements, dependenciesDeployContexts, true);
}

export async function deployManagedTemplate(
    ownServiceContext: ServiceContext<ZappaConfig>,
    dependenciesDeployContexts: DeployContext[]
): Promise<AWS.CloudFormation.Stack> {
    const serviceName = ownServiceContext.resourceName();
    const handlebarsParams = {
        serviceName: serviceName,
        policyStatements: await getPolicyStatementsForRole(ownServiceContext, dependenciesDeployContexts, serviceName)
    };
    const stackName = ownServiceContext.stackName();
    const compiledTemplate = await handlebars.compileTemplate(`${__dirname}/app-resources.yml`, handlebarsParams);
    const stackTags = tagging.getTags(ownServiceContext);
    return deployPhase.deployCloudFormationStack(ownServiceContext, stackName, compiledTemplate, [], true, 30, stackTags);
}
