#!/bin/sh


find seed/ExternalCDEs/caDSR/*.xml -exec node uploadCadsr {} \;

node ingester/uploader fitbir seed/ExternalCDEs/FITBIR-Full.xml