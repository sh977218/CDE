#!/bin/sh

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any -PdownloadFolder=c:\temp\downloads -PchromeDownloadFolder=c:\temp\downloads -Dorg.gradle.project.downloadFolder=c:\temp\downloads -Dorg.gradle.project.chromeDownloadFolder=c:\temp\downloads clean compileTest

#sh restore-test-instance.sh

#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=$NB_OF_FORKS -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=./ test &
#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=6 -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=S://data test &

gradle -b test/selenium/build.gradle -DhubUrl=$HUB_URL -DtestUrl=$TEST_URL -Dbrowser=chrome -PforkNb=2 -Dtimeout=8 -DdownloadFolder=$SEL_DOWNLOAD_FOLDER -DchromeDownloadFolder=$SEL_DOWNLOAD_FOLDER -Dorg.gradle.project.downloadFolder=$SEL_DOWNLOAD_FOLDER -Dorg.gradle.project.chromeDownloadFolder=$SEL_DOWNLOAD_FOLDER test --tests $1