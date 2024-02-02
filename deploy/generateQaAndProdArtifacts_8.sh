# Prepare Deployment Package
## QA build
echo "Generating QA build."
npm run buildApp:qa
npm run buildNative:qa
cp cde-ci-config/qa.json build/config/qa.json
tar -cf cde-master-qa.tar build

## Prod build
echo "Generating Prod build."
npm run buildApp:prod
npm run buildNative:prod
cp cde-ci-config/prod.json build/config/prod.json
tar -cf cde-master.tar build
