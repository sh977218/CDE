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
            dao: DataElement,
            incorrectMap: {}
        }, {
            name: 'de draft',
            count: 0,
            dao: DataElementDraft,
            incorrectMap: {}
        }, {
            name: 'form',
            count: 0,
            dao: Form,
            incorrectMap: {}
        }, {
            name: 'form draft',
            count: 0,
            dao: FormDraft,
            incorrectMap: {}
        }
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
                            if (!DAO.incorrectMap[originalCreatedBy]) DAO.incorrectMap[originalCreatedBy] = [];
                            else DAO.incorrectMap[originalCreatedBy].push(result._id);
                        }
                        if (temp.length > 2) {
                            let temp1 = result.info.map(o => o.createdBy);
                            console.log(result._id + ' has more than 2 createdBy.' + JSON.stringify(temp1));
                        }
                        resolve();
                    });
                }).then(err => {
                if (err) throw err;
                console.log("Finished " + DAO.name + " Count: " + DAO.count);
                console.log(JSON.stringify(DAO.incorrectMap));
            });
        }
    )
}

run();