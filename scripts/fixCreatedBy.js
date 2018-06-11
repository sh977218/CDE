const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;
const DataElementDraft = require('../server/cde/mongo-cde').DataElementDraft;
const Form = require('../server/form/mongo-form').Form;
const FormDraft = require('../server/form/mongo-form').FormDraft;
const User = require('../server/user/').user;

function run() {
    let DAOs = [
        {
            name: 'de',
            count: 0,
            dao: DataElement
        }/*,
        {
            name: 'de draft',
            count: 0,
            dao: DataElementDraft
        },
        {
            name: 'form',
            count: 0,
            dao: Form
        }, {
            name: 'form draft',
            count: 0,
            dao: FormDraft
        }*/
    ];

    DAOs.forEach(DAO => {
            let aggregate = [
                {
                    $group: {
                        _id: '$tinyId',
                        info: {$push: {createdBy: '$createdBy.username', updated: '$updated', history: '$history'}},
                        count: {$sum: 1}
                    }
                }
            ];
            DAO.dao.aggregate(aggregate)
                .cursor({batchSize: 1000, useMongooseAggCursor: true})
                .exec()
                .eachAsync(result => {
                    return new Promise((resolve, reject) => {
                        result.info.sort((a, b) => a.history.length - b.history.length)
                        let temp = _.uniqWith(result.info, (a, b) => a.createdBy === b.createdBy);
                        if (temp.length > 1) {
                            console.log(DAO.name + ' tinyId: ' + result._id);
                            let originalCreatedBy = result.info[0].createdBy;
                            let lastestCreatedBy = result.info[result.info.length - 1].createdBy;
                            console.log('originalCreatedBy: ' + originalCreatedBy);
                            console.log('lastestCreatedBy: ' + lastestCreatedBy);
                            console.log('--------------------');
                        }
                        resolve();
                        /*elt.save(err => {
                            if (err) {
                                console.log(err);
                                console.log(elt.tinyId);
                                reject(err);
                            } else {
                                DAO.count++;
                                console.log(DAO.name + "Count: " + DAO.count);
                                resolve();
                            }
                        });*/
                    });
                }).then(err => {
                if (err) throw err;
                console.log("Finished " + DAO.name + " Count: " + DAO.count);
            });
        }
    )
}

run();