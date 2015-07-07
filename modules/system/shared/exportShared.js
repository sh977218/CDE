/**
 * Created by huangs8 on 7/7/2015.
 */

if (typeof(exports) === "undefined") exports = {};

exports.exportHeader = {
    cdeHeader: "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n"
};

exports.formatExportForm = function (elasticCde) {
    var cde = {
        name: elasticCde.naming[0].designation
        , ids: elasticCde.ids.map(function (id) {
            return id.source + ": " + id.id + (id.version ? " v" + id.version : "")
        })
        , stewardOrg: elasticCde.stewardOrg.name
        , registrationStatus: elasticCde.registrationState.registrationStatus
        , adminStatus: elasticCde.registrationState.administrativeStatus
    };
    if (elasticCde.classification) cde.usedBy = elasticCde.classification.map(function (c) {
        return c.stewardOrg.name
    });
    return cde;
};

exports.formatExportCde = function (ele) {
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

exports.convertToCsv = function (cde) {
    var sanitize = function (v) {
        return v.trim().replace(/\"/g, "\"\"");
    };
    var row = "";
    Object.keys(cde).forEach(function (key) {
        row += "\"";
        var value = cde[key];
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

