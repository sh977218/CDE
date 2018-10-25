#!/bin/bash
for i in *.zip; do
    [ -d "./redcap/$i" ] || mkdir -p "./redcap/$i"
    unzip "$i" -d "./redcap/$i"
done
