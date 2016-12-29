if (typeof(exports) === "undefined") exports = {};

exports.exportHeader = {
    cdeHeader: "Name, Question Texts, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n",
    redCapHeader: 'Variable / Field Name,Form Name,Section Header,Field Type,Field Label,"Choices, Calculations, OR Slider Labels",Field Note,Text Validation Type OR Show Slider Number,Text Validation Min,Text Validation Max,Identifier?,Branching Logic (Show field only if...),Required Field?,Custom Alignment,Question Number (surveys only),Matrix Group Name,Matrix Ranking?,Field Annotation\n'
};


exports.getCdeCsvHeader = function (settings) {
    var cdeHeader = "Name";

    if (settings.questionTexts) {
        cdeHeader += ", Question Texts";
    }
    if (settings.naming) {
        cdeHeader += ", Other Names";
    }
    if (settings.permissibleValues) {
        cdeHeader += ", Value Type";
        cdeHeader += ", Permissible Values";
    }
    if (settings.nbOfPVs) {
        cdeHeader += ", Nb of Permissible Values";
    }
    if (settings.uom) {
        cdeHeader += ", Unit of Measure";
    }
    if (settings.stewardOrg) {
        cdeHeader += ", Steward";
    }
    if (settings.usedBy) {
        cdeHeader += ", Used By";
    }
    if (settings.registrationStatus) {
        cdeHeader += ", Registration Status";
    }
    if (settings.administrativeStatus) {
        cdeHeader += ", Administrative Status";
    }
    if (settings.ids) {
        cdeHeader += ", Identifiers";
    }
    if (settings.source) {
        cdeHeader += ", Source";
    }
    if (settings.updated) {
        cdeHeader += ", Updated";
    }
    if (settings.tinyId) {
        cdeHeader += ", NLM ID";
    }
    cdeHeader += "\n";
    return cdeHeader;
};

exports.projectFormForExport = function (ele) {
    var form = {
        name: ele.naming[0].designation
        , ids: ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "");
        })
        , stewardOrg: ele.stewardOrg.name
        , registrationStatus: ele.registrationState.registrationStatus
        , adminStatus: ele.registrationState.administrativeStatus
    };
    if (ele.classification) form.usedBy = ele.classification.map(function (c) {
        return c.stewardOrg.name;
    });
    return form;
};

exports.projectCdeForExport = function (ele, settings) {
    var cde = {
        name: ele.naming[0].designation
    };
    if (settings.questionTexts) {
        cde.otherNames = ele.naming.filter(function (n) {
            return n.context && n.context.contextName &&
                n.context.contextName.indexOf("Question Text", n.context.contextName.length - "Question Text".length) !== -1;
        }).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        });
    }
    if (settings.naming) {
        cde.otherNames = ele.naming.slice(1).filter(function (n) {
            return n.context && n.context.contextName &&
                n.context.contextName.indexOf("Question Text", n.context.contextName.length - "Question Text".length) === -1;
        }).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        });
    }
    if (settings.permissibleValues) {
        cde.valueDomainType = ele.valueDomain.datatype;
        cde.permissibleValues = ele.valueDomain.permissibleValues.slice(0, 50).map(function (pv) {
            return pv.permissibleValue;
        });
    }
    if (settings.nbOfPVs) {
        if (ele.valueDomain.permissibleValues)
            cde.nbOfPVs = ele.valueDomain.permissibleValues.length | 0;  // jshint ignore:line
    }
    if (settings.uom) {
        cde.uom = ele.valueDomain.uom;
    }
    if (settings.stewardOrg) {
        cde.stewardOrg = ele.stewardOrg.name;
    }
    if (settings.usedBy) {
        if (ele.classification) cde.usedBy = ele.classification.map(function (c) {
            return c.stewardOrg.name;
        });
    }
    if (settings.registrationStatus) {
        cde.registrationStatus = ele.registrationState.registrationStatus;
    }
    if (settings.administrativeStatus) {
        cde.administrativeStatus = ele.registrationState.administrativeStatus;
    }
    if (settings.ids) {
        cde.ids = ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "");
        });
    }
    if (settings.source) {
        cde.source = ele.source;
    }
    if (settings.updated) {
        cde.updated = ele.updated;
    }
    if (settings.tinyId) {
        cde.tinyId = ele.tinyId;
    }

    return cde;
};

exports.convertToCsv = function (ele) {
    var sanitize = function (v) {
        return v.trim ? v.trim().replace(/\"/g, "\"\"") : v;
    };
    var row = "";
    Object.keys(ele).forEach(function (key) {
        row += "\"";
        var value = ele[key];
        if (Array.isArray(value)) {
            row += value.map(function (value) {
                return sanitize(value);
            }).join("; ");
        } else if (value !== undefined) {
            row += sanitize(value);
        }
        row += "\",";
    });
    return row + "\n";
};

exports.stripBsonIds = function (elt) {
    delete elt._id;
    delete elt.updated;
    delete elt.history;
    if (elt.updatedBy) delete elt.updatedBy.userId;
    return elt;
};

exports.nocacheMiddleware = function (req, res, next) {
    if (req && req.headers['user-agent']) {
        if (req.headers['user-agent'].indexOf("Chrome") < 0 || req.headers['user-agent'].indexOf("Firefox") < 0) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
    }
    if (next) {
        next();
    }
};

