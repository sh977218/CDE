#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test
export MONGO_HOST=localhost
export MONGO_DB=test
export VSAC_HOST=localhost
export VSAC_PORT=4000
export ELASTIC_URI=http://localhost:9200/cdetest/

# Remove ElasticSearch Index
curl -XDELETE "localhost:9200/_river/cdetest"
curl -XDELETE 'http://localhost:9200/cdetest'

sleep 3;

mongo test test/dbInit.js
mongo test db/indexes.txt

groovy groovy/UploadCadsr test/cadsrTestSeed.xml --testMode

curl -XPOST "localhost:9200/cdetest" -d '
{
    "settings" : {
        "number_of_shards" : 1
    },
    "mappings" : {
        "dataelement" : {
            "properties" : {
                "stewardOrg.name" : { "type" : "string", "index" : "not_analyzed" }
                , "classification.conceptSystem": { "type" : "string", "index" : "not_analyzed" }
                , "classification.concept": { "type" : "string", "index" : "not_analyzed" }
                , "classification.stewardOrg.name": { "type" : "string", "index" : "not_analyzed" }
                , "origin" : { "type" : "string", "index" : "not_analyzed" }

            }
        }
    }
}'

sleep 3;

curl -XPUT "localhost:9200/_river/cdetest/_meta" -d'
{
  "type": "mongodb",
    "mongodb": {
      "db": "test", 
      "collection": "dataelements",
      "script": "if( ctx.document.archived) { ctx.deleted = true; }" 
    },
    "index": {
      "name": "cdetest", 
      "type": "dataelement"                  
    }        
}'

#
#
## Add ElasticSearch Index
#curl -XPUT "localhost:9200/_river/cdetest/_meta" -d'
#    {
#      "type": "mongodb",
#        "mongodb": {
#          "db": "test", 
#          "collection": "dataelements",
#          "script": "if( ctx.document.archived) { ctx.deleted = true; }" 
#        },
#        "index": {
#          "name": "cdetest", 
#          "type": "documents"
#        }           
#    }'

sleep 8;

export target='{"count":382,"_shards":{"total":1,"successful":1,"failed":0}}'
export curl_res=$(curl http://localhost:9200/cdetest/_count)
if [ "$curl_res" == "$target" ] 
then
    #groovy groovy/UploadCadsrForms.groovy --testMode &
    #
#    gradle -b test/selenium/build.gradle -Dtest.single=CompareTest test & 
    gradle -b test/selenium/build.gradle clean test & 
#    rm test-console.out
    node app > test-console.out
else
    echo "Not all documents indexed. Aborting"
    echo $curl_res
fi

