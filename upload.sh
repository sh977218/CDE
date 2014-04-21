#!/bin/sh

mongo nlmcde test/dbInit.js

find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec groovy -cp ./groovy/ groovy/UploadCadsr {} \;

find ../nlm-seed/ExternalCDEs/Vsac/*.xml -exec node ingester/uploadVsac {} \;

find ../nlm-seed/ExternalCDEs/Ahrq -name "de_*.json" -exec node ingester/uploadAhrq {} \;

groovy -cp ./groovy/ groovy/uploadNinds ../nlm-seed/ExternalCDEs/ninds/all/cdes.xml

node ingester/matchToVsac.js

groovy -cp ./groovy/ groovy/PhenXLoad --merge

groovy -cp ./groovy/ groovy/UploadPhri.groovy

# node ingester/uploader fitbir ../nlm-seed/ExternalCDEs/FITBIR-Full.xml

#node ingester/uploadUsers

