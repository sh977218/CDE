#!/bin/sh

mongo nlmcde test/dbInit.js

find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec node ingester/uploadCadsr {} \;

find ../nlm-seed/ExternalCDEs/Vsac/*.xml -exec node ingester/uploadVsac {} \;


# node ingester/uploader fitbir ../nlm-seed/ExternalCDEs/FITBIR-Full.xml

#node ingester/uploadUsers

