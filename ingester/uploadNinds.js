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

//  for f in $(find ../nlm-seed/ExternalCDEs/caDSR/xml_cde_20151510354/  -name *.xml); do  node ingester/uploadCadsr.js $f ; done

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

var datatypeMapping = {
    CHARACTER: "Text"
    , NUMBER: "Float"
    , ALPHANUMERIC: "Text"
    , TIME: "Time"
    , DATE: "Date"
    , DATETIME: "Date/Time"
};

addDomain = function (cde, disease, subDisease, value) {
    value = value.trim();
    if (value != null && value.length > 0 && value != ("N/A.N/A")) {
        var valueArr = value.split(";");
        valueArr.forEach(function (val) {
            var cls = []
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
}

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
}

addSubDiseaseClassification = function (cde, disease, subDisease, value) {
    if (value.trim().length > 0) {
        var cls = [];
        cls.push("Disease");
        cls.push(disease);
        cls.push(subDisease);
        cls.push("Classification")
        cls = cls.concat(value);
        classificationShared.classifyItem(cde, "NINDS", cls);
        classificationShared.addCategory({elements: nindsOrg.classifications}, cls);
    }
}

parseCde = function (obj, cb) {
    var cde = {classification: []};
    cde["imported"] = new Date();
    cde["source"] = "NINDS";
    cde["version"] = obj["Version Number"];

    var namings = [];
    var naming = {};
    naming["designation"] = obj["Title"];
    naming["definition"] = obj["Description"];
    naming["languageCode"] = "EN-US";
    var context = {};
    context["contextName"] = "Health";
    context["acceptability"] = "preferred";
    naming["context"] = context;
    namings.push(naming);

    if (!(obj["Short Description"].toUpperCase().trim() === obj["Description"].toUpperCase().trim())) {
        var shortNaming = {};
        var shortContext = {};
        shortNaming["definition"] = obj["Short Description"];
        shortNaming["languageCode"] = "EN-US";
        shortContext["contextName"] = "Short";
        shortContext["acceptability"] = "preferred";
        shortNaming["context"] = shortContext;
        namings.push(shortNaming);
    }

    var stewardOrg = {};
    stewardOrg["name"] = "NINDS";
    cde["stewardOrg"] = stewardOrg;

    var registrationState = {};
    registrationState["registrationStatus"] = "Qualified";
    cde["registrationState"] = registrationState;

    var vd = {};
    var dataTypeStr = obj["Data Type"];
    var dataType = "";
    if (dataTypeStr.toLowerCase().trim() === "numeric values") {
        dataType = "Integer";
        var dataTypeInt = {};
        if (obj["minValue"] != null && obj["Minimum Value"].trim().length > 0) {
            dataTypeInt["minValue"] = obj["Minimum Value"].trim();
        }
        if (obj["maxValue"] != null && obj["Maximum Value"].trim().length > 0) {
            dataTypeInt["maxValue"] = obj["Maximum Value"].trim();
        }
        if (dataTypeInt == null) {
            dataTypeInt = {};
        }
        if (dataTypeInt != null) {
            vd["datatypeInteger"] = dataTypeInt;
        }
    } else if (dataTypeStr.toLowerCase().trim() === ("alphanumeric")) {
        dataType = "Text";
        var dataTypeText = {};
        if (obj["Size"] != null && obj["Size"] > 0) {
            dataTypeText["maxLength"] = obj["Size"];
        }
        if (dataTypeText == null) {
            dataTypeText = {};
        }
        if (dataTypeText != null) {
            vd["datatypeText"] = dataTypeText;
        }
    } else if (dataTypeStr.toLowerCase().trim() === "date or date & time") {
        dataType = "Date"
    }

    var inputType = obj["Input Restrictions"];
    var listDataType = {};
    if (inputType.toLowerCase().trim() === "single pre-defined value selected") {
        dataType = "Value List";
        listDataType["datatype"] = dataType;
    } else if (inputType.toLowerCase().trim() === "multiple pre-defined values selected") {
        dataType = "Value List";
        listDataType["datatype"] = dataType;
        listDataType["multi"] = true;
    }
    vd.datatypeValueList = listDataType;

    var permValues = [];
    if (dataType === "Value List") {
        var answers = obj["Permissible Values"].split(";");
        var descs = obj["Permissible Value Descriptions"].split(";");
        for (var i = 0; i < answers.length; i++) {
            var permValue = {};
            permValue["permissibleValue"] = answers[i];
            if (i < descs.length) {
                permValue["valueMeaningName"] = descs[i];
            } else {
                permValue["valueMeaningName"] = answers[i];
            }
            permValues.push(permValue);
        }
    }
    vd["permissibleValues"] = permValues;

    var uom = obj["Measurement Type"];
    if (uom != null && uom.trim().length > 0) {
        vd.uom = uom;
    }
    vd["datatype"] = dataType;


    var properties = [];
    var guidelines = obj["Guidelines/Instructions"];
    if (guidelines != null && guidelines.trim().length > 0) {
        var p = {};
        p["key"] = "NINDS Guidelines";
        p["value"] = guidelines.replace("-----", "-----<br/>");
        p["valueFormat"] = "html";
        properties.push(p);
    }
    var notes = obj["Notes"];
    if (notes != null && notes.trim().length > 0) {
        var p = {};
        p["key"] = "NINDS Notes";
        p["value"] = notes.replace("-----", "-----<br/>");
        p["valueFormat"] = "html";
        properties.push(p);
    }

    var suggestedQuestion = obj["Suggested Question Text"];
    if (suggestedQuestion != null && suggestedQuestion.trim().length > 0) {
        var p = {};
        p["key"] = "NINDS Suggested Question";
        p["value"] = suggestedQuestion.replace("-----", "-----<br/>");
        p["valueFormat"] = "html";
        properties.push(p);
    }

    var keywords = obj["Keywords"];
    if (keywords != null && keywords.trim().length > 0) {
        var p = {};
        p["key"] = "NINDS Keywords";
        p["value"] = keywords.replace("-----", "-----<br/>");
        p["valueFormat"] = "html";
        properties.push(p);
    }

    var references = obj["References"];
    if (references != null && references.trim().length > 0) {
        var p = {}
        p["key"] = "NINDS References";
        p["value"] = references.replace("-----", "-----<br/>");
        p["valueFormat"] = "html";
        properties.push(p);
    }


    var ids = [];
    var nindsId = {};
    nindsId["source"] = "NINDS";
    nindsId["id"] = obj["External ID.NINDS"];
    nindsId["version"] = obj["Version Number"];
    ids.push(nindsId);

    var variableName = {};
    variableName["source"] = "NINDS Variable Name";
    variableName["id"] = obj["Name"];
    ids.push(variableName);

    var cadsrId = obj["External ID.caDSR"];
    if (cadsrId != null && cadsrId.trim().length > 0) {
        var id = {};
        id["source"] = "caDSR";
        id["id"] = cadsrId;
        ids.push(id);
    }

    cde["naming"] = namings;
    cde["valueDomain"] = vd;
    cde["properties"] = properties;
    cde["ids"] = ids;

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

    addDomain(cde, "Traumatic Brain Injury", "Acute Hospitalized", obj["Domain.Acute Hospitalized"]);
    addDomain(cde, "Traumatic Brain Injury", "Concussion/Mild TBI", obj["Domain.Concussion/Mild TBI"]);
    addDomain(cde, "Traumatic Brain Injury", "Epidemiology", obj["Domain.Epidemiology"]);
    addDomain(cde, "Traumatic Brain Injury", "Moderate/Severe TBI: Rehabilitation", obj["Domain.Moderate/Severe TBI: Rehabilitation"]);

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
}

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
                    console.log("finished")
                    process.exit(0);
                })
            }

        });
    }
}, 2000);
