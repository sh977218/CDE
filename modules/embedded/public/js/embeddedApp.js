import * as formShared from "../../../form/shared/formShared";
import * as regStatusShared from "../../../system/shared/regStatusShared";

import "../../../system/public/js/elastic.js";
import "../../../system/public/js/orgFactories.js";
import "../../../embedded/public/js/SearchSettings.js";
import "../../../components/angular-bootstrap/ui-bootstrap-tpls.js";
import "../../../embedded/public/js/angularTemplates.js";

angular.module('embeddedApp', ['ElasticSearchResource', 'ui.bootstrap', 'OrgFactories', 'embeddedTemplates'])
    .controller('SearchCtrl', function($scope, Elastic, OrgHelpers, $http, SearchSettings) {

        $scope.args = {};
        $scope.clLimit = 3;
        $scope.raiseClLimit = function () {$scope.clLimit = 100;};
        $scope.lowerClLimit = function () {$scope.clLimit = 3;};
        $scope.lfLimit = 3;
        $scope.raiseLfLimit = function () {$scope.lfLimit = 100;};
        $scope.lowerLfLimit = function () {$scope.lfLimit = 3;};
        $scope.searchType = 'cde';
        var args1 = window.location.search.substr(1).split("&");
        args1.forEach(function(arg) {
           var argArr = arg.split("=");
            $scope.args[argArr[0]] = argArr[1];
        });

        $scope.searchSettings = {
            q: ""
            , page: 1
            , classification: []
            , classificationAlt: []
            , regStatuses: []
        };

        $http.get('/embed/' + $scope.args.id).then(function onSuccess(response) {
            $scope.embed = response.data;
            $scope.searchSettings.selectedOrg = response.data.org;
            $scope.search();
        });

        $scope.selectElement = function(s) {
            $scope.searchSettings.classification.push(s);
            $scope.selectedClassif = "";
            $scope.search();
        };

        $scope.crumbSelect = function(i) {
            $scope.searchSettings.classification.length = i + 1;
            $scope.search();
        };

        $scope.reset = function() {
            $scope.searchSettings.q = "";
            $scope.searchSettings.page = 1;
            $scope.searchSettings.classification = [];
            $scope.search();
            delete $scope.searchStarted;
        };

        $scope.concatenateQuestions = function(form) {
            var cdes = formShared.getFormCdes(form);
            return cdes.map(function(c) {return c.name;}).join(",");
        };

        $scope.concatenatePVs = function(elt) {
          return elt.valueDomain.permissibleValues.map(function(a) {
              return a.permissibleValue;
          }).join(",");
        };

        $scope.searchCDEs = function() {$scope.searchType = 'cde';};
        $scope.searchForms = function() {$scope.searchType = 'form';};

        function doClassif(currentString, classif, result) {
            if (currentString.length > 0) {
                currentString = currentString + ';';
            }
            currentString = currentString + classif.name;
            if (classif.elements && classif.elements.length > 0) {
                classif.elements.forEach(function(cl) {
                    doClassif(currentString, cl, result);
                });
            } else {
                result.push(currentString);
            }
        }

        function flattenClassification(elt) {
            var result = [];
            if (elt.classification) {
                elt.classification.forEach(function (cl) {
                    if (cl.elements) {
                        cl.elements.forEach(function (subCl) {
                            doClassif(cl.stewardOrg.name, subCl, result);
                        });
                    }
                });
            }
            return result;
        }


        $scope.search = function () {
            var type = $scope.searchType;

            $scope.searchSettings.resultPerPage = $scope.embed[$scope.searchType].pageSize;
            var embed4Type = $scope.embed[$scope.searchType];

            var timestamp = new Date().getTime();
            $scope.lastQueryTimeStamp = timestamp;
            $scope.accordionListStyle = "semi-transparent";

            for (var i = 0; i < regStatusShared.orderedList.length; i++) {
                $scope.searchSettings.regStatuses.push(regStatusShared.orderedList[i]);
                if (regStatusShared.orderedList[i] === embed4Type.minStatus) {
                    i = regStatusShared.orderedList.length;
                }
            }

            var settings = Elastic.buildElasticQuerySettings($scope.searchSettings);

            Elastic.generalSearchQuery(settings, type, function (err, result) {
                if (err) {
                    $scope.accordionListStyle = "";
                    $scope[type + 's'] = [];
                    return;
                }
                if (timestamp < $scope.lastQueryTimeStamp) return;
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage);
                $scope.totalItems = result.totalNumber;
                $scope[type + 's'] = result[type + 's'];
                $scope.elts = result[type + 's'];
                $scope.took = result.took;

                if ($scope.searchSettings.page === 1 && result.totalNumber > 0) {
                    var maxJump = 0;
                    var maxJumpIndex = 100;
                    $scope.elts.map(function(e, i) {
                        if (!$scope.elts[i+1]) return;
                        var jump = e.score - $scope.elts[i+1].score;
                        if (jump>maxJump) {
                            maxJump = jump;
                            maxJumpIndex = i+1;
                        }
                    });

                    if (maxJump > (result.maxScore/4)) $scope.cutoffIndex = maxJumpIndex;
                    else $scope.cutoffIndex = 100;
                } else {
                    $scope.cutoffIndex = 100;
                }

                $scope.accordionListStyle = "";
                $scope.aggregations = result.aggregations;

                if (result.aggregations !== undefined && result.aggregations.flatClassifications !== undefined) {
                    $scope.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets.map(function (c) {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    $scope.aggregations.flatClassifications = [];
                }

                OrgHelpers.addLongNameToOrgs($scope.aggregations.orgs.orgs.buckets, OrgHelpers.orgsDetailedInfo);

                // Decorate
                $scope.elts.forEach(function (c) {
                    c.embed = {
                        ids: []
                    };

                    if (embed4Type.ids) {
                        embed4Type.ids.forEach(function (eId) {
                            var id = c.ids.filter(function(e) {
                                return e.source === eId.source;
                            })[0];
                            if (id) {
                                c.embed[eId.idLabel] = id.id;
                                if (eId.version) {
                                    c.embed[eId.idLabel + "_version"] = id.version;
                                }
                            }
                        });
                    }

                    if (embed4Type.properties) {
                        embed4Type.properties.forEach(function (eProp) {
                            var prop = c.properties.filter(function(e) {
                                return e.key === eProp.key;
                            })[0];
                            if (prop) {
                                c.embed[eProp.label] = prop.value;
                                if (eProp.limit > 0) {
                                    c.embed[eProp.label] = c.embed[eProp.label].substr(0, eProp.limit);
                                }
                            }
                        });
                    }

                    if (embed4Type.otherNames) {
                        embed4Type.otherNames.forEach(function (eName) {
                            var name = c.naming.filter(function(n) {
                                return n.tags.filter(function (t) {
                                        return t.tag.indexOf('Question Text') > -1
                                    }).length > 0;
                            })[0];
                            if (name) {
                                c.embed[eName.label] = name.designation;
                            }
                        });
                    }

                    if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
                        c.embed.primaryDefinition = c.naming[0].definition;
                    }

                    if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
                        c.embed.registrationStatus = c.registrationState.registrationStatus;
                    }

                    if (embed4Type.classifications && embed4Type.classifications.length > 0) {
                        embed4Type.classifications.forEach(function (eCl) {
                            var flatClassifs = flattenClassification(c);
                            var exclude = new RegExp(eCl.exclude);
                            c.embed[eCl.label] = flatClassifs.filter(function (cl) {
                                result = cl.indexOf(eCl.startsWith) === 0;
                                if (eCl.exclude) result = result && !cl.match(exclude);
                                if (eCl.selectedOnly) {
                                    result = result && cl.indexOf($scope.embed.org + ";" + $scope.searchSettings.classification.join(";")) === 0;
                                }
                                return result;
                            }).map(function (cl) {
                                return cl.substr(eCl.startsWith.length);
                            });
                       });
                    }

                    if (embed4Type.linkedForms && embed4Type.linkedForms.show) {
                        c.embed.linkedForms = [];

                        var lfSettings = Elastic.buildElasticQuerySettings({
                            selectedOrg: $scope.embed.org
                            , q: c.tinyId
                            , page: 1
                            , classification: []
                            , classificationAlt: []
                            , regStatuses: []
                        });

                        Elastic.generalSearchQuery(lfSettings, "form", function (err, result) {
                            if (result.forms) {
                                result.forms.forEach(function (crf) {
                                    c.embed.linkedForms.push({name: crf.primaryNameCopy});
                                });
                            }
                        });
                    }
                });
            });
        };
    })
    .controller('TableViewCtrl', function($scope, SearchSettings) {
        $scope.searchViewSettings = SearchSettings.getDefault();

        $scope.searchViewSettings.tableViewFields.nbOfPVs = $scope.args.numberOfPvs;
        $scope.searchViewSettings.tableViewFields.permissibleValues = $scope.args.permissibleValues;
        $scope.searchViewSettings.tableViewFields.naming = $scope.args.naming;
        $scope.searchViewSettings.tableViewFields.ids = $scope.args.ids;

        $scope.searchViewSettings.tableViewFields.customFields = [];

        var embed4Type = $scope.embed[$scope.searchType];

        embed4Type.ids.forEach(function (eId) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: eId.idLabel, label: eId.idLabel});
            if (eId.version) {
                $scope.searchViewSettings.tableViewFields.customFields.push({key: eId.idLabel + "_version", label: eId.versionLabel});
            }
        });

        embed4Type.otherNames.forEach(function (eName) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: eName.label, label: eName.label});
        });


        if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: "primaryDefinition",
                label: embed4Type.primaryDefinition.label, style: embed4Type.primaryDefinition.style});
        }

        if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: "registrationStatus",
                label: embed4Type.registrationStatus.label});
        }

    })
;

