var cdesvc = require('./cdesvc')
  , boardsvc = require('./boardsvc')
  , usersvc = require('./usersvc')
  , mongo_data = require('./mongo-data')
  , mongo_data_system = require('../../system/node-js/mongo-data') //TODO: REMOVE DEPENDENCY
  , classificationNode = require('./classificationNode')
  , xml2js = require('xml2js')
  , vsac = require('./vsac-io')
  , config = require('config')
  , elastic = require('./elastic')
  , auth = require( './authentication' )
  , helper = require('./helper.js')
  , logging = require('./logging.js')
  , classificationShared = require('../shared/classificationShared.js')
  , path = require('path')
  , express = require('express')
;
exports.init = function(app) {
    app.set('views', path.join(__dirname, '../views'));

    app.use("/cde/public", express.static(path.join(__dirname, '../public')));
    app.use("/cde/shared", express.static(path.join(__dirname, '../shared')));

    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/home', function(req, res) {
        res.render('home');
    });

    app.get('/quickBoard', function(req, res) {
      res.render('quickBoard');
    });

    app.get('/exportCdeSearch', function(req, res) {
      res.render('cdeExport');
    });

    app.get('/list', function(req, res){
      res.render('list');
    });

    app.get('/boardList', function(req, res){
      res.render('boardList');
    });

    app.get('/deCompare', function(req, res){
      res.render('deCompare');
    });

    app.get('/listboards', function(req, res) {
       boardsvc.boardList(req, res); 
    });

    app.get('/signup', function(req, res){
      res.render('signup');
    });

    function checkCdeOwnership(deId, req, cb) {
        this.userSessionExists = function(req) {
            return req.user;
        };
        this.isCuratorOrAdmin = function(req, de) {
            return (req.user.orgAdmin && req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                   || (req.user.orgCurator && req.user.orgCurator.indexOf(de.stewardOrg.name) < 0);
        };
        var authorization = this;
        if (req.isAuthenticated()) {
            mongo_data.cdeById(deId, function (err, de) {
                if (err) {
                    return cb("Data Element does not exist.", null);
                }
                if (!authorization.userSessionExists(req)
                   || !authorization.isCuratorOrAdmin(req, de)
                   ) {
                    return cb("You do not own this data element.", null);
                } else {
                    cb(null, de);
                }
            });
        } else {
            return cb("You are not authorized.", null);                   
        }
    }
    app.get('/createcde', function(req, res) {
       res.render('createcde'); 
    });

    app.get('/cdereview', function(req, res) {
        res.render('cdereview');
    });

    app.get('/siteaccountmanagement', function(req, res) {
        var ip = req.ip;
        if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
            res.render('siteaccountmanagement');
        } else {
            res.send(403, "Not Authorized");
        }
    });


    app.get('/orgaccountmanagement', function(req, res) {
        res.render('orgAccountManagement');
    });

    app.get('/classificationmanagement', function(req, res) {
        res.render('classificationManagement');
    });

    app.get('/deview', function(req, res) {
        res.render("deview");
    });

    app.get('/login', function(req, res) {
       res.render('login', { user: req.user, message: req.flash('error') });
    });

    app.get('/profile', function(req, res) {
       res.render("profile"); 
    });

    app.get('/myboards', function(req, res) {
       res.render("myBoards"); 
    });

    app.post('/cdesByUuidList', function(req, res) {
        mongo_data.cdesByUuidList(req.body, function(err, cdes) {
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


    app.delete('/classification/org', function(req, res) {
        if (!usersvc.isCuratorOf(req.user, req.query.orgName)) {
            res.send(403);
            return;
        }  
        classificationNode.modifyOrgClassification(req.query, classificationShared.actions.delete, function(err, org) {
            res.send(org);
        });
    });

    app.post('/classification/org', function(req, res) {
        if (!usersvc.isCuratorOf(req.user, req.body.orgName)) {
            res.send(403);
            return;
        }      
        classificationNode.addOrgClassification(req.body, function(err, org) {
            res.send(org);
        });
    });

    app.delete('/classification/cde', function(req, res) {
        if (!usersvc.isCuratorOf(req.user, req.query.orgName)) {
            res.send(403, "Not Authorized");
            return;
        }  
        classificationNode.cdeClassification(req.query, classificationShared.actions.delete, function(err) {
            if (!err) { 
                res.send(); 
            } else {
                res.send(202, {error: {message: "Classification does not exists."}});
            }
        });
    });

    app.post('/classification/rename', function(req, res) {
        if (!usersvc.isCuratorOf(req.user, req.body.orgName)) {
            res.send(403, "Not Authorized");
            return;
        }      
        classificationNode.modifyOrgClassification(req.body, classificationShared.actions.rename, function(err, org) {
            if (!err) res.send(org);
            else res.send(202, {error: {message: "Classification does not exists."}});
        });
    });

    app.post('/classification/cde', function(req, res) {
        if (!usersvc.isCuratorOf(req.user, req.body.orgName)) {
            res.send(403, "Not Authorized");
            return;
        }      
        classificationNode.cdeClassification(req.body, classificationShared.actions.create, function(err) {
            if (!err) { 
                res.send({ code: 200, msg: "Classification Added"}); 
            } else {
                res.send({ code: 403, msg: "Classification Already Exists"}); 
            }

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
            mongo_data.cdeById(req.body.deId, function (err, de) {
                if (err) {
                    res.send("Data Element does not exist.");
                }
                for (var c in de.comments) {
                    var comment = de.comments[c];
                    if (comment._id == req.body.commentId) {
                        if( req.user._id == comment.user || 
                            (req.user.orgAdmin.indexOf(de.stewardOrg.name) > -1) ||
                            req.user.siteAdmin
                        ) {
                            de.comments.splice(c, 1);
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
                }
            });
        } else {
            res.send("You are not authorized.");                   
        }
    });

    app.get('/priorcdes/:id', function(req, res) {
        cdesvc.priorCdes(req, res);
    });

    app.get('/dataelement/:id/:type?', function(req, res) {
        cdesvc.show(req, function(result) {
            res.send(cdesvc.hideProprietaryPvs(result, req.user));
        });
    });

    app.get('/debyuuid/:uuid/:version', function(req, res) {
        mongo_data.deByUuidAndVersion(req.params.uuid, req.params.version, function(err, de) {
            res.send(cdesvc.hideProprietaryPvs(de, req.user));
        });
    });

    app.post('/dataelement', function (req, res) {
        return cdesvc.save(req, res);
    });

    app.get('/user/me', function(req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            mongo_data_system.userById(req.user._id, function(err, user) {
                res.send(user);
            });
        }
    });

    app.get('/viewingHistory/:start', function(req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            var splicedArray = splicedArray = req.user.viewHistory.splice(req.params.start, 10);
            var idList = [];
            for (var i = 0; i < splicedArray.length; i++) {
                idList.push(splicedArray[i]);
            }
            mongo_data.cdesByIdList(idList, function(err, cdes) {
                res.send(cdesvc.hideProprietaryPvs(cdes, req.user));
            });
        }
    });

    app.get('/boards/:userId', function(req, res) {
        mongo_data.boardsByUserId(req.params.userId, function(result) {
            res.send(result);
        });
    });

    app.get('/deBoards/:uuid', function(req, res) {
       mongo_data.publicBoardsByDeUuid(req.params.uuid, function (result) {
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
                idList.push(pins[i].deUuid);
            }
            mongo_data.cdesByUuidList(idList, function(err, cdes) {
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

    app.put('/pincde/:uuid/:boardId', function(req, res) {
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

    app.post('/elasticSearch', function(req, res) {
       return elastic.elasticsearch(req.body.query, function(result) {
           result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
           res.send(result);
       }); 
    });

    app.post('/addAttachmentToCde', function(req, res) {
        checkCdeOwnership(req.body.de_id, req, function(err, de) {
            if (err) return res.send(err);
            mongo_data.userTotalSpace(req.user.username, function(totalSpace) {
                if (totalSpace > req.user.quota) {
                    res.send({message: "You have exceeded your quota"});
                } else {
                    mongo_data.addCdeAttachment(req.files.uploadedFiles, req.user, "some comment", de, function() {
                        res.send(de);            
                     });                                            
                }
            });
        });
    });

    app.post('/classification/cde/moveclassif', function(req, res) {
        classificationNode.moveClassifications(req, function(err, cde) {
           if(!err) res.send(cde);
        });
    });

    app.get('/orgNames', function(req, res) {
       mongo_data.orgNames(function (err, names) {
           res.send(names);
       }) 
    });
    
    app.post('/removeAttachment', function(req, res) {
        checkCdeOwnership(req.body.deId, req, function(err, de) {
            if (err) return res.send(err);  
            de.attachments.splice(index, 1);
            de.save(function (err) {
               if (err) {
                   res.send("error: " + err);
               } else {
                   res.send(de);
               }
            });
        });
    });

    app.post('/setAttachmentDefault', function(req, res) {
        checkCdeOwnership(req.body.deId, req, function(err, de) {
            if (err) {
                logging.expressLogger.info(err);
                return res.send(err);
            }  
            var state = req.body.state;
            for (var i = 0; i < de.attachments.length; i++) {
                de.attachments[i].isDefault = false;
            }
            de.attachments[req.body.index].isDefault = state;
            de.save(function (err) {
               if (err) {
                   res.send("error: " + err);
               } else {
                   res.send(de);
               }
            });
        });
    });

    app.get('/userTotalSpace/:uname', function(req, res) {
       return mongo_data.userTotalSpace(req.params.uname, function(space) {
           return res.send({username: req.params.uname, totalSize: space});
       });
    });


    app.get('/data/:imgtag', function(req, res) {
      mongo_data.getFile( function(error,data) {
         res.writeHead('200', {'Content-Type': 'image/png'});
         res.end(data,'binary');
      }, res, req.params.imgtag );
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
        mongo_data.createMessage(req.body, function() {
            res.send();
        });    
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
        mongo_data.cdeById(req.body._id, function(err, cde) {
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
    
};
