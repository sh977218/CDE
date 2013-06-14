#!/bin/sh

find ../nlm-seed/ExternalCDEs/caDSR/*.xml -exec node ingester/uploadCadsr {} \;

# node ingester/uploader fitbir ../nlm-seed/ExternalCDEs/FITBIR-Full.xml

node ingester/uploadUsers

