#!/bin/bash
rm -rf buildNode/*
npx tsc -p tsconfigNode.json
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/app.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/gulpfile.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/webpack.config.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/webpackApp.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/webpackEmbed.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/webpackFhir.js
sed -i -e 's/APP_DIR = __dirname;/APP_DIR = __dirname + "\/..";/g' buildNode/webpackNative.js
sed -i -e "s/__dirname, 'dist\/app'/__dirname, '\.\.\/dist\/app'/g" buildNode/webpackApp.js
sed -i -e "s/__dirname, 'dist\/embed'/__dirname, '\.\.\/dist\/embed'/g" buildNode/webpackEmbed.js
sed -i -e "s/__dirname, 'dist\/fhir'/__dirname, '\.\.\/dist\/fhir'/g" buildNode/webpackFhir.js
sed -i -e "s/__dirname, 'dist\/native'/__dirname, '\.\.\/dist\/native'/g" buildNode/webpackNative.js
sed -i -e "s/'\.\/tsconfigApp\.json'/'\.\.\/tsconfigApp\.json'/g" buildNode/webpackApp.prod.js
sed -i -e "s/'\.\/tsconfigEmbed\.json'/'\.\.\/tsconfigEmbed\.json'/g" buildNode/webpackEmbed.prod.js
sed -i -e "s/'\.\/tsconfigFhir\.json'/'\.\.\/tsconfigFhir\.json'/g" buildNode/webpackFhir.prod.js
sed -i -e "s/'\.\/tsconfigNative\.json'/'\.\.\/tsconfigNative\.json'/g" buildNode/webpackNative.prod.js
sed -i -e "s/'\.\/modules\/_app\/app\.module'/'\.\.\/modules\/_app\/app\.module'/g" buildNode/webpackApp.prod.js
sed -i -e "s/'\.\/modules\/_embedApp\/embedApp\.module'/'\.\.\/modules\/_embedApp\/embedApp\.module'/g" buildNode/webpackEmbed.prod.js
sed -i -e "s/'\.\/modules\/_fhirApp\/fhirApp\.module'/'\.\.\/modules\/_fhirApp\/fhirApp\.module'/g" buildNode/webpackFhir.prod.js
sed -i -e "s/'\.\/modules\/_nativeRenderApp\/nativeRenderApp\.module'/'\.\.\/modules\/_nativeRenderApp\/nativeRenderApp\.module'/g" buildNode/webpackNative.prod.js
cp -R config buildNode
sed -i -e 's/"buildDir": "\.\.\/build"/"buildDir": "\.\.\/\.\.\/build"/g' buildNode/config/default.json
cp shared/package.json buildNode/shared
cp -R shared/de/assets buildNode/shared/de
cp -R shared/form/assets buildNode/shared/form
cp -R shared/mapping/fhir/assets buildNode/shared/mapping/fhir