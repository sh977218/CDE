import {
    getCell,
    parsePermissibleValueArray,
    parseValueDefinitionArray,
    parseValueMeaningCodeArray } from 'shared/loader/utilities/utility';
import { validateAgainstUMLS, validatePermissibleValues } from 'server/loader/validators';


export async function parseValueDomain(row: any){
    const title = getCell(row, 'naming.designation');

    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };

    const datatype = getCell(row, 'datatypeValueList:datatype');
    const permissibleValueString = getCell(row, 'valueMeaningName').replace(/,|\n/g, ';');

    if(datatype !== 'Value List' && permissibleValueString){
        console.log(`Error: bad pvs: Name :'${title}' Data type is : '${datatype}' but permissible values were specified. Should this be a Value List type?`);
        // process.exit(1);
    }

    if (datatype === 'Value List') {
        valueDomain.datatype = 'Value List';
        const valueMeaningCodeSystem = getCell(row, 'Value Meaning Terminology Source');
        if(permissibleValueString){
            const permissibleValueArray = parsePermissibleValueArray(row);
            const valueMeaningDefinitionArray = parseValueDefinitionArray(row);
            const valueMeaningCodeArray = parseValueMeaningCodeArray(row);

            const validOutput = validatePermissibleValues(permissibleValueArray, valueMeaningDefinitionArray, valueMeaningCodeArray, title);

            if(!!validOutput){
                console.log(`Permissible values error for ${title}: ${validOutput}`);
                // process.exit(1);
            }

            permissibleValueArray.forEach((pv: any, i) => {
                const permissibleValue: any = {
                    permissibleValue: pv,
                    valueMeaningName: pv,
                    valueMeaningCode: valueMeaningCodeArray[i],
                    valueMeaningDefinition: valueMeaningDefinitionArray[i] ? valueMeaningDefinitionArray[i].split(':')[1].trim() : null,
                    codeSystemName: valueMeaningCodeSystem
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });

            const umlsOutput = await validateAgainstUMLS(valueDomain.permissibleValues, title);
            if(!!umlsOutput){
                console.log(`UMLS Error for ${title}: ${umlsOutput}`);
                // process.exit(1);
            }
        }
        else{
            console.log(`Error: bad pvs: Name :'${title}' datatype: '${datatype}' permissibleValue '${permissibleValueString}'`);
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