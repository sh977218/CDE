var cdesvc = require('./cdesvc')
  , boardsvc = require('./boardsvc')
  , usersvc = require('./usersvc')
  , usersvc_system = require('../../system/node-js/usersrvc')
  , mongo_data = require('./mongo-cde')
  , classificationNode = require('./classificationNode')
  , classificationNode_system = require('../../system/node-js/classificationNode')
  , xml2js = require('xml2js')
  , vsac = require('./vsac-io')
  , config = require('config')
  , elastic = require('./elastic')
  , helper = require('../../system/node-js/helper.js')
  , logging = require('../../system/node-js/logging.js')
  , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
  , classificationShared = require('../../system/shared/classificationShared.js')
  , path = require('path')
  , express = require('express')
  , sdc = require("./sdc.js")
  , status = require('./status')
  , appSystem = require('../../system/node-js/app.js')
  , authorizationShared = require("../../system/shared/authorizationShared")
  , async = require("async")
  , multer  = require('multer')
;

exports.init = function(app, daoManager) {

    var viewConfig = {modules: config.modules};

    daoManager.registerDao(mongo_data);

    app.get('/quickBoard', function(req, res) {
      res.render('quickBoard');
    });

    app.get('/exportCdeSearch', function(req, res) {
      res.render('cdeExport');
    });

    app.get('/list', function(req, res){
        res.render('list','system',{module:"cde"});
    });

    app.get('/boardList', appSystem.nocacheMiddleware, function(req, res){
      res.render('boardList');
    });

    app.get('/deCompare', appSystem.nocacheMiddleware, function(req, res){
      res.render('deCompare');
    });

    app.get('/listboards', function(req, res) {
       boardsvc.boardList(req, res); 
    });
    
    app.get('/createcde', appSystem.nocacheMiddleware, function(req, res) {
       res.render('createcde'); 
    });

    app.get('/deview', function(req, res) {
        res.render("deview", 'cde', {config: viewConfig});
    });

    app.get('/myboards', function(req, res) {
       res.render("myBoards"); 
    });

    app.post('/cdesByTinyIdList', function(req, res) {
        mongo_data.cdesByTinyIdList(req.body, function(err, cdes) {
            res.send(cdes);
        });
    });

    app.get('/cdesforapproval', function(req, res) {
        mongo_data.cdesforapproval(req.user.orgAdmin, function(err, cdes) {
            res.send(cdesvc.hideProprietaryPvs(cdes, req.user));
        });
    });

    app.get('/listOrgsFromDEClassification', function(req, res) {
        elastic.DataElementDistinct("classification.stewardOrg.name", function(result) {
            res.send(result);
        });
    });
    
    app.get('/priorcdes/:id', function(req, res) {
        cdesvc.priorCdes(req, res);
    });

    app.get('/forks/:id', function(req, res) {
        cdesvc.forks(req, res);
    });

    app.post('/dataelement/fork', function(req, res) {
        adminItemSvc.fork(req, res, mongo_data);
    });

    app.post('/acceptFork', function(req, res) {
        adminItemSvc.acceptFork(req, res, mongo_data);
    });

    app.get('/forkroot/:tinyId', function (req, res) {
        adminItemSvc.forkRoot(req, res, mongo_data);
    });

    app.get('/dataelement/:id', function(req, res) {  
        cdesvc.show(req, function(result) {
            res.send(cdesvc.hideProprietaryPvs(result, req.user));
        });
    });

    app.get('/debytinyid/:tinyId/:version?', function(req, res) {
        if (!req.params.version) {
            mongo_data.eltByTinyId(req.params.tinyId, function(err, cdes) {
                res.send(cdesvc.hideProprietaryPvs(cdes, req.user));
            }); 
        } else {
            mongo_data.byTinyIdAndVersion(req.params.tinyId, req.params.version, function(err, de) {
                res.send(cdesvc.hideProprietaryPvs(de, req.user));
            });
        }
    });
    
    app.post('/debytinyid/:tinyId/:version?', function(req, res) {
        return cdesvc.save(req, res);
    });    

    app.post('/dataelement', function (req, res) {
        return cdesvc.save(req, res);
    });


    app.get('/viewingHistory/:start', function(req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            var splicedArray = req.user.viewHistory.splice(req.params.start, 10);
            var idList = [];
            for (var i = 0; i < splicedArray.length; i++) {
                idList.push(splicedArray[i]);
            }
            mongo_data.cdesByTinyIdList(idList, function(err, cdes) {
                res.send(cdesvc.hideProprietaryPvs(cdes, req.user));
            });
        }
    });

    app.get('/boards/:userId', function(req, res) {
        mongo_data.boardsByUserId(req.params.userId, function(result) {
            res.send(result);
        });
    });

    app.get('/deBoards/:tinyId', function(req, res) {
       mongo_data.publicBoardsByDeTinyId(req.params.tinyId, function (result) {
            res.send(result);
       });
    });

    app.get('/board', function(req, res) {
       res.render("boardView"); 
    });

    app.get('/board/:boardId/:start/:size?', function(req, res) {
        var size = 20;
        if (req.params.size) {
            size = req.params.size;
        }
        if (size > 500) {
            return res.status(403).send("Request too large");
        }
        mongo_data.boardById(req.params.boardId, function (err, board) {
            if (board) {
                if (board.shareStatus !== "Public") {
                    if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                        return res.status(403).end();
                    }
                }
                var totalItems = board.pins.length;
                var pins = board.pins.splice(req.params.start, size); 
                board.pins = pins;
                var idList = [];
                for (var i = 0; i < pins.length; i++) {
                    idList.push(pins[i].deTinyId);
                }
                mongo_data.cdesByTinyIdList(idList, function(err, cdes) {
                    res.send({board: board, cdes: cdesvc.hideProprietaryPvs(cdes), totalItems: totalItems});
                });
            } else {
                res.status(404).end();
            }
        });
    });

    app.post('/board', function(req, res, next) {
        var boardQuota = config.boardQuota || 50;
        var checkUnauthorizedPublishing = function(user, shareStatus) {
            return shareStatus === "Public" && !authorizationShared.hasRole(user, "BoardPublisher")
        };
        if (req.isAuthenticated()) {
            var board = req.body;
            if (!board._id) {
                board.createdDate = Date.now();
                board.owner = {
                    userId: req.user._id
                    , username: req.user.username
                };            
                if (checkUnauthorizedPublishing(req.user, req.body.shareStatus)) return res.status(403).send("You don't have permission to make boards public!");
                async.parallel([
                    function(callback){
                        mongo_data.newBoard(board, function(err, newBoard) {
                           callback(err, newBoard);
                        });                        
                    },
                    function(callback){
                        mongo_data.nbBoardsByUserId(req.user._id, function(err, nbBoards) {
                            callback(err, nbBoards);
                        });
                    }
                ],
                function(err, results){
                    if (results[1]<boardQuota) return res.send(results[0]);
                    mongo_data.removeBoard(results[0]._id);
                    res.status(403).send("You have too many boards!");
                });

            } else  {
                mongo_data.boardById(board._id, function(err, b) {
                    if (err) {
                        logging.errorLogger.error("Cannot find board by id", {origin: "cde.app.board", stack: new Error().stack, request: logging.generateErrorLogRequest(req), details: "board._id "+board._id}); 
                        return res.status(404).send("Cannot find board.");
                    }                     
                    b.name = board.name;
                    b.description = board.description;
                    b.shareStatus = board.shareStatus;
                    if (checkUnauthorizedPublishing(req.user, b.shareStatus)) return res.status(403).send("You don't have permission to make boards public!");
                    return mongo_data.save(b, function(err) {
                        if (err) logging.errorLogger.error("Cannot save board", {origin: "cde.app.board", stack: new Error().stack, request: logging.generateErrorLogRequest(req), details: "board._id "+board._id}); 
                        res.send(b);
                    });                
                });
            }
        } else {
            res.send("You must be logged in to do this.");
        }
    });

    app.delete('/board/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data.boardById(req.params.boardId, function (err, board) {
                if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                    res.send("You must own the board that you wish to delete.");
                }
                mongo_data.removeBoard(req.params.boardId, function (err) {
                    res.send("Board Removed.");
                });
            });
        } else {
            res.send("You must be logged in to do this.");
        }
    });

    // Check that apache will support delete
    app.delete('/pincde/:pinId/:boardId', function(req, res) {
       if (req.isAuthenticated()) {
           usersvc.removePinFromBoard(req, res);
       } else {
           res.send("Please login first.");
       }
    });

    app.put('/pincde/:tinyId/:boardId', function(req, res) {
       if (req.isAuthenticated()) {
           usersvc.pinToBoard(req, res);
       } else {
           res.send("Please login first.");
       }
    });

    app.get('/autocomplete/:name', function(req, res) {
        return cdesvc.name_autocomplete(req.params.name, res);
    });

    app.get('/autocomplete/org/:name', function (req, res) {
        mongo_data.org_autocomplete(req.params.name, function (result) {
            res.send(result);
        });
    });

    app.get('/cdediff/:deId', function(req, res) {
       return cdesvc.diff(req, res); 
    });

    app.post('/elasticSearch/cde', function(req, res) {
       return elastic.elasticsearch(req.body.query, function(err, result) {
           if (err) {return res.status(400).send("invalid query")};
           result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
           res.send(result);
       });
    });

    app.post('/classification/cde/moveclassif', function(req, res) {
        classificationNode.moveClassifications(req, function(err, cde) {
           if(!err) res.send(cde);
        });
    });  

    if (config.modules.cde.attachments) {
        app.post('/attachments/cde/add', multer(),function(req, res) {  
            console.log(req.body.id);
            adminItemSvc.addAttachment(req, res, mongo_data);
        });

        app.post('/attachments/cde/remove', function(req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_data);
        });
        
        app.post('/attachments/cde/setDefault', function(req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_data);
        });        
    }
    
    if (config.modules.cde.comments) {
        app.post('/comments/cde/add', function(req, res) {
            adminItemSvc.addComment(req, res, mongo_data);
        });

        app.post('/comments/cde/remove', function(req, res) {
            adminItemSvc.removeComment(req, res, mongo_data);
        });
    }


    app.get('/userTotalSpace/:uname', function(req, res) {
       return mongo_data.userTotalSpace(req.params.uname, function(space) {
           return res.send({username: req.params.uname, totalSize: space});
       });
    });
    
    app.get('/moreLikeCde/:cdeId', function(req, res) {
        elastic.morelike(req.params.cdeId, function(result) {
            result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
            res.send(result);
        });
    });

    app.post('/desByConcept', function(req, res) {
       mongo_data.desByConcept(req.body, function(result) {
           res.send(cdesvc.hideProprietaryPvs(result, req.user));
       }); 
    });

    app.get('/deCount', function(req, res) {
       mongo_data.deCount(function (result) {
           res.send({count: result});
       });
    });

    var fetchRemoteData = function() {
        vsac.getTGT(function(tgt) {
            console.log("Got TGT");
        });

        elastic.fetchPVCodeSystemList();   
    };

    // run every 1 hours
    fetchRemoteData();
    setInterval(fetchRemoteData, 1000 * 60 * 60 * 1);

    var parser = new xml2js.Parser();
    app.get('/vsacBridge/:vsacId', function(req, res) {
        if (!req.user) { 
            res.status(202).send({error: {message: "Please login to see VSAC mapping."}});
        }
        vsac.getValueSet(req.params.vsacId, function(result) {       
            if (result === 404 || result === 400) {
                res.status(result);
                res.end();
            } else {
                parser.parseString(result, function (err, jsonResult) {
                 res.send(jsonResult);
                });
            }
        }) ;
    });

    app.get('/permissibleValueCodeSystemList', function(req, res) {
        res.send(elastic.pVCodeSystemList);
    });

    app.post('/mail/messages/new', function(req, res) {
        if (req.isAuthenticated()) {
            var message = req.body;
            if (message.author.authorType === "user") {
                message.author.name = req.user.username;
            }
            message.date = new Date();
            mongo_data.createMessage(message, function() {
              res.end();
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    });

    app.post('/mail/messages/update', function(req, res) {
        mongo_data.updateMessage(req.body, function(err) {
            if (err) {
                res.statusCode = 404;
                res.send("Error while updating the message");
            } else {
                res.end();
            }
        });
    });

    app.get('/mail/template/inbox', function(req, res) {
        res.render("inbox"); 
    });

    app.post('/mail/messages/:type', function(req, res) {
        mongo_data.getMessages(req, function(err, messages) {
            if (err) res.status(404).send(err);
            else res.send(messages);
        });
    });

    app.post('/retireCde', function (req, res) {
        req.params.type = "received";
        mongo_data.byId(req.body._id, function(err, cde) {
            if (err) res.status(404).send(err);
            if (!cde.registrationState.administrativeStatus === "Retire Candidate") return res.status(409).send("CDE is not a Retire Candidate");
            cde.registrationState.registrationStatus = "Retired";
            delete cde.registrationState.administrativeStatus;
            cde.save(function() {
                res.end();
            });        
        });
    });

    var systemAlert = "";
    app.get("/systemAlert", function(req, res) {
        res.send(systemAlert);
    });

    app.post("/systemAlert", function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            systemAlert = req.body.alert;
            console.log("system: " + systemAlert);
            res.send("OK");
        } else {
            res.status(401).send("Not Authorized");
        };
    });
    
    app.get('/sdc/:tinyId/:version', function (req, res) {
       sdc.byTinyIdVersion(req, res);
    });

    app.get('/sdc/:id', function (req, res) {
       sdc.byId(req, res);
    });    
    
    app.get('/sdcView', function(req, res){
        res.render('sdcView');
    });    
    
    app.get('/profile', function(req, res) {
        res.render("profile", "cde"); 
    });        
    
    app.get('/status/cde', status.status);
    
    app.post('/pinEntireSearchToBoard', function(req, res) {
        if (req.isAuthenticated()) {
            usersvc.pinAllToBoard(req, res);
        } else {
            res.send("Please login first.");
        }      
    });
    
    app.get('/cde/properties/keys', function(req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_data);
    });

    app.get('/cde/mappingSpecifications/types', function(req, res) {
        mongo_data.getDistinct("mappingSpecifications.spec_type", function(err, types) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(types);
            }
        });
    });

    app.get('/cde/mappingSpecifications/contents', function(req, res) {
        mongo_data.getDistinct("mappingSpecifications.content", function(err, contents) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(contents);
            }
        });
    });    
    app.get('/archivedCdes/:cdeArray', function(req, res) {        
        mongo_data.archivedCdes(req.params.cdeArray, function(err, resultCdes) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find archived cdes", {origin: "cde.app.archivedCdes", stack: new Error().stack}, req); 
                res.status(500).send("Unexpected Error");
            } else res.send(resultCdes);
        });
    });

};
