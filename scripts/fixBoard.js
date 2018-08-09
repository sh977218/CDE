const Board = require('../server/board/boardDb').PinningBoard;
const User = require('../server/user/userDb').User;

let count = 0;

exports.run = function () {
    Board.find({}, (error, boards) => {
        if (error) throw error;
        boards.forEach(board => {
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
                    if (err) throw err;
                    else if (!userObj) throw "No user found " + username;
                    else {
                        board.owner = {
                            userId: userObj._id,
                            username: userObj.username
                        }
                    }
                })
            }
            board.save(() => {
                count++;
                console.log('count: ' + count);
            })
        })
    })
};

exports.run();