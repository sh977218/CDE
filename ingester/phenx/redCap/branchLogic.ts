import { find, isEqual, words } from 'lodash';
import { map as SYMBOL_MAP } from 'ingester/phenx/redCap/REDCAP_SYMBOL_MAP';

import { map as CONJUNCTION_MAP } from 'ingester/phenx/redCap/REDCAP_CONJUNCTION_MAP';

const formatSkipLogic = function (equationText, redCapCdes) {
    let result = '';
    let foundLabelArray = equationText.match(/\[[^\[\]]*]\s*/);
    if (foundLabelArray && foundLabelArray.length === 1) {
        let foundLabel = foundLabelArray[0];
        if (!foundLabel) {
            console.log('Label not found ' + equationText);
            process.exit(1);
        }
        let _foundLabel = foundLabel.replace('[', '').replace(']', '').trim();
        let redCapCde = find(redCapCdes, redCapCde => {
            let variableFieldName = redCapCde['Variable / Field Name'];
            let l = words(variableFieldName.toUpperCase());
            let r = words(_foundLabel.toUpperCase());
            return isEqual(l, r);
        });
        if (!redCapCde) {
            console.log('Branch Logic not found ' + foundLabel);
            process.exit(1);
        }

        result += '"' + redCapCde['Field Label'] + '"';
        equationText = equationText.replace(foundLabel, '').trim();
        let foundSymbolArray = equationText.match(/<>|<=|>=|=|>|</);
        if (foundSymbolArray && foundSymbolArray.length === 1) {
            let foundSymbol = foundSymbolArray[0];
            if (!foundSymbol) {
                console.log('Symbol not found ' + equationText);
                process.exit(1);
            }
            let cdeSymbol = SYMBOL_MAP[foundSymbol.trim()];
            if (!cdeSymbol) {
                console.log(foundSymbol + ' not found in SYMBOL_MAP');
                process.exit(1);
            }
            result += cdeSymbol;
            equationText = equationText.replace(foundSymbol.trim(), '').trim();
        }
        let foundValueWithSingQuoteArray = equationText.match(/'.*'/);
        if (foundValueWithSingQuoteArray && foundValueWithSingQuoteArray.length === 1) {
            let foundValueWithSingQuote = foundValueWithSingQuoteArray[0];
            return result += foundValueWithSingQuote.replace(/'/g, '"').trim();
        }
        let foundValueWithDoubleQuoteArray = equationText.match(/".*"/);
        if (foundValueWithDoubleQuoteArray && foundValueWithDoubleQuoteArray.length === 1) {
            let foundValueWithDoubleQuote = foundValueWithDoubleQuoteArray[0];
            return result += foundValueWithDoubleQuote.trim();
        }
        if (equationText.match(/'.*"/) && equationText.match(/".*'/)) {
            return null;
        }
        result += '"' + equationText.trim() + '"';
        return result;
    }
};

export function convertSkipLogic(skipLogicText, redCapCdes) {
    let loop_num = 0;
    let result = [];
    while (skipLogicText.trim().length > 0) {
        loop_num++;
        let foundEquationArray = skipLogicText.match(/\[[^[\]]*]\s*(?:<>|[<>]=|[=><])\s*['"]?[\w-]*['"]?/);
        if (foundEquationArray && foundEquationArray.length === 1) {
            let foundEquation = foundEquationArray[0];
            if (!foundEquation) {
                console.log(' Equation not found in ' + skipLogicText);
                process.exit(1);
            }
            let cdeSkipLogicEquation = formatSkipLogic(foundEquation, redCapCdes);
            result.push(cdeSkipLogicEquation);
            skipLogicText = skipLogicText.replace(foundEquation, '').trim();
            let foundConjunctionArray = skipLogicText.match(/[^\[\]]*\s/);
            if (foundConjunctionArray && foundConjunctionArray.length === 1) {
                let foundConjunction = foundConjunctionArray[0];
                if (!foundConjunction) {
                    console.log('Conjunction not found ' + skipLogicText);
                    process.exit(1);
                }
                let cdeSkipLogicConjunction = CONJUNCTION_MAP[foundConjunction.trim()];
                if (!cdeSkipLogicConjunction) {
                    console.log(foundConjunction + ' not found in CONJUNCTION_MAP');
                    process.exit(1);
                }
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