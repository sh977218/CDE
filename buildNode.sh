#!/bin/bash
rm -rf buildNode/*
npx tsc -p tsconfigNode.json

# TODO: eliminate all replacement by moving server code to src/
sed -i -e "s/APP_DIR = __dirname + '\/..';/APP_DIR = __dirname + '\/..\/..';/g" buildNode/server/globals.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/gulpfile.js
sed -i -e "s/ run('npm run buildNode')//g" buildNode/gulpfile.js
sed -i "s/version = 'x'/version='$(git rev-parse --short HEAD)'/" buildNode/server/version.js # must use " because of $(

cp -R config buildNode
sed -i -e 's/"buildDir": "\.\.\/build"/"buildDir": "\.\.\/\.\.\/build"/g' buildNode/config/default.json

cp server/package.json buildNode/server
cp shared/package.json buildNode/shared

cat <<EOT >>buildNode/package.json
{
  "name": "ludetc-cdes-built",
  "version": "0.0.1",
  "dependencies": {
    "server": "file:./server",
    "shared": "file:./shared"
  }
}
EOT
cd buildNode && npm i && cd ..
