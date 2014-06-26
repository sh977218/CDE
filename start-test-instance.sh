#!/bin/sh

mongo test deploy/dbInit.js
mongo cde-logs-test deploy/logInit.js

groovy -cp ./groovy/ groovy/UploadCadsr test/data/cadsrTestSeed.xml localhost test --testMode
groovy -cp ./groovy/ groovy/uploadNindsXls test/data/ninds-test.xlsx localhost test --testMode
groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx localhost test 

sleep 3;

export target='{"count":592,"_shards":{"total":1,"successful":1,"failed":0}}'
export curl_res=$(curl http://localhost:9200/cdetest/_count)

if [ "$curl_res" == "$target" ] 
then
    gradle -b test/selenium/build.gradle clean test & 
    #gradle -b test/selenium/build.gradle -Dtest.single=ClassificationTest test & 
    node node-js/app config.test.js > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
fi
