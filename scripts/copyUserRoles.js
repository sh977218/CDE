const _ = require('lodash');
const User = require('../server/system/mongo-data').User;
const authorizationShared = require('../shared/system/authorizationShared');

function run() {
    let DAOs = [
        {
            name: 'user',
            count: 0,
            dao: User
        }
    ];

    DAOs.forEach(DAO => {
        let cursor = DAO.dao.find({}).cursor();
        cursor.eachAsync(doc => {
            return new Promise((resolve, reject) => {
                doc.roles.forEach(r => {
                    let roleBit = 1 << authorizationShared.ROLE_BIT_MAP[r];
                    doc.rolesBackup = doc.rolesBackup | roleBit;
                })

                doc.save(err => {
                    if (err) {
                        console.log(err);
                        console.log(doc.tinyId);
                        reject(err);
                    } else {
                        DAO.count++;
                        console.log(DAO.name + "Count: " + DAO.count);
                        resolve();
                    }
                });
            });
        }).then(err => {
            if (err) throw err;
            console.log("Finished " + DAO.name + " Count: " + DAO.count);
        });
    })
}

run();