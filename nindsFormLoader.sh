#!/bin/sh

# Location of node. For dev testing use '.'  for prod testing use 'build'
NODE_LOC='.'

target='{"count":0,"_shards":{"total":1,"successful":1,"failed":0}}'

gradle -b test/selenium/build.gradle -PhubUrl=any -PtestUrl=any -PforkNb=8 -Ptimeout=8 -Pbrowser=any clean compileTest &

gradle -b test/selenium/build.gradle -PhubUrl=$HUB_URL -PtestUrl=$TEST_URL -Pbrowser=chrome -PforkNb=2 -Ptimeout=8 test --tests *NindsFormLoader* &
export NODE_ENV=test
node $NODE_LOC/app > test-console.out
