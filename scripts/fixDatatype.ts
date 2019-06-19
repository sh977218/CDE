import { iterateFormElements } from 'shared/form/fe';
import { DataElement, DataElementDraft } from '../server/cde/mongo-cde';
import { Form, FormDraft } from '../server/form/mongo-form';

const DATA_TYPE_MAP = {
    '': 'Text',

    'ALPHANUMERIC': 'Text',

    'Character': 'Text',
    'CHARACTER': 'Text',

    'DATE': 'Date',
    'Date/Time': 'Date',
    'Date': 'Date',
    'DATE/TIME': 'Date',

    'Externally Defined': 'Externally Defined',

    'File': 'File',
    'Finnish': 'Text',
    'Float': 'Number',

    'ISO21090IIv1.0': 'Text',
    'ISO21090STv1.0': 'Text',
    'ISO21090BLv1.0': 'Text',
    'ISO21090CDv1.0': 'Text',
    'ISO21090INTPOSv1.0': 'Text',
    'ISO21090DSETv1.0': 'Text',
    'Integer': 'Number',
    'Integer ': 'Number',

    'java.lang.String': 'Text',
    'java.lang.Long': 'Number',
    'java.lang.Integer': 'Number',
    'java.util.Date': 'Date',
    'java.lang.Float': 'Number',
    'java.lang.Double': 'Number',
    'java.lang.Short': 'Number',
    'java.lang.Boolean': 'Text',

    'Number': 'Number',
    'Numeric': 'Number',
    'NUMBER': 'Number',

    'String\nNumeric': 'Text',

    'TIME': 'Time',
    'Text': 'Text',
    'Time': 'Time',
    'text': 'Text',

    'Value List': 'Value List',

    'WGA': 'Text',

    'xsd:string': 'Text'
};
const ALLOW_DATA_TYPE = ['Text', 'Number', 'Date', 'Time', 'Value List', 'Externally Defined', 'File'];

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement
    },
    {
        name: 'de draft',
        count: 0,
        dao: DataElementDraft
    },
    {
        name: 'form',
        count: 0,
        dao: Form
    }, {
        name: 'form draft',
        count: 0,
        dao: FormDraft
    }
];

DAOs.forEach(DAO => {
    DAO.dao.find({}).cursor().eachAsync(elt => doOneElement(elt, DAO), {parallel: 300})
        .then(() => console.log('Finished ' + DAO.name + ' Count: ' + DAO.count))
        .catch(err => {
            if (err) throw err;
            process.exit(0);
        });
});

function removeValueList(container) {
    if (container.datatypeValueList) {
        delete container.datatypeValueList;
    }
}

function removeDynamicCodeList(container) {
    if (container.datatypeDynamicCodeList) {
        delete container.datatypeDynamicCodeList;
    }
}

function removeDate(container) {
    if (container.datatypeDate) {
        delete container.datatypeDate;
    }
}

function removeNumber(container) {
    if (container.datatypeNumber) {
        delete container.datatypeNumber;
    }
}

function removeText(container) {
    if (container.datatypeText) {
        delete container.datatypeText;
    }
}

function removeExternal(container) {
    if (container.datatypeExternallyDefined) {
        delete container.datatypeExternallyDefined;
    }
}

function removeDatatype(container) {
    switch (container.datatype) {
        case 'Value List':
            removeDate(container);
            removeDynamicCodeList(container);
            removeNumber(container);
            removeText(container);
            removeExternal(container);
            break;
        case 'Date':
            removeValueList(container);
            removeDynamicCodeList(container);
            removeNumber(container);
            removeText(container);
            removeExternal(container);
            break;
        case 'Dynamic Code List':
            removeValueList(container);
            removeDate(container);
            removeNumber(container);
            removeText(container);
            removeExternal(container);
            break;
        case 'Number':
            removeValueList(container);
            removeDynamicCodeList(container);
            removeDate(container);
            removeText(container);
            removeExternal(container);
            break;
        case 'Externally Defined':
            removeValueList(container);
            removeDynamicCodeList(container);
            removeDate(container);
            removeText(container);
        case 'Text':
        /* falls through */
        default:
            removeValueList(container);
            removeDate(container);
            removeDynamicCodeList(container);
            removeNumber(container);
            removeExternal(container);
    }
}

function doOneCDE(elt, DAO) {
    let dataTypeIncorrect = elt.valueDomain.datatype;
    let dataTypeCorrect = DATA_TYPE_MAP[dataTypeIncorrect];
    if (!dataTypeIncorrect) dataTypeCorrect = 'Text';
    if (ALLOW_DATA_TYPE.indexOf(dataTypeCorrect) === -1) {
        console.log('tinyId: ' + elt.tinyId + ' has incorrect data type ' + dataTypeIncorrect);
        process.exit(1);
    }
    elt.valueDomain.datatype = dataTypeCorrect;
    removeDatatype(elt.valueDomain);
}

function doOneForm(elt, DAO) {
    iterateFormElements(elt, {
        questionCb: (fe) => {
            if (fe) {
                let dataTypeIncorrect = fe.question.datatype;
                let dataTypeCorrect = DATA_TYPE_MAP[dataTypeIncorrect];
                if (!dataTypeIncorrect) dataTypeCorrect = 'Text';
                if (ALLOW_DATA_TYPE.indexOf(dataTypeCorrect) === -1) {
                    console.log('tinyId: ' + elt.tinyId + ' has incorrect data type ' + dataTypeIncorrect);
                    process.exit(1);
                }
                fe.question.datatype = dataTypeCorrect;
                removeDatatype(fe.question);
            }
        }
    });
}

function doOneElement(elt, DAO) {
    return new Promise((resolve, reject) => {
        if (elt.elementType === 'cde') doOneCDE(elt, DAO);
        else if (elt.elementType === 'form') doOneForm(elt, DAO);

        elt.save(err => {
            if (err) reject(elt.tinyId + err);
            else {
                DAO.count++;
                if (DAO.count % 500 === 0) console.log(DAO.name + 'Count: ' + DAO.count);
                resolve();
            }
        });
    });
}
