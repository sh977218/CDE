#!/bin/sh
curl -XPUT "localhost:9200/_river/nlmcde_v4/_meta" -d'
{
  "type": "mongodb",
    "mongodb": {
      "db": "nlmcde", 
      "collection": "dataelements",
      "script": "if( ctx.document.archived) { ctx.deleted = true; }" 
    },
    "index": {
      "name": "nlmcde_v4", 
      "type": "dataelement"                  
    }        
}'

