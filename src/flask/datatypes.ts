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
    EnvironmentVariables,
    ServiceConfig,
    Tags
} from 'handel-extension-api';

export interface ZappaConfig extends ServiceConfig {
    path_to_code: string;
    handler: string;
    memory?: number;
    runtime?: string;
    timeout?: number;
    vpc?: boolean;
    environment_variables?: EnvironmentVariables;
    tags?: Tags;
}

// Note: this interface only includes the settings we use in Handel
export interface ZappaSettingsFile {
    apigateway_description: string;
    app_function: string;
    aws_environment_variables: EnvironmentVariables; // TODO - What is the diffference between environment_variables and aws_environment_variables?
    aws_region: string;
    // // TODO - Add custom domains via Route53
    cloud_watch_log_level: string; // Enum
    delete_local_zip: boolean;
    delete_s3_zip: boolean;
    keep_warm: boolean;
    lambda_description: string;
    log_level: string; // Enum
    manage_roles: boolean;
    memory_size: number;
    project_name: string;
    role_arn: string;
    runtime: string;
    s3_bucket: string;
    tags: Tags;
    timeout_seconds: number;
    use_precompiled_packages: boolean;
    vpc_config?: ZappaSettingsVpcConfig;
}

export interface ZappaSettingsVpcConfig {
    SubnetIds: string[];
    SecurityGroupIds: string[];
}
