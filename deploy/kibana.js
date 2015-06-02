var config = require('config');

var sqIndex = config.elastic.uri.storedQueryIndex.name;

exports.kibana =
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "hits" : {
    "total" : 5,
    "max_score" : 1.0,
    "hits" : [ {
      "_index" : ".kibana",
      "_type" : "config",
      "_id" : "4.0.2",
      "_score" : 1.0,
      "_source":{"buildNum":6004,"defaultIndex": "storedquerytest"}
    }, {
      "_index" : ".kibana",
      "_type" : "dashboard",
      "_id" : "Default-Dashboard",
      "_score" : 1.0,
      "_source":{"title":"Default Dashboard","hits":0,"description":"","panelsJSON":"[{\"id\":\"Most-Searched-Classifications\",\"type\":\"visualization\",\"size_x\":5,\"size_y\":5,\"col\":1,\"row\":1}]","version":1,"kibanaSavedObjectMeta":{"searchSourceJSON":"{\"filter\":[{\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}}]}"}}
    }, {
      "_index" : ".kibana",
      "_type" : "visualization",
      "_id" : "Most-Searched-Classifications",
      "_score" : 1.0,
      "_source":{"title":"Most Searched Classifications","visState":"{\"type\":\"pie\",\"params\":{\"shareYAxis\":true,\"addTooltip\":true,\"addLegend\":true,\"isDonut\":false},\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"selectedOrg1\",\"size\":6,\"order\":\"desc\",\"orderBy\":\"1\"}},{\"id\":\"3\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"classifLevel0\",\"size\":6,\"order\":\"desc\",\"orderBy\":\"1\"}},{\"id\":\"4\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"classifLevel1\",\"size\":6,\"order\":\"desc\",\"orderBy\":\"1\"}}],\"listeners\":{}}","description":"","version":1,"kibanaSavedObjectMeta":{"searchSourceJSON":"{\"index\":\"storedquerytest\",\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}},\"filter\":[]}"}}
    }, {
      "_index" : ".kibana",
      "_type" : "index-pattern",
      "_id" : "storedquerytest",
      "_score" : 1.0,
      "_source":{"title":"storedquerytest","timeFieldName":"date","customFormats":"{}","fields":"[{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"regStatuses\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":false,\"analyzed\":false,\"name\":\"_source\",\"count\":0,\"scripted\":false},{\"type\":\"date\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"date\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"name\":\"_type\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"selectedElements1\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":false,\"analyzed\":false,\"name\":\"_id\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"classifLevel3\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"classifLevel4\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"classifLevel0\",\"count\":0,\"scripted\":false},{\"type\":\"boolean\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"isSiteAdmin\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"classifLevel1\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"classifLevel2\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":false,\"analyzed\":false,\"name\":\"_index\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"selectedElements2\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":true,\"doc_values\":false,\"name\":\"searchTerm\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"selectedOrg1\",\"count\":0,\"scripted\":false},{\"type\":\"string\",\"indexed\":true,\"analyzed\":false,\"doc_values\":false,\"name\":\"selectedOrg2\",\"count\":0,\"scripted\":false}]"}
    }, {
      "_index" : ".kibana",
      "_type" : "visualization",
      "_id" : "Most-Searched-Terms",
      "_score" : 1.0,
      "_source":{"title":"Most Searched Terms","visState":"{\"type\":\"histogram\",\"params\":{\"shareYAxis\":true,\"addTooltip\":true,\"addLegend\":true,\"mode\":\"stacked\",\"defaultYExtents\":false},\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"searchTerm\",\"size\":30,\"order\":\"desc\",\"orderBy\":\"1\"}}],\"listeners\":{}}","description":"","version":1,"kibanaSavedObjectMeta":{"searchSourceJSON":"{\"index\":\"storedquerytest\",\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}},\"filter\":[]}"}}
    } ]
  }
}
;

exports.kibana.hits.hits.forEach(function(hit) {
    if (hit._type === "config") hit._source.defaultIndex = sqIndex;
});
