#!/bin/bash
rm -rf buildNode/*
npx tsc -p tsconfigNodeIngester.json

# TODO: eliminated all replacement by moving server code to src/
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/app.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/gulpfile.js
sed -i -e "s/ run('npm run buildNode')//g" buildNode/gulpfile.js

# must use " because of $(
sed -i "s/version = 'x'/version='$(git rev-parse --short HEAD)'/" buildNode/server/version.js

cp -R config buildNode
#sed -i -e 's/"buildDir": "\.\.\/build"/"buildDir": "\.\.\/\.\.\/build"/g' buildNode/config/default.json
cp ingester/package.json buildNode/ingester
cp server/package.json buildNode/server
cp shared/package.json buildNode/shared
cp -R shared/de/assets buildNode/shared/de
cp -R shared/form/assets buildNode/shared/form
cp -R shared/mapping/fhir/assets buildNode/shared/mapping/fhir

cat <<EOT >>buildNode/package.json
{
  "name": "ludetc-cdes-built",
  "version": "0.0.1",
  "dependencies": {
    "ingester": "file:./ingester",
    "server": "file:./server",
    "shared": "file:./shared"
  }
}
EOT
cd buildNode && npm i && cd ..
