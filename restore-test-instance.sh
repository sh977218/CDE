#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

db_user='cdeuser'
db_password='password'

target='{"count":0,"_shards":{"total":1,"successful":1,"failed":0}}'



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

mongorestore --drop -d test -c dataelements test/data/cdedump/dataelements.bson -u $db_user -p $db_password
mongorestore --drop -d test -c dataelementdrafts test/data/cdedump/dataelementdrafts.bson -u $db_user -p $db_password
mongorestore --drop -d test -c forms test/data/formDump/forms.bson -u $db_user -p $db_password
mongorestore --drop -d test -c formdrafts test/data/formDump/formdrafts.bson -u $db_user -p $db_password
mongorestore --drop -d test -c pinningBoards test/data/cdedump/pinningBoards.bson -u $db_user -p $db_password
mongorestore --drop -d test -c orgs test/data/cdedump/orgs.bson -u $db_user -p $db_password
mongorestore --drop -d test -c meshclassifications test/data/meshclassifications.bson -u $db_user -p $db_password
mongorestore --drop -d test -c comments test/data/comments.bson -u $db_user -p $db_password

mongo test test/createLargeBoard.js -u $db_user -p $db_password
mongo test test/createManyBoards.js -u $db_user -p $db_password

echo "deleting es index."
gulp es



