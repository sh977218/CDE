import { forEach } from 'async';
import { PinningBoard } from '../server/board/boardDb';
import * as mongo_cde from '../server/cde/mongo-cde';
import * as mongo_form from '../server/form/mongo-form';
import { User } from '../server/user/userDb';

let count = 0;

PinningBoard.find({}).cursor().eachAsync(board => {
    console.log('boardId: ' + board.id);
    return new Promise((res, rej) => {
        let voidTinyIdList = [];
        forEach(board.pins, (p: any, doneP) => {
            let dao, tinyId, type;
            p.pinnedDate = new Date();
            if (p.deTinyId) {
                tinyId = p.deTinyId;
                type = 'cde';
                dao = mongo_cde;
            }
            if (p.formTinyId) {
                tinyId = p.formTinyId;
                type = 'form';
                dao = mongo_form;
            }
            p.tinyId = tinyId;
            p.type = type;
            dao.byTinyId(tinyId, (err, elt) => {
                if (err) {
                    console.log(err);
                    rej();
                } else if (!elt) {
                    voidTinyIdList.push(tinyId);
                    doneP();
                } else if (!elt.designations || !elt.designations[0] || !elt.designations[0].designation)
                    console.log('No elt found or no designations, type: ' + type + ' tinyId: ' + tinyId);
                else {
                    p.name = elt.designations[0].designation;
                    doneP();
                }
            });
        }, () => {
            if (voidTinyIdList.length > 0) {
                board.pins = board.pins.filter(p => voidTinyIdList.indexOf(p.tinyId) === -1)
            }
            if (board.owner && board.owner.username) {
                let username = board.owner.username;
                User.findOne({username: username}, (err, userObj) => {
                    if (err) {
                        console.log(err);
                        rej();
                    } else if (!userObj) throw "No user found " + username;
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
        });
    })
}).then(() => {
    console.log('total count: ' + count);
    process.exit(1);
});
