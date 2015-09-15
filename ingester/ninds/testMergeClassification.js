var classificationShared = require('../../modules/system/shared/classificationShared.js');


var src = {
    "stewardOrg": {"name": "NINDS"},
    "naming": [{
        "designation": "10 Meter Timed Walk",
        "definition": "A feasible, reliable, valid and responsive test for measuring walking velocity over 10 meters in people with MS."
    }],
    "isCopyrighted": false,
    "referenceDocuments": [{
        "title": "Notice of Copyright",
        "uri": "https://commondataelements.ninds.nih.gov/Doc/NOC/10_meter_Timed_Walk_NOC_Public_Domain.pdf"
    }],
    "registrationState": {"registrationStatus": "Qualified"},
    "formElements": [],
    "classification": [{
        "stewardOrg": {"name": "NINDS"},
        "elements": [{
            "name": "Disease",
            "elements": [{
                "name": "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy",
                "elements": [{
                    "name": "Domain",
                    "elements": [{
                        "name": "Outcomes and End Points",
                        "elements": [{"name": "Functional Status", "elements": []}]
                    }]
                }]
            }]
        }, {
            "name": "Domain",
            "elements": [{
                "name": "Outcomes and End Points",
                "elements": [{"name": "Functional Status", "elements": []}]
            }]
        }]
    }]
}

var dest1 = {
    "_id": "55f8784a861bf310229ceed6",
    "tinyId": "m1BYen5ux",
    "created": "2015-09-15T19:58:02.883Z",
    "isCopyrighted": false,
    "__v": 0,
    "referenceDocuments": [{
        "title": "Notice of Copyright",
        "uri": "https://commondataelements.ninds.nih.gov/Doc/NOC/10_meter_Timed_Walk_NOC_Public_Domain.pdf"
    }],
    "displayProfiles": [],
    "classification": [{
        "elements": [{
            "name": "Disease",
            "elements": [{
                "name": "Congenital Muscular Dystrophy",
                "elements": [{
                    "name": "Domain",
                    "elements": [{
                        "name": "Outcomes and End Points",
                        "elements": [{"name": "Functional Status", "elements": []}]
                    }]
                }]
            }]
        }, {
            "name": "Domain",
            "elements": [{
                "name": "Outcomes and End Points",
                "elements": [{"name": "Functional Status", "elements": []}]
            }]
        }], "stewardOrg": {"name": "NINDS"}
    }],
    "formElements": [],
    "createdBy": {"username": "batchloader"},
    "history": [],
    "comments": [],
    "attachments": [],
    "ids": [],
    "properties": [],
    "registrationState": {"registrationStatus": "Qualified"},
    "stewardOrg": {"name": "NINDS"},
    "naming": [{
        "designation": "10 Meter Timed Walk",
        "definition": "A feasible, reliable, valid and responsive test for measuring walking velocity over 10 meters in people with MS."
    }]
}

classificationShared.transferClassifications(src, dest);