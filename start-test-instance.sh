#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

db_user='cdeuser'
db_password='password'

target='{"count":0,"_shards":{"total":1,"successful":1,"failed":0}}'

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any -PdownloadFolder=/usr/nlm/selenium/cde/downloads/ clean compileTest &

mongo test deploy/dbInit.js -u $db_user -p $db_password

#wait for empty

COUNTER=0
while [ $COUNTER -lt 2 ]; do
    curl_res=$(curl http://localhost:9200/cdetest/_count)
    if [ "$curl_res" == "$target" ]
    then
        COUNTER=60
    else
        sleep 1
        let COUNTER=COUNTER+1
    fi
done

mongo cde-logs-test deploy/logInit.js -u $db_user -p $db_password 

mongorestore -d test -c dataelements test/data/cdedump/dataelements.bson -u $db_user -p $db_password
mongorestore -d test -c forms test/data/nindsDump/test/forms.bson -u $db_user -p $db_password
mongorestore -d test -c pinningBoards test/data/cdedump/pinningBoards.bson -u $db_user -p $db_password
mongoimport --drop -d test -c orgs test/data/cdedump/orgs.json -u $db_user -p $db_password
mongoimport --drop -d test -c validationrules test/data/validationRules.json -u $db_user -p $db_password

mongo test test/createLargeBoard.js -u $db_user -p $db_password 
mongo test test/createManyBoards.js -u $db_user -p $db_password

gulp es

#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=$NB_OF_FORKS -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=./ test &
#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=6 -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=S://data test &
gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 test --tests *CopyCdeTest* &
export NODE_ENV=test
node app