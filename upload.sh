#!/bin/sh


find seed/ExternalCDEs/caDSR/*.xml -exec node ingester/uploadCadsr {} \;

node ingester/uploader fitbir seed/ExternalCDEs/FITBIR-Full.xml