#!/bin/sh

gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 -Dorg.gradle.project.downloadFolder=homeDir\Downloads\ -Dorg.gradle.project.chromeDownloadFolder=homeDir\Downloads\ test -X *checkRedCapExportZipFileSize* &
export NODE_ENV=test
node app