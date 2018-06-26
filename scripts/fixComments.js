const _ = require('lodash');
const Comment = require('../server/system/mongo-data').Comment;
const User = require('../server/user/index').user;

let count = 0;

function run() {
    /*
    @TODO run this in robo mongo
        Comment.remove({status: 'delete'});
    */
    Comment.find({}, (error, results) => {
        if (error) throw error;
        else {
            results.forEach(result => {
                result.replies = result.replies.filter(r => r.status !== 'delete');
                result.replies.forEach(r => {
                    User.findOne({username: r.username}, (err, userObj) => {
                        if (err) throw err;
                        else if (!userObj) throw "No user found" + result.username;
                        else {
                            r.user = {
                                userId: userObj._id,
                                username: userObj.username
                            }
                        }
                    })

                })
                User.findOne({username: result.username}, (err, userObj) => {
                    if (err) throw err;
                    else if (!userObj) throw "No user found" + result.username;
                    else {
                        result.user = {
                            userId: userObj._id,
                            username: userObj.username
                        }
                        result.save((e, o) => {
                            if (e) throw e;
                            else {
                                count++;
                                console.log('counter: ' + count);
                            }
                        })
                    }
                })
            })
        }
    })

}

run();