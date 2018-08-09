#!/bin/bash
for i in *.zip; do
    [ -d "./a/$i" ] || mkdir -p "./a/$i"
    unzip "$i" -d "./a/$i"
done
