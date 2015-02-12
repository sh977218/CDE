#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any clean compileTest &

mongo test deploy/dbInit.js

target='{"count":0,"_shards":{"total":5,"successful":5,"failed":0}}'
#wait for empty
COUNTER=0
while [ $COUNTER -lt 60 ]; do
    curl_res=$(curl http://localhost:9200/cdetest/_count)
    if [ "$curl_res" == "$target" ] 
    then
        COUNTER=60
    else 
        sleep 1
        let COUNTER=COUNTER+1
    fi
done

if [ "$curl_res" == "$target" ] 
then
    echo "All documents Removed"
else
    echo "Not all documents removed. Aborting"
    echo $curl_res
    exit
fi


mongo test test/data/testForms.js
mongo cde-logs-test deploy/logInit.js

mongorestore -d test -c dataelements test/data/cdedump/dataelements.bson
mongorestore -d test -c forms test/data/nindsDump/test/forms.bson
mongoimport --drop -d test -c orgs test/data/cdedump/orgs.bson

mongo test test/createLargeBoard.js
mongo test test/createManyBoards.js

target='{"count":9575,"_shards":{"total":5,"successful":5,"failed":0}}'
#wait for full
COUNTER=0
while [ $COUNTER -lt 60 ]; do
    curl_res=$(curl http://localhost:9200/cdetest/_count)
    if [ "$curl_res" == "$target" ] 
    then
        COUNTER=60
    else 
        sleep 1
        let COUNTER=COUNTER+1
    fi
done

if [ "$curl_res" == "$target" ] 
then
    gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=$NB_OF_FORKS -Ptimeout=8 -Pbrowser=chrome test & 
    #gradle -b test/selenium/build.gradle -PtestUrl=http://localhost:3001  -Pbrowser=chrome -PforkNb=12 -Ptimeout=8 test --tests gov.nih.nlm.cde.test.MergeTest* &
    export NODE_ENV=test
    node $NODE_LOC/app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
    exit
fi
