#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

mongo test deploy/dbInit.js
sleep 5;
mongo test test/data/testForms.js
mongo cde-logs-test deploy/logInit.js

mongorestore -d test -c dataelements test/data/nindsDump/test/dataelements.bson
mongorestore -d test -c forms test/data/nindsDump/test/forms.bson

groovy -cp ./groovy/ groovy/UploadCadsr test/data/cadsrTestSeed.xml localhost test test 
groovy -cp ./groovy/ groovy/Grdr test/data/grdr.xlsx localhost test 


sleep 10;

mongo test test/createLargeBoard.js

export target='{"count":9575,"_shards":{"total":1,"successful":1,"failed":0}}'
export curl_res=$(curl http://localhost:9200/cdetest/_count)

if [ "$curl_res" == "$target" ] 
then
    gradle -b test/selenium/build.gradle -PtestUrl=http://localhost:3001 -PforkNb=12 -Ptimeout=8 -Pbrowser=chrome clean test & 
    #gradle -b test/selenium/build.gradle -PtestUrl=http://localhost:3001  -Pbrowser=chrome -PforkNb=12 -Ptimeout=8 clean test --tests gov.nih.nlm.cde.test.MergeTest* &
    export NODE_ENV=test
    node $NODE_LOC/app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
fi
