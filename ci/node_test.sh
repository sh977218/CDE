echo "Running this from CDE repo!!!!"
export PATH=/usr/nlm/apps/node/current/bin:/usr/nlm/apps/git/bin:$PATH
export PATH=/usr/bin/node:$PATH
export SPAWN_WRAP_SHIM_ROOT=/usr/nlm/apps/bamboo-agent/home/tmp
export host_name=`hostname`
export NODE_ENV=dev-test
#clean up previous nodes and leftover files
pkill -u 7000 node
pkill -u 7000 gulp
pkill -u 7000 -f gradle
pkill -u 7000 npm
rm -rf /tmp/npm-*
find /tmp/*.png -user bambooadm  | xargs rm -f
find /tmp/*.jpg -user bambooadm  | xargs rm -f
find /tmp/*.bin -user bambooadm  | xargs rm -f

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
    npm run buildApp:ci1
    npm run buildNative:ci1
    cp config/ci1.json build/config/dev-test.json
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
    npm run buildApp:ci2
    npm run buildNative:ci2
    cp config/ci2.json build/config/dev-test.json
fi
if [ $? -ne 0 ]
then
    echo "Generating CI2 build. Failed!"
    exit 1
fi

# Start node
#echo `env`
### pipe process ID to testLogin.pid so later on teardown can kill this process
node ./test/testLoginServer.js > testLogin.log 2>&1 &
sleep 15
echo $! > testLogin.pid

### Create test.log so NodeJs server output can be piped to
cd build || exit 1
touch test.log;
chmod -R 755 $PWD

### Start node process with package nyc so coverage information can be outputed.
### Again pipe process ID to test.pid so later on teardown can kill this process too.
NODE_OPTIONS="--max-old-space-size=8192" npm i nyc
node --max-old-space-size=8192 node_modules/nyc/bin/nyc --reporter html npm start > test.log 2>&1 &
echo $! > test.pid
sleep 15

#Run Playwright
echo "+========Run Playwright test...========="
#source /usr/nlm/cde/node/node_env.sh
#export PATH=/usr/nlm/apps/node/current/bin:$PATH
echo "Install playwright dependencies"
cd ..
# npx playwright install-deps # requires sudo as root
npx playwright install
npm run playwright

if [ $? -ne 0 ]
then
    echo "Error: playwright test failed."
    exit 1
fi

#Run selenium test
set -x
if [[ "$AWS_SELENIUM_STACKS_ENABLED" == "true" ]]; then
    echo "============Run selenium test with Gradle on on-prem server...=============="

    export forkNb=6
    cd test/selenium || exit 1

    if [ "$host_name" == "dvlb7cde01" ]
    then
        if [ "$BROWSER" == 'oneTest' ]
        then
            /usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DtestUrl=http://local-cde-dev-1.nlm.nih.gov:3001 -DhubUrl=${GRID_URL} -Dtimeout=30 -Dbrowser=chrome -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test --tests *wrongLogin*
        else
            #../../node_modules/protractor/bin/protractor --baseUrl=http://local-cde-dev-1.nlm.nih.gov:3001 --seleniumAddress=http://130.14.175.7/wd/hub ../protractor-conf.js &
            /usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DtestUrl=http://local-cde-dev-1.nlm.nih.gov:3001 -DhubUrl=${GRID_URL} -Dtimeout=30 -Dbrowser=$BROWSER -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test
        fi
    else
        if [ "$BROWSER" == 'oneTest' ]
        then
            /usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DtestUrl=http://local-cde-dev-2.nlm.nih.gov:3001 -DhubUrl=${GRID_URL}  -Dtimeout=30 -Dbrowser=chrome -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test --tests *wrongLogin*
        else
            #../../node_modules/protractor/bin/protractor --baseUrl=http://local-cde-dev-2.nlm.nih.gov:3001 --seleniumAddress=http://130.14.175.7/wd/hub ../protractor-conf.js &
            /usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DtestUrl=http://local-cde-dev-2.nlm.nih.gov:3001 -DhubUrl=${GRID_URL} -Dtimeout=30 -Dbrowser=$BROWSER -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test
        fi
    fi
    if [ $? -ne 0 ]
    then
        echo "Error: selenium test failed."
        exit 1
    fi

    node ../verifyConsoleLogs.js
    if [ $? -ne 0 ]
    then
        echo "Error: verify console logs'"
        exit 1
    fi

    #Check selenium test coverage
    #mkdir -p build/npmlog
    #grep /usr/nlm/apps/bamboo-agent/home/temp/log_spool/$bamboo_plan_storageTag-$bamboo_shortJobKey-$bamboo_buildNumber.log -oe "/home/bambooadm/\.npm/_logs/.*\.log" | xargs cp -t build/npmlog

    cd build || exit 1

    echo "========Rune selenium coverage report=========="
    if [ "$BROWSER" == 'coverage' ]
    then
        mv ../test/selenium/build/.nyc_output/* .nyc_output/
        node ../../../node_modules/nyc/bin/nyc report
    fi

    node ../../../node_modules/nyc/bin/nyc check-coverage --lines 30 --functions 25 --branches 30
    if [ $? -ne 0 ]
    then
        echo "Error: Insufficient Coverage"
        exit 1
    fi

    cd ../../..
fi

pkill -TERM -P "$(cat build/test.pid)"
pkill -TERM -P "$(cat testLogin.pid)"
echo $?

if [ $PW_TEST -ne 0 ]
then
    echo "Error: Playwright test failed"
    exit 1
else
    #Upload playwright test reports to artifacts
    if [ "$COVERAGE_ENABLED" == "true" ]
    then
        if [[ ! -d "target/coverage" ]]
        then
            mkdir -p target/coverage
        else
            rm -fr target/coverage/*
        fi
        #cp -fr ${JUNIT_PATH}/* target/coverage
        #cp -fr ${COVERAGE_PATH}/* target/coverage
    fi
fi

echo "All tests completed successfully."
exit 0
