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

curl -XPOST "localhost:9200/cdetest" -d '
{
    "settings" : {
        "number_of_shards" : 1
    },
    "mappings" : {
        "dataelement" : {
            "properties" : {
                "stewardOrg.name" : { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.elements.name": { "type" : "string", "index" : "not_analyzed" }
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