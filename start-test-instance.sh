#!/bin/sh

export PORT=3001
export MONGO_URI=mongodb://localhost/test

#/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test --eval "db.users.drop()"
#/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test --eval "db.dataelements.drop()"
#/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test --eval "db.regAuths.drop()"
#/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test --eval "db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true})"

/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo test test/dbInit.js

node ingester/uploadCadsr test/cadsrTestSeed.xml & 

node app

