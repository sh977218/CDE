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
;

exports.init = function(app, daoManager) {
    
    daoManager.registerDao(mongo_data);

    app.use("/cde/public", express.static(path.join(__dirname, '../public')));

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
        res.render("deview");
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
    
    app.post('/addComment', function(req, res) {
        if (req.isAuthenticated()) {
            mongo_data.addComment(req.body.deId, req.body.comment, req.user._id, function (err, de) {
                
                if (err) {
                    res.send(err);
                    return;
                }
                res.send({message: "Comment added", de: de});
            });
        } else {
            res.send({message: "You are not authorized."});                   
        }
    });

    app.post('/removeComment', function(req, res) {
        if (req.isAuthenticated()) {
            mongo_data.byId(req.body.deId, function (err, de) {
                if (err) {
                    res.send("Data Element does not exist.");
                }
                de.comments.forEach(function(comment, i){
                    if (comment._id == req.body.commentId) {
                        if( req.user.username == comment.username || 
                            (req.user.orgAdmin.indexOf(de.stewardOrg.name) > -1) ||
                            req.user.siteAdmin
                        ) {
                            de.comments.splice(i, 1);
                            de.save(function (err) {
                               if (err) {
                                   res.send({message: err});
                               } else {
                                   res.send({message: "Comment removed", de: de});
                               }
                            });                        
                        } else {
                            res.send({message: "You can only remove comments you own."});
                        }
                    }
                });
            });
        } else {
            res.send("You are not authorized.");                   
        }
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
            mongo_data.cdesByTinyIdList([req.params.tinyId], function(err, cdes) {
                res.send(cdesvc.hideProprietaryPvs(cdes[0], req.user));
            }); 
        } else {
            mongo_data.deByTinyIdAndVersion(req.params.tinyId, req.params.version, function(err, de) {
                res.send(cdesvc.hideProprietaryPvs(de, req.user));
            });
        }
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

    app.get('/board/:boardId/:start', function(req, res) {
        mongo_data.boardById(req.params.boardId, function (err, board) {
            if (board.shareStatus !== "Public") {
                if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                    return res.send("This board is private");
                }
            }
            var totalItems = board.pins.length;
            var pins = board.pins.splice(req.params.start, 20); 
            board.pins = pins;
            var idList = [];
            for (var i = 0; i < pins.length; i++) {
                idList.push(pins[i].deTinyId);
            }
            mongo_data.cdesByTinyIdList(idList, function(err, cdes) {
                res.send({board: board, cdes: cdesvc.hideProprietaryPvs(cdes), totalItems: totalItems});
            });
        });
    });

    app.post('/board', function(req, res) {
        if (req.isAuthenticated()) {
            var board = req.body;
            if (!board._id) {
                board.createdDate = Date.now();
                board.owner = {
                    userId: req.user._id
                    , username: req.user.username
                };
                return mongo_data.newBoard(board, function(err, newBoard) {
                   res.send(newBoard); 
                });
            } else  {
                mongo_data.boardById(board._id, function(err, b) {
                    if (err) console.log(err);
                    b.name = board.name;
                    b.description = board.description;
                    b.shareStatus = board.shareStatus;
                    return mongo_data.save(b, function(err) {
                        if (err) console.log(err);
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
       return elastic.elasticsearch(req.body.query, function(result) {
           result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
           res.send(result);
       }); 
    });

    app.post('/classification/cde/moveclassif', function(req, res) {
        classificationNode.moveClassifications(req, function(err, cde) {
           if(!err) res.send(cde);
        });
    });  

    app.post('/attachments/cde/add', function(req, res) {
        adminItemSvc.addAttachment(req, res, mongo_data);
    });

    app.post('/attachments/cde/remove', function(req, res) {
        adminItemSvc.removeAttachment(req, res, mongo_data);
    });
    
    app.post('/attachments/cde/setDefault', function(req, res) {
        adminItemSvc.setAttachmentDefault(req, res, mongo_data);
    });

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
           console.log(result);
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
            res.send(202, {error: {message: "Please login to see VSAC mapping."}});
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
              res.send();
            });
        } else {
            res.send(401, "Not Authorized");
        }
    });

    app.post('/mail/messages/update', function(req, res) {
        mongo_data.updateMessage(req.body, function(err) {
            if (err) {
                res.statusCode = 404;
                res.send("Error while updating the message");
            } else {
                res.send();
            }
        });
    });

    app.get('/mail/template/inbox', function(req, res) {
        res.render("inbox"); 
    });

    app.post('/mail/messages/:type', function(req, res) {
        mongo_data.getMessages(req, function(err, messages) {
            if (err) res.send(404, err);
            else res.send(messages);
        });
    });

    app.post('/retireCde', function (req, res) {
        req.params.type = "received";
        mongo_data.byId(req.body._id, function(err, cde) {
            if (err != "") res.send(404, err);
            if (!cde.registrationState.administrativeStatus === "Retire Candidate") return res.send(409, "CDE is not a Retire Candidate");
            cde.registrationState.registrationStatus = "Retired";
            delete cde.registrationState.administrativeStatus;
            cde.save(function() {
                res.send();
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
            res.send(401, "Not Authorized");
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
};
