npm run gulp
npx ng b cde-cli --configuration ci1 --output-path build/dist/cde-cli
npx ng b nativeRender --configuration ci1 --output-path build/dist/nativeRender

npm run buildApp:ci2
npm run buildNative:ci2
cp config/ci2.json build/config/dev-test.json
