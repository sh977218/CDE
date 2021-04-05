// search empty, classifications empty
var emptyAppQuery = {"size":20,"query":{"bool":{"must_not":[{"term":{"registrationState.registrationStatus":"Retired"}},{"term":{"registrationState.administrativeStatus":"retire"}},{"term":{"archived":"true"}},{"term":{"isFork":"true"}}],"must":[{"dis_max":{"queries":[{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"}}}]}}]}},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]},"aggs":{"orgs":{"terms":{"field":"classification.stewardOrg.name","size":40,"order":{"_term":"desc"}}}}},"statuses":{"terms":{"field":"registrationState.registrationStatus"},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}}}}},"filter":{"and":[{"or":[{"term":{"registrationState.registrationStatus":"Preferred Standard"}},{"term":{"registrationState.registrationStatus":"Standard"}},{"term":{"registrationState.registrationStatus":"Qualified"}}]},{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}]},"from":null,"highlight":{"order":"score","fields":{"*":{"pre_tags":["<strong>"],"post_tags":["</strong>"],"content":{"fragment_size":1000}}}}};
// search valueDomain.datatype:'Value List', classifications empty
var permissibleValuesQuery = {"size":20,"query":{"bool":{"must_not":[{"term":{"registrationState.registrationStatus":"Retired"}},{"term":{"registrationState.administrativeStatus":"retire"}},{"term":{"archived":"true"}},{"term":{"isFork":"true"}}],"must":[{"dis_max":{"queries":[{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{"query_string":{"query":"valueDomain.datatype:'Value List'"}}}},{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{"query_string":{"fields":["naming.designation^5","naming.definition^2"],"query":"valueDomain.datatype:'Value List'"}},"boost":"2"}},{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{"query_string":{"fields":["naming.designation^5","naming.definition^2"],"query":"\"valueDomain.datatype:'Value List'\"~4"}}}}]}}]}},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]},"aggs":{"orgs":{"terms":{"field":"classification.stewardOrg.name","size":40,"order":{"_term":"desc"}}}}},"statuses":{"terms":{"field":"registrationState.registrationStatus"},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}}}}},"filter":{"and":[{"or":[{"term":{"registrationState.registrationStatus":"Preferred Standard"}},{"term":{"registrationState.registrationStatus":"Standard"}},{"term":{"registrationState.registrationStatus":"Qualified"}}]},{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}]},"from":null,"highlight":{"order":"score","fields":{"*":{"pre_tags":["<strong>"],"post_tags":["</strong>"],"content":{"fragment_size":1000}}}}};
// not an application query
var dummyQuery = {
	"query": {
		"match" : {
			"_all" : "this is a test"
		}
	}
};
var elasticUrl = "http://localhost:9200/cdetest/_search";
var numberOfQueries = 10;
var timeSpanMS = 3000;
var queryTimeSpan = timeSpanMS/numberOfQueries;

var query = permissibleValuesQuery;

var fetch = require("node-fetch");

var queryTimes = [];
var queryTime = {start:null, end:null};

var queryElastic = function() {
    var startTime = new Date().getTime();
    fetch(elasticUrl, {method: 'POST', body: JSON.stringify(query)})
        .then(res => {
            if (res.status !== 200) {
                throw new Error(res.status + ' ' + res.statusText);
            }
            return res.text();
        })
        .then(body => {
            console.log("\nQuery Result: " + body.substr(0, 300));
            var endTime = new Date().getTime();
            queryTimes.push({start:startTime, end:endTime});
            var totalTime = endTime - startTime;
            console.log("Query Time: " + totalTime);
        });
};

for (var i=0; i<numberOfQueries; i++) {
    setTimeout(queryElastic, queryTimeSpan*i);
}

setTimeout(function() {
    function add(a, b) {
    return a + b;
    }
    var avgTime = queryTimes.map(function(record){return record.end - record.start;}).reduce(add, 0) / numberOfQueries;
    avgTime = Math.floor(avgTime);
    console.log("\nAverage Time: " + avgTime);
}, timeSpanMS+2*queryTimeSpan);

var query = {
	"size" : 20,
	"query" : {
		"bool" : {
			"must_not" : [{
					"term" : {
						"registrationState.registrationStatus" : "Retired"
					}
				}, {
					"term" : {
						"registrationState.administrativeStatus" : "retire"
					}
				}, {
					"term" : {
						"archived" : "true"
					}
				}, {
					"term" : {
						"isFork" : "true"
					}
				}
			],
			"must" : [{
					"dis_max" : {
						"queries" : [{
								"function_score" : {
									"script_score" : {
										"script" : "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"
									},
									"query" : {
										"query_string" : {
											"query" : "valueDomain.datatype:'Value List'"
										}
									}
								}
							}, {
								"function_score" : {
									"script_score" : {
										"script" : "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"
									},
									"query" : {
										"query_string" : {
											"fields" : ["naming.designation^5", "naming.definition^2"],
											"query" : "valueDomain.datatype:'Value List'"
										}
									},
									"boost" : "2"
								}
							}, {
								"function_score" : {
									"script_score" : {
										"script" : "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"
									},
									"query" : {
										"query_string" : {
											"fields" : ["naming.designation^5", "naming.definition^2"],
											"query" : "\"valueDomain.datatype:'Value List'\"~4"
										}
									}
								}
							}
						]
					}
				}
			]
		}
	},
	"aggregations" : {
		"lowRegStatusOrCurator_filter" : {
			"filter" : {
				"or" : [{
						"range" : {
							"registrationState.registrationStatusSortOrder" : {
								"lte" : 3
							}
						}
					}
				]
			},
			"aggs" : {
				"orgs" : {
					"terms" : {
						"field" : "classification.stewardOrg.name",
						"size" : 40,
						"order" : {
							"_term" : "desc"
						}
					}
				}
			}
		},
		"statuses" : {
			"terms" : {
				"field" : "registrationState.registrationStatus"
			},
			"aggregations" : {
				"lowRegStatusOrCurator_filter" : {
					"filter" : {
						"or" : [{
								"range" : {
									"registrationState.registrationStatusSortOrder" : {
										"lte" : 3
									}
								}
							}
						]
					}
				}
			}
		}
	},
	"filter" : {
		"and" : [{
				"or" : [{
						"term" : {
							"registrationState.registrationStatus" : "Preferred Standard"
						}
					}, {
						"term" : {
							"registrationState.registrationStatus" : "Standard"
						}
					}, {
						"term" : {
							"registrationState.registrationStatus" : "Qualified"
						}
					}
				]
			}, {
				"or" : [{
						"range" : {
							"registrationState.registrationStatusSortOrder" : {
								"lte" : 3
							}
						}
					}
				]
			}
		]
	},
	"from" : null,
	"highlight" : {
		"order" : "score",
		"fields" : {
			"*" : {
				"pre_tags" : ["<strong>"],
				"post_tags" : ["</strong>"],
				"content" : {
					"fragment_size" : 1000
				}
			}
		}
	}
};