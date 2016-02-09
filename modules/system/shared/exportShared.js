if (typeof(exports) === "undefined") exports = {};

exports.exportHeader = {
    cdeHeader: "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n"
};

exports.projectFormForExport = function (ele) {
    var form = {
        name: ele.naming[0].designation
        , ids: ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "")
        })
        , stewardOrg: ele.stewardOrg.name
        , registrationStatus: ele.registrationState.registrationStatus
        , adminStatus: ele.registrationState.administrativeStatus
    };
    if (ele.classification) form.usedBy = ele.classification.map(function (c) {
        return c.stewardOrg.name
    });
    return form;
};

exports.projectCdeForExport = function (ele, settings) {
    var cde = {
        name: ele.naming[0].designationn
        valueDomainType: ele.valueDomain.datatype
    };

    if (settings.tableViewFields.cde.naming) {
        cde.otherNames = ele.naming.slice(1).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        });
    }

    if (settings.tableViewFields.cde.permissibleValues) {
        permissibleValues = ele.valueDomain.permissibleValues.slice(0, 50).map(function (pv) {
            return pv.permissibleValue;
        })
    }

    if (settings.tableViewFields.cde.nbOfPVs) {
        
    }

    if (settings.tableViewFields.cde.permissibleValues) {
        ids: ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "")
        })

    }
        , stewardOrg: ele.stewardOrg.name
        , registrationStatus: ele.registrationState.registrationStatus
        , adminStatus: ele.registrationState.administrativeStatus
    };
    if (ele.classification) cde.usedBy = ele.classification.map(function (c) {
        return c.stewardOrg.name
    });
    return cde;
};

exports.convertToCsv = function (ele) {
    var sanitize = function (v) {
        return v.trim?v.trim().replace(/\"/g, "\"\""):v;
    };
    var row = "";
    Object.keys(ele).forEach(function (key) {
        row += "\"";
        var value = ele[key];
        if (Array.isArray(value)) {
            row += value.map(function (value) {
                return sanitize(value);
            }).join("; ");
        } else if (value) {
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

