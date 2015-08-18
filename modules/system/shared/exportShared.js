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

exports.projectCdeForExport = function (ele) {
    var cde = {
        name: ele.naming[0].designation
        , otherNames: ele.naming.slice(1).map(function (n) {
            return n.designation;
        }).filter(function (n) {
            return n;
        })
        , valueDomainType: ele.valueDomain.datatype
        , permissibleValues: ele.valueDomain.permissibleValues.map(function (pv) {
            return pv.permissibleValue;
        })
        , ids: ele.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "")
        })
        , stewardOrg: ele.stewardOrg.name
        , registrationStatus: ele.registrationState.registrationStatus
        , adminStatus: ele.registrationState.administrativeStatus
    };
    if (ele.classification) cde.usedBy = ele.classification.map(function (c) {
        return c.stewardOrg.name
    });
    return cde;
}

exports.convertToCsv = function (ele) {
    var sanitize = function (v) {
        return v.trim().replace(/\"/g, "\"\"");
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

exports.nocacheMiddleware = function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    if (next) {
        next();
    }
};

