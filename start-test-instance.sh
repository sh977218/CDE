#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test
export VSAC_HOST=localhost
export VSAC_PORT=4000

mongo test test/dbInit.js
mongo test db/indexes.txt

node ingester/uploadCadsr test/cadsrTestSeed.xml & 

#groovy groovy/UploadCadsrForms.groovy --testMode &

gradle -b test/selenium/build.gradle cleanTest test & 

node app 


