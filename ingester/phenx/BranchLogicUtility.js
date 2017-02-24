var SYMBOL_MAP = require('./REDCAP_SYMBOL_MAP').map;
var CONJUNCTION_MAP = require('./REDCAP_CONJUNCTION_MAP').map;
var REDCAP_DATATYPE_MAP = require('./REDCAP_DATATYPE_MAP').map;

exports.formatSkipLogic = function (m, equationText) {
    var result = '';
    var foundLabelArray = equationText.match(/\[[^\[\]]*\]\s*/);
    if (foundLabelArray && foundLabelArray.length === 1) {
        var foundLabel = foundLabelArray[0];
        result += '"' + m[foundLabel.replace('[', '').replace(']', '').trim()] + '"';
        equationText = equationText.replace(foundLabel, '').trim();
        var foundSymbolArray = equationText.match(/[^']*\s/);
        if (foundSymbolArray && foundSymbolArray.length === 1) {
            var foundSymbol = foundSymbolArray[0];
            result += SYMBOL_MAP[foundSymbol.trim()];
            equationText = equationText.replace(foundSymbol.trim(), '').trim();
        }
        var foundValueWithSingQuoteArray = equationText.match(/'.*'/);
        if (foundValueWithSingQuoteArray && foundValueWithSingQuoteArray.length === 1) {
            var foundValueWithSingQuote = foundValueWithSingQuoteArray[0];
            return result += foundValueWithSingQuote.replace(/'/g, '"').trim();
        }
        var foundValueWithDoubleQuoteArray = equationText.match(/".*"/);
        if (foundValueWithDoubleQuoteArray && foundValueWithDoubleQuoteArray.length === 1) {
            var foundValueWithDoubleQuote = foundValueWithDoubleQuoteArray[0];
            return result += foundValueWithDoubleQuote.trim();
        }
        if (equationText.match(/'.*"/) && equationText.match(/".*'/)) {
            return null;
        }
        return result += '"' + equationText.trim() + '"';
    }
};


exports.convertSkipLogic = function (skipLogicMap, skipLogicText) {
    if (skipLogicText.trim().length === 0)return skipLogicText;
    else if (skipLogicText.trim().indexOf('(') > -1) {
        return skipLogicText;
    }
    else {
        var loop_num = 0;
        var result = [];
        while (skipLogicText.trim().length > 0) {
            loop_num++;
            var foundEquationArray = skipLogicText.match(/\[[^[\]]*]\s*(?:<>|[<>]=|[=><])\s*['"]?[\w-]*['"]?/);
            if (foundEquationArray && foundEquationArray.length === 1) {
                var foundEquation = foundEquationArray[0];
                var cdeSkipLogicEquation = exports.formatSkipLogic(skipLogicMap, foundEquation);
                if (cdeSkipLogicEquation === null) {
                    console.log(skipLogicText);
                    return null;
                }
                result.push(cdeSkipLogicEquation);
                skipLogicText = skipLogicText.replace(foundEquation, '').trim();
                var foundConjunctionArray = skipLogicText.match(/[^\[\]]*\s/);
                if (foundConjunctionArray && foundConjunctionArray.length === 1) {
                    var foundConjunction = foundConjunctionArray[0];
                    var cdeSkipLogicConjunction = CONJUNCTION_MAP[foundConjunction.trim()];
                    result.push(cdeSkipLogicConjunction);
                    skipLogicText = skipLogicText.replace(foundConjunction, '').trim();
                }
            }
            if (loop_num > 100) {
                console.log('loop over 100 time in while loop');
                console.log('skipLogicText: ' + skipLogicText);
                return null;
            }
        }
        return result.join('');
    }
};


exports.convertCdeToQuestion = function (data, skipLogicMap, cde) {
    var question = {
        elementType: "question",
        label: data['Field Label'],
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: ''
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                version: cde.version,
                derivationRules: cde.derivationRules,
                name: cde.naming[0] ? cde.naming[0].designation : '',
                ids: cde.ids ? cde.ids : [],
                permissibleValues: cde.valueDomain.permissibleValues ? cde.valueDomain.permissibleValues : []
            },
            datatype: REDCAP_DATATYPE_MAP[data['Field Type']],
            required: data['Required Field?'] ? data['Required Field?'] : false,
            uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
            answers: []
        }
    };
    var branchLogic = data['Branching Logic (Show field only if...)'];
    var skipLogic = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        skipLogic = exports.convertSkipLogic(skipLogicMap, branchLogic);
        if (skipLogic === null || skipLogic === '') {
            console.log(data);
            return null;
        } else {
            question.skipLogic.condition = skipLogic;
        }
    }
    cde.naming.forEach(function (n) {
        if (!n.tags)n.tags = [];
        if (n.tags.filter(function (t) {
                return t.tag.toLowerCase().indexOf('Question Text') > 0;
            }).length > 0) {
            if (!n.designation || (n.designation && n.designation.trim().length === 0)) {
                question.label = cde.naming[0].designation ? cde.naming[0].designation : '';
                question.hideLabel = true;
            } else {
                question.label = n.designation;
            }
        }
    });
    if (question.question.datatype === 'Number') {
        question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
    } else if (question.question.datatype === 'Text') {
        question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
        var validationType = data['Text Validation Type OR Show Slider Number'];
        if (validationType.trim() === 'notes')
            question.question.datatypeText.showAsTextarea = true;
    } else if (question.question.datatype === 'Date') {
        question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
    } else if (question.question.datatype === 'Value List') {
        if (cde.valueDomain.permissibleValues.length === 0) throw ('Unknown CDE datatype: ' + cde.valueDomain.datatype);
        cde.valueDomain.permissibleValues.forEach(function (pv) {
            if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                pv.valueMeaningName = pv.permissibleValue;
            }
            question.question.answers.push(pv);
            question.question.cde.permissibleValues.push(pv);
        });
    }
    return question;
};