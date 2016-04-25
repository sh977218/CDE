angular.module('systemModule').controller('ExportCtrl', ['$scope', 'Elastic', '$http', 'SearchSettings',
    function ($scope, $http, Elastic, SearchSettings) {
        $scope.feedbackClass = ["fa-download"];
        $scope.csvDownloadState = "none";

        $scope.exportSearchResults = function (type) {
            if ($scope.module === 'form' && (!$scope.user || !$scope.user._id)) {
                return $scope.Alert.addAlert("danger", "Please login to access this feature");
            }

            try {
                !!new Blob;
            } catch (e) {
                return $scope.addAlert("danger", "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
            }
            $scope.feedbackClass = ['fa-spinner', 'fa-pulse'];
            $scope.addAlert("warning", "Your export is being generated, please wait.");
            Elastic.getExport(Elastic.buildElasticQuerySettings($scope.searchSettings), $scope.module, function (err, result) {
                if (err) return $scope.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
                var exporters =
                {
                    'csv': function (result) {
                        SearchSettings.getPromise().then(function (settings) {
                            var csv = exports.getCdeCsvHeader(settings.tableViewFields);
                            JSON.parse(result).forEach(function (ele) {
                                csv += exports.convertToCsv(exports.projectCdeForExport(ele, settings.tableViewFields));
                            });
                            var blob = new Blob([csv], {type: "text/csv"});
                            saveAs(blob, 'SearchExport.csv');
                        });
                    },
                    'json': function (result) {
                        var blob = new Blob([result], {type: "application/json"});
                        saveAs(blob, "SearchExport.json");
                    },
                    'xml': function (result) {
                        var zip = new JSZip();
                        JSON.parse(result).forEach(function (oneElt) {
                            zip.file(oneElt.tinyId + ".xml", JXON.jsToString({element: oneElt}))
                        });
                        var content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_XML.zip");
                    },
                    'odm': function (result) {
                        var zip = new JSZip();
                        JSON.parse(result).forEach(function (oneElt) {
                            exports.getFormOdm(oneElt, function (err, odmElt) {
                                if (err) {
                                    // @TODO
                                }
                                else {
                                    zip.file(oneElt.tinyId + ".xml", JXON.jsToString({ODM: odmElt}));
                                }
                            });
                        });
                        var content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_ODM.zip");
                    },
                    'redCap': function (result) {
                        var csv = exports.redCapHeader;
                        JSON.parse(result).forEach(function (ele) {
                            csv += exports.convertToCsv(exports.projectCdeForRedCapExport(ele));
                        });
                        var blob = new Blob([csv], {type: "text/csv"});
                        saveAs(blob, 'RedCap.csv');
                    }
                };
                if (result) {
                    var exporter = exporters[type];
                    if (!exporter) {
                        $scope.addAlert("danger", "This export format is not supported.");
                    } else {
                        exporter(result);
                        $scope.addAlert("success", "Export downloaded.");
                        $scope.feedbackClass = ["fa-download"];
                    }
                } else {
                    $scope.addAlert("danger", "There was no data to export.");
                }
            });
        };

        $scope.quickBoardExport = function (quickBoard) {
            SearchSettings.getPromise().then(function (settings) {
                var result = exports.getCdeCsvHeader(settings.tableViewFields);
                quickBoard.elts.forEach(function (ele) {
                    result += exports.convertToCsv(exports.projectCdeForExport(ele, settings.tableViewFields));
                });

                if (result) {
                    var blob = new Blob([result], {
                        type: "text/csv"
                    });
                    saveAs(blob, 'QuickBoardExport' + '.csv');
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                } else {
                    $scope.addAlert("danger", "Something went wrong, please try again in a minute.");
                }
            });
        };

        $scope.exportRedCap = function (tinyId) {
            var projectFormToRedCap = function (q) {
                return q;
            };
            var redCapHeader = 'Variable / Field Name,Form Name,Section Header,Field Type,Field Label,Choices Calculations OR Slider Labels,Field Note,Text Validation Type OR Show Slider Number,Text Validation Min,Text Validation Max,Identifier?,Branching Logic (Show field only if...),Required Field?,Custom Alignment,Question Number (surveys only),Matrix Group Name,Matrix Ranking?\n';
            $http.get('/form/' + tinyId)
                .then(function successCb(resp) {

                        var formatSkipLogic;
                        var form = resp.data;
                        if (form.stewardOrg.name === 'PhenX') {
                            $scope.addAlert('warning', 'You can download PhenX RedCap from <a class="alert-link" href="https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist">here</a>.');
                            return;
                        }
                        if (form.stewardOrg.name === 'PROMIS / Neuro-QOL') {
                            $scope.addAlert('warning', 'You can download PROMIS / Neuro-QOL RedCap from <a class="alert-link" href="http://project-redcap.org/">here</a>.');
                            return;
                        }
                        var instrumentResult = redCapHeader;
                        var formQuestions = exports.getFormQuestionsWithSectionHeader(form);
                        formatSkipLogic = function (text, map) {
                            if (text) {
                                text = text.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
                                return text.replace(/"[A-z0-9 ()-]+" [=|<|>] "[A-z0-9 \(\)-]+"/g, function (segment) {
                                    return segment.replace(/"[A-z0-9 \(\)-]+"/, function (s) {
                                        s = s.replace(/"/g, '');
                                        return '[' + map[s] + ']';
                                    });
                                });
                            }
                        };
                        var label_variable_map = {};
                        var field_type_map = {
                            "Text": "text",
                            "Value List": "radio",
                            "Number": "text",
                            "Date": "text"
                        };
                        var text_validation_type_map = {
                            "Text": "",
                            "Value List": "",
                            "Number": "number",
                            "Date": "date"
                        };
                        formQuestions.forEach(function (formQuestion) {
                            var q = formQuestion.question.question;
                            var cdeSkipLogic;
                            if (formQuestion.question.skipLogic)
                                cdeSkipLogic = formQuestion.question.skipLogic.condition;
                            var variableName = 'nlmcde_' + q.cde.tinyId.toLowerCase() + '_' + form.version;
                            var labelName = formQuestion.question.label;
                            label_variable_map[labelName] = variableName;
                            var redCapSkipLogic = formatSkipLogic(cdeSkipLogic, label_variable_map);
                            var row = {
                                'Variable / Field Name': variableName,
                                'Form Name': form.naming[0].designation,
                                'Section Header': formQuestion.sectionHeader,
                                'Field Type': field_type_map[q.datatype],
                                'Field Label': labelName,
                                'Choices, Calculations, OR Slider Labels': q.answers.map(function (a) {
                                    return a.permissibleValue + ',' + a.valueMeaningName;
                                }).join('|'),
                                'Field Note': '',
                                'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
                                'Text Validation Min': '',
                                'Text Validation Max': '',
                                'Identifier?': '',
                                'Branching Logic (Show field only if...)': redCapSkipLogic,
                                'Required Field?': q.required,
                                'Custom Alignment': '',
                                'Question Number (surveys only)': '',
                                'Matrix Group Name': '',
                                'Matrix Ranking?': ''
                            };
                            instrumentResult += exports.convertToCsv(row, projectFormToRedCap) + '\n';
                        });
                        var zip = new JSZip();
                        zip.file('AuthorID.txt', 'NLM');
                        zip.file('InstrumentID.txt', form.tinyId);
                        zip.file('instrument.csv', instrumentResult);
                        var content = zip.generate({type: 'blob'});
                        saveAs(content, 'redCap.zip');
                    }, function errorCb() {
                        $scope.addAlert('danger', 'error occurred.');
                    }
                )
            ;
        };
    }])
;