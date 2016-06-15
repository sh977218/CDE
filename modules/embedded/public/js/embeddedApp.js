angular.module('embeddedApp', ['ElasticSearchResource', 'ui.bootstrap', 'OrgFactories'])
    .controller('SearchCtrl', function($scope, Elastic, OrgHelpers) {

        $scope.args = {};
        $scope.searchType = 'cde';
        var args1 = window.location.search.substr(1).split("&");
        args1.forEach(function(arg) {
           var argArr = arg.split("=");
            $scope.args[argArr[0]] = argArr[1];
        });

        $scope.org = $scope.args.org;
        var pageSize = 5; // check this syntax
        if ($scope.args.pageSize) pageSize = $scope.args.pageSize;

        $scope.searchSettings = {
            q: ""
            , page: 1
            , classification: []
            , classificationAlt: []
            , regStatuses: []
            , resultPerPage: pageSize
            , selectedOrg: $scope.org
        };

        $scope.selectElement = function(s) {
            $scope.searchSettings.classification.push(s);
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
            var cdes = exports.getFormCdes(form);
            return cdes.map(function(c) {return c.name;}).join(",");
        };

        $scope.concatenatePVs = function(elt) {
          return elt.valueDomain.permissibleValues.map(function(a) {
              return a.permissibleValue;
          }).join(",");
        };

        $scope.searchCDEs = function() {$scope.searchType = 'cde';};
        $scope.searchForms = function() {$scope.searchType = 'form';};

        $scope.search = function () {
            var type = $scope.searchType;

            var timestamp = new Date().getTime();
            $scope.lastQueryTimeStamp = timestamp;
            $scope.accordionListStyle = "semi-transparent";
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
                    c.embed = {};
                    //c.embed.primaryName = "<a target='_blank' href='https://cde.nlm.nih.gov/'>{{c.naming[0].designation}}</a>";
                    if ($scope.args.sourceId) {
                        var id = c.ids.filter(function(e) {
                             return e.source === $scope.args.org;
                        })[0];
                        if (id) c.embed.sourceId = id.id;
                    }
                    if ($scope.args.sourceVersion) {
                        var id = c.ids.filter(function(e) {
                            return e.source === $scope.args.org;
                        })[0];
                        if (id) c.embed.sourceVersion = id.version;
                    }
                    if ($scope.args.primaryDefinition) {
                        c.embed.primaryDefinition = c.naming[0].definition;
                    }
                });
            });
        };
        $scope.search();
    })
    .controller('TableViewCtrl', function($scope, SearchSettings) {
        $scope.searchViewSettings = SearchSettings.getDefault();

        $scope.searchViewSettings.tableViewFields.nbOfPVs = $scope.args.numberOfPvs;
        $scope.searchViewSettings.tableViewFields.permissibleValues = $scope.args.permissibleValues;
        $scope.searchViewSettings.tableViewFields.naming = $scope.args.naming;
        $scope.searchViewSettings.tableViewFields.ids = $scope.args.ids;

        $scope.searchViewSettings.tableViewFields.customFields = [];

        //$scope.searchViewSettings.tableViewFields.customFields.push({key: "primaryName", label: "Name", asHtml: true});

        if ($scope.args.primaryDefinition) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: "primaryDefinition", label: "Definition"});
        }
        if ($scope.args.sourceId) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: "sourceId", label: "ID"});
        }
        if ($scope.args.sourceVersion) {
            $scope.searchViewSettings.tableViewFields.customFields.push({key: "sourceVersion", label: "version"});
        }

    })
;

