#!/bin/sh
## TODO- Make version a param.
curl -XPUT "localhost:9200/_river/nlmcde_v1/_meta" -d'
{
  "type": "mongodb",
    "mongodb": {
      "db": "nlmcde", 
      "collection": "dataelements",
      "script": "if( ctx.document.archived) { ctx.deleted = true; } else {if (ctx.document.classification) {var size = ctx.document.classification.length; if (size > 10) {ctx.document.classificationBoost=2.1;}else {ctx.document.classificationBoost = 0.1 + 0.2 * size;}} else {ctx.document.classificationBoost = .1}}"
	  
    },
    "index": {
      "name": "nlmcde_v1", 
      "type": "dataelement"                  
    }        
}'

