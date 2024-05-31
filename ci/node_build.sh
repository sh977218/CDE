echo "Running this from CDE repo!!!!"
export PATH=/usr/nlm/apps/node/current/bin:/usr/nlm/apps/git/bin:$PATH
export PATH=/usr/bin/node:$PATH
export SPAWN_WRAP_SHIM_ROOT=/usr/nlm/apps/bamboo-agent/home/tmp
export host_name=`hostname`
export NODE_ENV=dev-test
chmod -R 755 $PWD

echo "node version $(node --version)"
echo "npm version $(npm --version)"

npm cache clean -f
npm i

## CI build
echo "======CI build============="
if [ ! -d "build/config" ]
then
    mkdir -p build/config
fi

### copy ci1.json first, because CI1 gulp needs dev-test to connnect to MongoDB
if [ "$host_name" == "dvlb7cde01" ]
then
    #source ${CI_PROJECT_DIR}/deploy/gulpAndTarCI1.sh
    cp config/ci1.json config/dev-test.json
    npm run gulp
fi
if [ $? -ne 0 ]
then
    echo "Generating CI1 build. Failed!"
    exit 1
fi

### copy ci2.json first, because CI2 gulp needs dev-test to connnect to MongoDB
if [ "$host_name" == "dvlb7cde02" ]
then
    #source ${CI_PROJECT_DIR}/deploy/gulpAndTarCI2.sh
    cp config/ci2.json config/dev-test.json
    npm run gulp
fi
if [ $? -ne 0 ]
then
    echo "Generating CI2 build. Failed!"
    exit 1
fi

echo "=======Generating QA build========"; pwd
npx ng b cde-cli --configuration qa --output-path build/dist/cde-cli
if [ $? -ne 0 ]
then
  echo "Generating QA build cde-cli. Failed!"
  exit 1
fi
npx ng b nativeRender --configuration qa --output-path build/dist/nativeRender
if [ $? -ne 0 ]
then
  echo "Generating QA build nativeRender. Failed!"
  exit 1
fi
tar -cf cde-master-qa.tar build

## Prod build
echo "=========Generating Prod build========"
npx ng b cde-cli --configuration prod --output-path build/dist/cde-cli
if [ $? -ne 0 ]
then
  echo "Generating Prod build cde-cli. Failed!"
  exit 1
fi
npx ng b nativeRender --configuration prod --output-path build/dist/nativeRender
if [ $? -ne 0 ]
then
  echo "Generating Prod build nativeRender. Failed!"
  exit 1
fi
tar -cf cde-master.tar build

cd build || exit 1
mv ../*.tar ./
