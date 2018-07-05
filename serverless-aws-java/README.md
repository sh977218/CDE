# NLM CDE Functions For AWS Java
Uses the Serverless Framework to create and deploy Functions. Currently used for one Function but it may be possible to
build multiple function zips from this one project.

## Build
1. Run `npm run buildFnAwsJava` from project base dir. (On windows, command needs the `./` removed.)

## Deploy
* Deploy by command:
   * Run
     * ```cd serverless-aws-lambda/ && ../node_modules/.bin/serverless deploy --stage qa-green && cd ..```
   * NOTE: Deployment is auto-versioned and old versions will persist. Need a cleanup policy.
   * NOTE: Application code needs to be updated when deploying to call new version.
   * NOTE: This script is embedded into the Atlassian Bamboo Environments:
     * NLM-AWS-LAMBDA-QA
* Deploy manually using website:
   * Upload zips from `serverless-aws-java/build/distributions/`

## Test Local
1. BUG WORKAROUND
   1. `cd node_modules/serverless/lib/plugins/aws/invokeLocal/java`
   1. `mvn package`
   1. `cd <CDE Base Directory>`
1. `cd serverless-aws-java`
1. Ends with "result=OK":
   * `../node_modules/.bin/serverless invoke local -f cde-fn-sdcValidate -p test/sdcdata.json`
1. Ends with "result=WITH_ERRORS":
   * `../node_modules/.bin/serverless invoke local -f cde-fn-sdcValidate -p test/sdcdata-bad.json`

## Test Local Callthough (Node Runtime Only)
1. Run `cd serverless-aws-java`
1. Run `???? start` to create node_modules\serverless-offline-localstack\serverlessOfflineLocalstack.json
1. Run `../node_modules/.bin/serverless offline start --stage local`
1. Test application as usual.
