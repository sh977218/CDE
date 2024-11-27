#!/bin/sh

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any clean compileTest
gradle -b test/selenium/build.gradle -DhubUrl=$HUB_URL -DtestUrl=$TEST_URL -Dbrowser=chrome -PforkNb=2 -Dtimeout=8 test --tests $1