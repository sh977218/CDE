#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test
export VSAC_HOST=localhost
export VSAC_PORT=4000
export ELASTIC_URI=http://localhost:9200/cdetest/

# Remove ElasticSearch Index
curl -XDELETE 'http://localhost:9200/cdetest'

# Add ElasticSearch Index
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
          "type": "documents"
        }           
    }'

mongo test test/dbInit.js
mongo test db/indexes.txt

node ingester/uploadCadsr test/cadsrTestSeed.xml

#groovy groovy/UploadCadsrForms.groovy --testMode &
#
gradle -b test/selenium/build.gradle -Dtest.single=UserTest cleanTest test & 

node app 


