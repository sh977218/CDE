#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test
export MONGO_HOST=localhost
export MONGO_DB=test
export VSAC_HOST=localhost
export VSAC_PORT=4000
export ELASTIC_URI=http://localhost:9200/cdetest/

mongo test test/dbInit.js

groovy -cp ./groovy/ groovy/UploadCadsr test/cadsrTestSeed.xml --testMode

sleep 3;

export target='{"count":382,"_shards":{"total":1,"successful":1,"failed":0}}'
export curl_res=$(curl http://localhost:9200/cdetest/_count)

if [ "$curl_res" == "$target" ] 
then
    #gradle -b test/selenium/build.gradle clean test & 
    gradle -b test/selenium/build.gradle -Dtest.single=ClassificationTest test & 
    node app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
    sleep 900;
    echo $curl_res
fi
