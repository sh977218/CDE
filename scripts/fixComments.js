const Form = require('../server/form/mongo-form').Form;
const Comment = require('../server/discuss/discussDb').Comment;


let map={

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
        }
    ]).exec(function (err, elts) {
        console.log(elts);
    })
}

runComment();
