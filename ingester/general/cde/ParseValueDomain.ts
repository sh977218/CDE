import {
    getCell,
    parseColumn,
    parseCodeSystemName} from 'shared/loader/utilities/utility';
import { validateAgainstUMLS, validatePermissibleValues } from 'server/loader/validators';
import { PermissibleValueCodeSystem } from 'shared/models.model';


export async function parseValueDomain(row: any){
    const title = getCell(row, 'naming.designation');

    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };

    const datatype = getCell(row, 'datatypeValueList:datatype');
    const permissibleValueString = getCell(row, 'permissibleValues');

    if(datatype !== 'Value List' && permissibleValueString){
        console.log(`Error: bad pvs: Name :'${title}' Data type is : '${datatype}' but permissible values were specified. Should this be a Value List type?`);
        // process.exit(1);
    }

    if (datatype === 'Value List') {
        valueDomain.datatype = 'Value List';
        if(permissibleValueString){
            const permissibleValueArray = parseColumn(row, 'permissibleValues');
            const valueMeaningDefinitionArray = parseColumn(row, 'permissibleValueDefs');

            const conceptIdArray =  parseColumn(row, 'conceptIds');
            let conceptSource = parseColumn(row, 'conceptSource');

            if(conceptSource.length === 1) {
                conceptSource = Array(permissibleValueArray.length).fill(conceptSource[0]);
            }
            conceptSource = conceptSource.map((v) => parseCodeSystemName(v));

            const valueMeaningCodeArray = parseColumn(row, 'permissibleValueCodes');
            let codeSystemName = parseColumn(row, 'codeSystem');

            if(codeSystemName.length === 1) {
                codeSystemName = Array(permissibleValueArray.length).fill(codeSystemName[0]);
            }
            codeSystemName = codeSystemName.map((v) => parseCodeSystemName(v));

            const validOutput = validatePermissibleValues(
                permissibleValueArray,
                valueMeaningDefinitionArray,
                conceptIdArray,
                conceptSource,
                valueMeaningCodeArray,
                codeSystemName);

            if(validOutput.length > 0){
                console.log(`Permissible values error for ${title}: ${validOutput}`);
                // process.exit(1);
            }

            permissibleValueArray.forEach((pv: any, i) => {
                const permissibleValue: any = {
                    permissibleValue: pv,
                    valueMeaningDefinition: valueMeaningDefinitionArray[i],
                    valueMeaningCode: valueMeaningCodeArray[i],
                    codeSystemName: codeSystemName[i],
                    conceptId: conceptIdArray[i],
                    conceptSource: conceptSource[i]
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });

            const umlsOutput = ''; // await validateAgainstUMLS(valueDomain.permissibleValues, title);
            if(!!umlsOutput){
                console.log(`UMLS Error for ${title}: ${umlsOutput}`);
                // process.exit(1);
            }
        }
        else{
            console.log(`Error: missing permissible values. Name :'${title}'. Permissible values must be provided for a Value List type`);
            process.exit(1);
        }
    }
    else if (datatype === 'Text'){
        valueDomain.datatype = 'Text';
    }
    else if (datatype === 'Number') {
        valueDomain.datatype = 'Number';
    }
    else if (datatype === 'Date') {
        valueDomain.datatype = 'Date';
    }
    else {
        console.log(`Error: Unknown data type: Name :'${title}' datatype: '${datatype}'`);
        process.exit(1);
    }

    return valueDomain;
}
