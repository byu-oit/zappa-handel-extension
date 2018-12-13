# zappa-handel-extension
This repository contains a Handel extension for deploying Zappa apps. You can use Zappa to create your serverless WSGI application (Flask, Django) and use Handel to create your other service dependencies that your application uses (DynamoDB, RDS, etc.).

# Flask Service
This service provisions a Flask app using Zappa.

## Usage
To use this extension, add it to the `extensions` section of your Handel file. Then add the `flask` service to your environment:

```
version: 1

name: zappa-flask

extensions:
  zappa: zappa-handel-extension

environments:
  dev:
    webapp:
      type: zappa::flask
      path_to_code: . # Required. The directory you want Zappa to use when uploading/deploying to Lambda
      handler: index.app # Required. The module and Flask instance that Zappa should use (see example code in the 'examples/` directory)
      memory: 128 # Optional. Default: 128. The amount of memory the Lambda should allocate for your program
      runtime: python3.6 # Optional. Default: python3.6. Allowed values: python2.7, python3.6
      timeout: 60 # Optional. Default: 30. The amount of time in seconds your Lambda can run before timing out
      vpc: true # Optional. Default: false Whether or not to deploy your Lambda inside the VPC. Specify 'true' if you are deploying things like RDS databases that this application will need to talk to.
      environment_variables: # Optional. A list of key/value pairs to set as environment variables in your application
        TEST_ENV_VAR: helloworld

```
