#!/bin/sh

mongo test modules/cde/deploy/dbInit.js
mongo cde-logs-test modules/cde/deploy/logInit.js

groovy -cp ./groovy/ groovy/UploadCadsr test/data/cadsrTestSeed.xml localhost test test 
groovy -cp ./groovy/ groovy/uploadNindsXls test/data/ninds-test.xlsx localhost test 
groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx localhost test 

sleep 10;

mongo test test/createLargeBoard.js

export target='{"count":592,"_shards":{"total":1,"successful":1,"failed":0}}'
export curl_res=$(curl http://localhost:9200/cdetest/_count)

if [ "$curl_res" == "$target" ] 
then
    gradle -b test/selenium/build.gradle -PtestUrl=localhost:3001 clean test & 
    #gradle -b test/selenium/build.gradle -Dtest.single=ClassificationTest -PtestUrl=localhost:3001 test & 
    export NODE_ENV=test
    node app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
fi
