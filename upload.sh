#!/bin/sh

/Users/ludetc/dev/mongodb-osx-x86_64-2.4.3/bin/mongo nlmcde test/dbInit.js

find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec node ingester/uploadCadsr {} \;

# node ingester/uploader fitbir ../nlm-seed/ExternalCDEs/FITBIR-Full.xml

node ingester/uploadUsers

