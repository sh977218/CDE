var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require('async')
    , xml2js = require('xml2js')
    , ninds = require('./ninds')
    , Readable = require('stream').Readable;


var nindsInput = process.argv[2];
if (!nindsInput) {
    console.log("missing nindsInput arg");
    process.exit(1);
}

var nindsOrg = null;

setTimeout(function () {
    mongo_data_system.orgByName("NINDS", function (stewardOrg) {
        nindsOrg = stewardOrg;
    });
}, 1000);

addDomain = function (cde, disease, subDisease, value) {
    value = value.trim();
    if (value.length > 0 && value != ("N/A.N/A")) {
        var valueArr = value.split(";");
        valueArr.forEach(function (val) {
            val = val.trim();
            var cls = [];
            cls.push("Domain");
            cls = cls.concat(val.split("."));
            classificationShared.classifyItem(cde, "NINDS", cls);
            classificationShared.addCategory({elements: nindsOrg.classifications}, cls);

            cls = [];
            cls.push("Disease");
            cls.push(disease);
            if (subDisease.length > 0)
                cls.push(subDisease);

            cls.push("Domain");
            cls = cls.concat(val.split("."));
            classificationShared.classifyItem(cde, "NINDS", cls);
            classificationShared.addCategory({elements: nindsOrg.classifications}, cls);
        });
    }
};

addClassification = function (cde, disease, value) {
    value = value.trim();
    if (value.length > 0) {
        var cls = [];
        cls.push("Disease");
        cls.push(disease);
        cls.push("Classification");
        cls = cls.concat(value);
        classificationShared.classifyItem(cde, "NINDS", cls);
        classificationShared.addCategory({elements: nindsOrg.classifications}, cls);
    }
};

addSubDiseaseClassification = function (cde, disease, subDisease, value) {
    value = value.trim();
    if (value.length > 0) {
        var cls = [];
        cls.push("Disease");
        cls.push(disease);
        cls.push(subDisease);
        cls.push("Classification");
        cls = cls.concat(value);
        classificationShared.classifyItem(cde, "NINDS", cls);
        classificationShared.addCategory({elements: nindsOrg.classifications}, cls);
    }
};

var stripBreakline = function (input) {
    return input.replace(/-----/g, "").replace(/\n/g, "<br/>");
};

parseCde = function (obj, cb) {
    var cde = {classification: []};
    cde.imported = new Date();
    cde.source = "NINDS";
    cde.version = obj["Version Number"];

    var namings = [{
        designation: obj["Title"].trim()
        , definition: obj["Description"].trim()
        , languageCode: "EN-US"
        , context: {
            contextName: "Health"
            , acceptability: "preferred"
        }
    }];

    if (!(obj["Short Description"].toUpperCase().trim() === obj["Description"].toUpperCase().trim())) {
        namings.push({
            designation: obj["Title"].trim()
            , definition: obj["Short Description"].trim()
            , languageCode: "EN-US"
            , context: {
                contextName: "Short Description"
                , acceptability: "preferred"
            }
        })
    }

    cde.stewardOrg = {name: "NINDS"};

    cde.registrationState = {registrationStatus: "Qualified"};

    var vd = {};
    var dataTypeStr = obj["Data Type"].trim();
    var dataType = "";
    if (dataTypeStr.toLowerCase() === "numeric values") {
        dataType = "Number";
        var dataTypeNum = {};
        if (obj["Minimum Value"] > 0) {
            dataTypeNum.minValue = obj["Minimum Value"];
        }
        if (obj["Maximum Value"] > 0) {
            dataTypeNum.maxValue = obj["Maximum Value"];
        }
        vd.datatypeNumber = dataTypeNum;
    } else if (dataTypeStr.toLowerCase() === "alphanumeric") {
        dataType = "Text";
        var dataTypeText = {};
        if (obj["Size"] > 0) {
            dataTypeText.maxLength = obj["Size"];
        }
        vd.datatypeText = dataTypeText;
    } else if (dataTypeStr.toLowerCase().trim() === "date or date & time") {
        dataType = "Date"
    }

    var inputType = obj["Input Restrictions"];
    var listDataType = {};
    if (inputType.toLowerCase().trim() === "single pre-defined value selected") {
        listDataType.datatype = "Value List";
    } else if (inputType.toLowerCase().trim() === "multiple pre-defined values selected") {
        listDataType.datatype = "Value List";
        listDataType.multi = true;
    }
    vd.datatypeValueList = listDataType;

    var permValues = [];
    if (dataType === "Value List") {
        var answers = obj["Permissible Values"].split(";");
        var descs = obj["Permissible Value Descriptions"].split(";");
        for (var i = 0; i < answers.length; i++) {
            var permValue = {};
            permValue.permissibleValue = answers[i];
            if (i < descs.length) {
                permValue.valueMeaningName = descs[i];
            } else {
                permValue.valueMeaningName = answers[i];
            }
            permValues.push(permValue);
        }
    }
    vd.permissibleValues = permValues;

    var uom = obj["Measurement Type"].trim();
    if (uom.length > 0) {
        vd.uom = uom;
    }
    vd.datatype = dataType;

    var properties = [];
    var guidelines = obj["Guidelines/Instructions"].trim();
    if (guidelines.length > 0) {
        properties.push({
            key: "NINDS Guidelines"
            , value: stripBreakline(guidelines)
            , valueFormat: "html"
        });
    }
    var notes = obj["Notes"].trim();
    if (notes.length > 0) {
        properties.push({
            key: "NINDS Notes"
            , value: stripBreakline(notes)
            , valueFormat: "html"
        });
    }

    var suggestedQuestion = obj["Suggested Question Text"].trim();
    if (suggestedQuestion.length > 0) {
        properties.push({
            key: "NINDS Suggested Question"
            , value: stripBreakline(suggestedQuestion)
            , valueFormat: "html"
        });
    }

    var previousTitle = obj["Previous Title"].trim();
    if (previousTitle.length > 0) {
        properties.push({
            key: "NINDS Previous Title"
            , value: previousTitle
        });
    }

    var keywords = obj["Keywords"].trim();
    if (keywords.length > 0) {
        properties.push({
            key: "NINDS Keywords"
            , value: stripBreakline(keywords)
            , valueFormat: "html"
        });
    }

    var references = obj["References"].trim();
    if (references.length > 0) {
        properties.push({
            key: "NINDS References"
            , value: stripBreakline(references)
            , valueFormat: "html"
        });
    }

    var ids = [];
    ids.push({
        source: "NINDS"
        , id: obj["External ID.NINDS"].trim()
        , version: obj["Version Number"]
    });

    ids.push({
        source: "NINDS Variable Name"
        , id: obj["Name"].trim()
    });

    var cadsrId = obj["External ID.caDSR"].trim();
    if (cadsrId.length > 0) {
        ids.push({
            source: "caDSR"
            , id: cadsrId
        });
    }

    cde.naming = namings;
    cde.valueDomain = vd;
    cde.properties = properties;
    cde.ids = ids;

    var populations = obj["Population.All"].split(";");
    populations.forEach(function (pop) {
        classificationShared.classifyItem(cde, "NINDS", ['Population', pop.trim()]);
        classificationShared.addCategory({elements: nindsOrg.classifications}, ["Population", pop.trim()]);
    });

    addDomain(cde, "General (For all diseases)", "", obj["Domain.General (For all diseases)"]);
    addDomain(cde, "Traumatic Brain Injury", "", obj["Domain.Traumatic Brain Injury"]);
    addDomain(cde, "Parkinson's Disease", "", obj["Domain.Parkinson's Disease"]);
    addDomain(cde, "Friedreich's Ataxia", "", obj["Domain.Friedreich's Ataxia"]);
    addDomain(cde, "Stroke", "", obj["Domain.Stroke"]);
    addDomain(cde, "Amyotrophic Lateral Sclerosis", "", obj["Domain.Amyotrophic Lateral Sclerosis"]);
    addDomain(cde, "Huntington's Disease", "", obj["Domain.Huntington's Disease"]);
    addDomain(cde, "Multiple Sclerosis", "", obj["Domain.Multiple Sclerosis"]);
    addDomain(cde, "Neuromuscular Disease", "", obj["Domain.Neuromuscular Disease"]);
    addDomain(cde, "Myasthenia Gravis", "", obj["Domain.Myasthenia Gravis"]);
    addDomain(cde, "Spinal Muscular Atrophy", "", obj["Domain.Spinal Muscular Atrophy"]);
    addDomain(cde, "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "", obj["Domain.Duchenne Muscular Dystrophy/Becker Muscular Dystrophy"]);
    addDomain(cde, "Congenital Muscular Dystrophy", "", obj["Domain.Congenital Muscular Dystrophy"]);
    addDomain(cde, "Spinal Cord Injury", "", obj["Domain.Spinal Cord Injury"]);
    addDomain(cde, "Headache", "", obj["Domain.Headache"]);
    addDomain(cde, "Epilepsy", "", obj["Domain.Epilepsy"]);
    addDomain(cde, "Mitochondrial Disease", "", obj["Domain.Mitochondrial Disease"]);
    addDomain(cde, "Facioscapulohumeral muscular dystrophy", "", obj["Domain.Facioscapulohumeral muscular dystrophy"]);
    addDomain(cde, "Myotonic Dystrophy", "", obj["Domain.Myotonic Dystrophy"]);

    addClassification(cde, "General (For all diseases)", obj["Classification.General (For all diseases)"]);
    addClassification(cde, "Parkinson's Disease", obj["Classification.Parkinson's Disease"]);
    addClassification(cde, "Friedreich's Ataxia", obj["Classification.Friedreich's Ataxia"]);
    addClassification(cde, "Stroke", obj["Classification.Stroke"]);
    addClassification(cde, "Amyotrophic Lateral Sclerosis", obj["Classification.Amyotrophic Lateral Sclerosis"]);
    addClassification(cde, "Huntington's Disease", obj["Classification.Huntington's Disease"]);
    addClassification(cde, "Multiple Sclerosis", obj["Classification.Multiple Sclerosis"]);
    addClassification(cde, "Neuromuscular Disease", obj["Classification.Neuromuscular Disease"]);
    addClassification(cde, "Myasthenia Gravis", obj["Classification.Myasthenia Gravis"]);
    addClassification(cde, "Spinal Muscular Atrophy", obj["Classification.Spinal Muscular Atrophy"]);
    addClassification(cde, "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", obj["Classification.Duchenne Muscular Dystrophy/Becker Muscular Dystrophy"]);
    addClassification(cde, "Congenital Muscular Dystrophy", obj["Classification.Congenital Muscular Dystrophy"]);
    addClassification(cde, "Spinal Cord Injury", obj["Classification.Spinal Cord Injury"]);
    addClassification(cde, "Headache", obj["Classification.Headache"]);
    addClassification(cde, "Epilepsy", obj["Classification.Epilepsy"]);
    addClassification(cde, "Myotonic Dystrophy", obj["Classification.Myotonic Dystrophy"]);
    addClassification(cde, "Facioscapulohumeral muscular dystrophy", obj["Classification.Facioscapulohumeral muscular dystrophy"]);
    addClassification(cde, "Mitochondrial Disease", obj["Classification.Mitochondrial Disease"]);

    addSubDiseaseClassification(cde, "Traumatic Brain Injury", "Acute Hospitalized", obj["Classification.Acute Hospitalized"]);
    addSubDiseaseClassification(cde, "Traumatic Brain Injury", "Acute Hospitalized", obj["Classification.Concussion/Mild TBI"]);
    addSubDiseaseClassification(cde, "Traumatic Brain Injury", "Acute Hospitalized", obj["Classification.Epidemiology"]);
    addSubDiseaseClassification(cde, "Traumatic Brain Injury", "Acute Hospitalized", obj["Classification.Moderate/Severe TBI: Rehabilitation"]);


    mongo_cde.create(cde, {username: 'batchloader'}, function (err, newCde) {
        if (err) {
            console.log("unable to create CDE. " + JSON.stringify(cde));
            console.log(err);
            process.exit(1);
        } else {
            cb();
            console.log("saved");
        }
    });
};

setTimeout(function () {
    if (ninds.length > 0) {
        async.forEach(ninds, function (thisNinds, cb) {
            parseCde(thisNinds, cb);
        }, function (err) {
            if (err)
                console.log(err);
            else {
                nindsOrg.save(function (err) {
                    if (err) console.log(err);
                    console.log("finished");
                    process.exit(0);
                })
            }

        });
    }
}, 2000);
