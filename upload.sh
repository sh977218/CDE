#!/bin/sh


find seed/ExternalCDEs/caDSR/*.xml -exec node uploadCadsr {} \;

node ingester/uploader fitbir ~/Documents/ExternalCDEs/FITBIR-Full.xml