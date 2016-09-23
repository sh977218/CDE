#!/bin/sh

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any -PdownloadFolder=c:\temp\downloads -PchromeDownloadFolder=c:\temp\downloads -Dorg.gradle.project.downloadFolder=c:\temp\downloads -Dorg.gradle.project.chromeDownloadFolder=c:\temp\downloads clean compileTest &

sh restore-test-instance.sh

#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=$NB_OF_FORKS -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=./ test &
#gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -PforkNb=6 -Ptimeout=8 -Pbrowser=chrome -PdownloadFolder=S://data test &
<<<<<<< HEAD
gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 -PdownloadFolder=C:\temp\Downloads\ -PchromeDownloadFolder=c:\temp\downloads -Dorg.gradle.project.downloadFolder=c:\temp\downloads -Dorg.gradle.project.chromeDownloadFolder=c:\temp\downloads test --tests *sdcXmlExportLoinc* & export NODE_ENV=test
=======
gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 -PdownloadFolder=C:\temp\Downloads\ -PchromeDownloadFolder=c:\temp\downloads -Dorg.gradle.project.downloadFolder=c:\temp\downloads -Dorg.gradle.project.chromeDownloadFolder=c:\temp\downloads test --tests *addRemoveContext* & export NODE_ENV=test
>>>>>>> 4d982791e302cf14bb381f42ad209e001a6d1145
node app