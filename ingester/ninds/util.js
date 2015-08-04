/**
 * Created by huangs8 on 7/31/2015.
 * this is common util function for web scraping, should be included in all other js files
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function makeUtil(util) {
    util.replaceChars = function (spec) {
        if (spec != null) {
            spec = spec.replace(/\r?\n|\r|\t/g, "");
            spec = spec.replace(/(&nbsp;|<br>)+/, "");
            spec = spec.replace(/[\u0080-\uffff]/g, ' ');
            return spec.trim();
        } else {
            return null;
        }
    }
    util.normalizeSpace = function (str) {
        // Replace repeated spaces, newlines and tabs with a single space
        var result = str;
        if (result != null) {
            result = result.replace(/^\s*|\s(?=\s)|\s*$/g, "");
        }
        return result;
    }
}
module.exports.makeUtil = makeUtil;

