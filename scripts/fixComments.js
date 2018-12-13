const _ = require('lodash');
const Form = require('../server/form/mongo-form').Form;
const Comment = require('../server/discuss/discussDb').Comment;


let map = {
    'Qy_xY56Iw8': 'XyNzh5N2cEQ',
    '71g5Oi6IP8': 'Q1gjvwh9E7',
    '71gotsp8PU': 'X1QaPv3cVm',
    'mJSpRAa8PI': 'XkUgJazT2oe',
    '7JBlxCIw8': 'QJgXaGanse'
};

function runComment() {
    Comment.aggregate([
        {
            $match: {
                'element.eltType': 'form'
            },
        },
        {
            $lookup: {
                from: 'forms',
                localField: 'element.eltId',
                foreignField: "tinyId",
                as: 'form'
            }
        },
        {
            $match: {
                'form.0': {$exists: false}
            }
        },
        {
            $project: {'element.eltId': 1}
        }
    ]).exec(async function (err, docs) {
        let tinyIdList = docs.map(d => d.element.eltId);
        let _tinyIdList = _.uniq(tinyIdList);
        for (let wrongTinyId of _tinyIdList) {
            let rightTinyId = map[wrongTinyId];
            if (!rightTinyId) {
                console.log(wrongTinyId);
                process.exit(1);
            }
            let num_updated = await Comment.update({
                'element.eltType': 'form',
                'element.eltId': wrongTinyId
            }, {
                'element': {
                    'eltType': 'form',
                    'eltId': rightTinyId
                }
            }, {multi: true});
            console.log(num_updated.nModified + ' ' + wrongTinyId + ' updated to ' + rightTinyId);
        }
    })
}

runComment();
