#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

db_user='cdeuser'
db_password='password'

target='{"count":0,"_shards":{"total":1,"successful":1,"failed":0}}'

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

# mongorestore, which is part of mongo database tool uses authenticationDatabase, https://www.mongodb.com/docs/database-tools/mongorestore/#std-option-mongorestore.--authenticationDatabase
mongorestore -u $db_user -p $db_password --authenticationDatabase test --drop --nsInclude 'test.*' test/data/
mongorestore -u $db_user -p $db_password --authenticationDatabase test --drop --nsInclude 'cde-logs-test.*' test/data/

echo "deleting es index."
npm run gulpJs es



