#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test

/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test test/dbInit.js
/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test db/indexes.txt

node ingester/uploadCadsr test/cadsrTestSeed.xml & 

gradle -b test/selenium/build.gradle cleanTest test & 

node app 


