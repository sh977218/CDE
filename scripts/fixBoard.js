const async = require('async');
const Board = require('../server/board/boardDb').PinningBoard;
const User = require('../server/user/userDb').User;

let count = 0;

fetchDeName = function (tinyId) {

};

exports.run = function () {
    Board.find({}).cursor().eachAsync(board => {
        console.log('boardId: ' + board.id);
        return new Promise((res, rej) => {
            board.pins.forEach(p => {
                p.type = 'cde';
                p.tinyId = p.deTinyId;
                p.name = p.deName;
                if (p.formTinyId) {
                    p.type = 'form';
                    p.tinyId = p.formTinyId;
                    p.name = p.formName;
                }
            });
            if (board.owner && board.owner.username) {
                let username = board.owner.username;
                User.findOne({username: username}, (err, userObj) => {
                    if (err) {
                        console.log(err);
                        rej();
                    }
                    else if (!userObj) throw "No user found " + username;
                    else {
                        board.owner = {
                            userId: userObj._id,
                            username: userObj.username
                        };
                        board.save(err => {
                            if (err) {
                                console.log(err);
                                rej();
                            }
                            count++;
                            console.log('count: ' + count);
                            res();
                        })
                    }
                })
            } else {
                console.log("board: " + board.name + " do not have owner.");
                rej();
            }
        })
    });

};

exports.run();