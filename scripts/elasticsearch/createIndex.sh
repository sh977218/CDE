#!/bin/sh
## Make version a param
curl -XPOST localhost:9200/nlmcde_v1 -d '
{
    "settings" : {
    },
    "mappings" : {
        "dataelement" : {
            "properties" : {
                "stewardOrg.name" : { "type" : "string", "index" : "not_analyzed" }
                , "classification.conceptSystem": { "type" : "string", "index" : "not_analyzed" }
                , "classification.concept": { "type" : "string", "index" : "not_analyzed" }
                , "classification.stewardOrg.name": { "type" : "string", "index" : "not_analyzed" } 
                , "origin" : { "type" : "string", "index" : "not_analyzed" }
            }
        }
    }
}'

