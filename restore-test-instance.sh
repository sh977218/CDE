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

mongo cde-logs-test deploy/logInit.js -u $db_user -p $db_password

mongorestore -u $db_user -p $db_password --drop -d test test/data/test/

echo "deleting es index."
gulp es



