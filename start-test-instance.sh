#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

db_user='siteRootAdmin'
db_password='password'

target='{"count":0,"_shards":{"total":1,"successful":1,"failed":0}}'

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any clean compileTest &

mongo test deploy/dbInit.js -u $db_user -p $db_password -authenticationDatabase admin

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


mongo test test/data/testForms.js -u $db_user -p $db_password -authenticationDatabase admin
mongo cde-logs-test deploy/logInit.js -u $db_user -p $db_password -authenticationDatabase admin

mongorestore -d test -c dataelements test/data/cdedump/dataelements.bson -u $db_user -p $db_password -authenticationDatabase admin
mongorestore -d test -c forms test/data/nindsDump/test/forms.bson -u $db_user -p $db_password -authenticationDatabase admin
mongorestore -d test -c pinningBoards test/data/cdedump/pinningBoards.bson -u $db_user -p $db_password -authenticationDatabase admin
mongoimport --drop -d test -c orgs test/data/cdedump/orgs.json -u $db_user -p $db_password -authenticationDatabase admin

mongo test test/createLargeBoard.js -u $db_user -p $db_password -authenticationDatabase admin
mongo test test/createManyBoards.js -u $db_user -p $db_password -authenticationDatabase admin
mongo test test/initOrgs.js -u $db_user -p $db_password -authenticationDatabase admin

target='{"count":9575,"_shards":{"total":1,"successful":1,"failed":0}}'
#wait for full
COUNTER=0
while [ $COUNTER -lt 45 ]; do
    curl_res=$(curl http://localhost:9200/cdetest/_count)
    if [ "$curl_res" == "$target" ] 
    then
        COUNTER=45
    else
        sleep 1
        let COUNTER=COUNTER+1
    fi
done

if [ "$curl_res" == "$target" ] 
then
    #gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=$NB_OF_FORKS -Ptimeout=8 -Pbrowser=chrome test &
    gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 test --tests *Board* &
    export NODE_ENV=test
    node $NODE_LOC/app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
    exit
fi
