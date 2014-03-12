#!/bin/sh

mongo nlmcde test/dbInit.js

find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec groovy groovy/UploadCadsr {} \;

find ../nlm-seed/ExternalCDEs/Vsac/*.xml -exec node ingester/uploadVsac {} \;

find ../nlm-seed/ExternalCDEs/Ahrq -name "de_*.json" -exec node ingester/uploadAhrq {} \;

groovy groovy/uploadNinds ../nlm-seed/ExternalCDEs/ninds/all/cdes.xml

node ingester/matchToVsac.js

# node ingester/uploader fitbir ../nlm-seed/ExternalCDEs/FITBIR-Full.xml

#node ingester/uploadUsers

