
npm run gulp
npx ng b cde-cli --configuration ci1 --output-path build/dist/cde-cli
npx ng b nativeRender --configuration ci1 --output-path build/dist/nativeRender

npm run buildApp:ci1
npm run buildNative:ci1
cp config/ci1.json build/config/dev-test.json
