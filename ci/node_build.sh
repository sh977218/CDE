echo "Running this from CDE repo!!!!"
export PATH=/usr/nlm/apps/node/current/bin:/usr/nlm/apps/git/bin:$PATH
export SPAWN_WRAP_SHIM_ROOT=/usr/nlm/apps/bamboo-agent/home/tmp
export host_name=`hostname`
chmod -R 755 $PWD

if [ "$host_name" == "dvlb7cde02" ]
then
  export PATH=/usr/nlm/apps/node/node-16.19.0/bin:$PATH
fi

npm install
npm cache clean -f
npm cache verify -f

echo "node version $(node --version)"
echo "npm version $(npm --version)"

npm run gulp

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

cd build
mv ../*.tar ./
