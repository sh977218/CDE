import { createHash } from 'crypto';
import { createIndexJson as boardCreateIndexJson } from 'server/board/elasticSearchMapping';
import { config } from 'server/config'; // gulpfile: cannot use 'server' because it connects to db
import { DataElementElastic } from 'shared/de/dataElement.model';
import { CdeForm, CdeFormElastic, FormElement, FormQuestion } from 'shared/form/form.model';
import { Cb1, CbError1, ClassificationElement, Item, ItemElastic } from 'shared/models.model';

const primaryNameSuggest = {
    type: 'text',
    analyzer: 'autocomplete',
    search_analyzer: 'standard',
};

export const createSuggestIndexJson = {
    mappings: {
        properties: {
            nameSuggest: primaryNameSuggest,
            noRenderAllowed: { type: 'boolean' },
            stewardOrg: {
                properties: {
                    name: { type: 'keyword' },
                },
            },
            registrationState: {
                properties: {
                    registrationStatus: { type: 'keyword' },
                },
            },
        },
    },
    settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas,
            analysis: {
                filter: {
                    autocomplete_filter: {
                        type: 'edge_ngram',
                        min_gram: 1,
                        max_gram: 20,
                    },
                },
                analyzer: {
                    default: {
                        type: 'snowball',
                        language: 'English',
                    },
                    autocomplete: {
                        type: 'custom',
                        tokenizer: 'standard',
                        filter: ['lowercase', 'autocomplete_filter'],
                    },
                },
            },
        },
    },
};

export const createIndexJson = {
    mappings: {
        date_detection: false,
        properties: {
            primaryNameCopy: {
                type: 'text',
                fields: {
                    raw: {
                        type: 'keyword',
                        index: false,
                    },
                },
            },
            stewardOrg: {
                properties: {
                    name: { type: 'keyword' },
                },
            },
            flatClassifications: { type: 'keyword' },
            classification: {
                properties: {
                    stewardOrg: {
                        properties: {
                            name: { type: 'keyword' },
                        },
                    },
                },
            },
            classificationSize: { type: 'integer' },
            registrationState: {
                properties: {
                    registrationStatus: { type: 'keyword' },
                },
            },
            source: { type: 'keyword' },
            origin: { type: 'keyword' },
            valueDomain: {
                properties: {
                    datatype: { type: 'keyword' },
                    permissibleValues: {
                        properties: {
                            codeSystemName: { type: 'keyword' },
                            conceptSource: { type: 'keyword' },
                        },
                    },
                },
            },
            properties: {
                type: 'nested',
                include_in_parent: true,
                properties: {
                    key: { type: 'text' },
                    value: { type: 'text' },
                },
            },
            ids: {
                type: 'nested',
                include_in_parent: true,
                properties: {
                    source: { type: 'keyword' },
                    id: { type: 'text' },
                    version: { type: 'text' },
                },
            },
            tinyId: { type: 'keyword' },
            created: { type: 'date' },
            updated: { type: 'date' },
            imported: { type: 'date' },
            nihEndorsed: { type: 'boolean' },
            updatedBy: { properties: { username: { type: 'text' } } },
            changeNote: { enabled: false },
            attachments: {
                properties: {
                    fileid: { enabled: false },
                    filename: { enabled: false },
                },
            },
            history: { enabled: false },
            version: { type: 'keyword' },
            views: { type: 'integer' },
            linkedForms: {
                properties: {
                    Retired: { type: 'integer' },
                    Incomplete: { type: 'integer' },
                    Candidate: { type: 'integer' },
                    Recorded: { type: 'integer' },
                    Qualified: { type: 'integer' },
                    Standard: { type: 'integer' },
                    'Preferred Standard': { type: 'integer' },
                    forms: {
                        properties: {
                            primaryName: { type: 'text' },
                            tinyId: { type: 'keyword' },
                            registrationStatus: { type: 'keyword' },
                        },
                    },
                },
            },
            noRenderAllowed: { type: 'boolean' },
        },
    },
    settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas,
        },
        analysis: {
            analyzer: {
                default: {
                    type: 'snowball',
                    language: 'English',
                },
            },
        },
    },
};

export const createFormIndexJson = {
    mappings: {
        date_detection: false,
        properties: {
            primaryNameCopy: {
                type: 'text',
                fields: {
                    raw: {
                        type: 'keyword',
                        index: false,
                    },
                },
            },
            stewardOrg: { properties: { name: { type: 'keyword' } } },
            flatClassifications: { type: 'keyword' },
            classification: {
                properties: {
                    stewardOrg: {
                        properties: {
                            name: { type: 'keyword' },
                        },
                    },
                },
            },
            classificationSize: { type: 'integer' },
            registrationState: {
                properties: {
                    registrationStatus: { type: 'keyword' },
                },
            },
            source: { type: 'keyword' },
            origin: { type: 'keyword' },
            properties: {
                type: 'nested',
                include_in_parent: true,
                properties: {
                    key: { type: 'text' },
                    value: { type: 'text' },
                },
            },
            ids: {
                type: 'nested',
                include_in_parent: true,
                properties: {
                    source: { type: 'keyword' },
                    id: { type: 'text' },
                    version: { type: 'text' },
                },
            },
            views: { type: 'integer' },
            created: { type: 'date' },
            updated: { type: 'date' },
            imported: { type: 'date' },
            nihEndorsed: { type: 'boolean' },
            numQuestions: { type: 'integer' },
            cdeTinyIds: { type: 'keyword' },
            noRenderAllowed: { type: 'boolean' },
            copyrightStatus: { type: 'keyword' },
        },
    },
    settings: {
        'index.mapping.total_fields.limit': 2000,
        index: {
            number_of_replicas: config.elastic.number_of_replicas,
        },
        analysis: {
            analyzer: {
                default: {
                    type: 'snowball',
                    language: 'English',
                },
            },
        },
    },
};

export function suggestRiverFunction(_elt: Item, cb: Cb1<Item>) {
    const toIndex: any = { nameSuggest: _elt.designations[0].designation };
    toIndex.registrationState = _elt.registrationState;
    toIndex.stewardOrg = _elt.stewardOrg;
    toIndex.tinyId = _elt.tinyId;
    toIndex.noRenderAllowed = !!(_elt as CdeForm).noRenderAllowed;

    cb(toIndex);
    return;
}

function parseCopyrightStatus(f: CdeFormElastic) {
    let copyrightStatus = '';
    if (!f.isCopyrighted && !f.noRenderAllowed) {
        copyrightStatus = 'Public domain, free to use';
    }
    if (f.isCopyrighted && !f.noRenderAllowed) {
        copyrightStatus = 'Copyrighted, but free to use';
    }
    if (f.isCopyrighted && f.noRenderAllowed) {
        copyrightStatus = 'Copyrighted, with restrictions';
    }
    f.copyrightStatus = copyrightStatus;
}

export function riverFunction(_elt: Item, cb: Cb1<Item | void>) {
    if (_elt.archived) {
        return cb();
    }

    const formSvc = require('../form/formsvc');

    const getElt = (_elt as CdeForm).formElements
        ? formSvc.fetchWholeForm
        : (item: Item, cb: CbError1<Item>) => {
              cb(null, item);
          };

    getElt(_elt, (err: Error | undefined, elt: ItemElastic) => {
        function escapeHTML(s: string) {
            if (!s) {
                return '';
            }
            return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        const flatArray: string[] = [];

        function doClassif(currentString: string, classif: ClassificationElement) {
            if (currentString.length > 0) {
                currentString = currentString + ';';
            }
            currentString = currentString + classif.name;
            flatArray.push(currentString);
            if (classif.elements) {
                classif.elements.forEach(e => doClassif(currentString, e));
            }
        }

        function flattenClassification(doc: ItemElastic) {
            if (doc.classification) {
                doc.classification.forEach(dc => {
                    if (dc.elements) {
                        dc.elements.forEach(dce => doClassif(dc.stewardOrg.name, dce));
                    }
                });
            }
        }

        function findFormQuestions(fe: ItemElastic | FormElement, formQuestions: FormQuestion[]): FormQuestion[] {
            if ((fe as CdeFormElastic | FormElement).formElements) {
                (fe as CdeFormElastic | FormElement).formElements.forEach((fee: FormElement) => {
                    if (fee.elementType === 'question') {
                        formQuestions.push(fee);
                    } else {
                        findFormQuestions(fee, formQuestions);
                    }
                });
            }
            return formQuestions;
        }

        flattenClassification(elt);

        const de = elt as DataElementElastic;
        if (de.valueDomain && de.valueDomain.datatype === 'Value List' && de.valueDomain.permissibleValues) {
            de.valueDomain.nbOfPVs = de.valueDomain.permissibleValues.length;
            if (de.valueDomain.permissibleValues.length > 20) {
                de.valueDomain.permissibleValues.length = 20;
            }
        }

        const form = elt as CdeFormElastic;
        const formQuestions = findFormQuestions(elt, []);
        form.numQuestions = formQuestions.length;
        form.cdeTinyIds = formQuestions.map(q => q.question.cde.tinyId);

        elt.flatClassifications = flatArray;
        elt.stewardOrgCopy = elt.stewardOrg;
        elt.steward = elt.stewardOrg.name;
        elt.primaryNameCopy = elt.designations[0] ? escapeHTML(elt.designations[0].designation) : '';
        elt.classificationSize = elt.classification ? elt.classification.length : 0;

        elt.primaryDefinitionCopy = elt.definitions[0] ? elt.definitions[0].definition : '';
        if (elt.definitions[0] && elt.definitions[0].definitionFormat === 'html') {
            elt.primaryDefinitionCopy = elt.primaryDefinitionCopy.replace(/<(?:.|\\n)*?>/gm, '');
        } else {
            elt.primaryDefinitionCopy = escapeHTML(elt.primaryDefinitionCopy);
        }

        parseCopyrightStatus(form);

        const regStatusSortMap = {
            Retired: 6,
            Incomplete: 5,
            Candidate: 4,
            Recorded: 3,
            Qualified: 2,
            Standard: 1,
            'Preferred Standard': 0,
        };
        elt.registrationState.registrationStatusSortOrder = regStatusSortMap[elt.registrationState.registrationStatus];
        if (elt.classification) {
            const size = elt.classification.length;
            if (size > 10) {
                elt.classificationBoost = 2.1;
            } else {
                elt.classificationBoost = 0.1 + 0.2 * size;
            }
        } else {
            elt.classificationBoost = 0.1;
        }
        elt.flatIds = elt.ids.map(id => id.source + ' ' + id.id + ' ' + id.version);
        elt.flatProperties = elt.properties.map(p => p.key + ' ' + p.value);

        return cb(elt);
    });
}

export const shortHash = (content: any) => {
    return createHash('md5').update(JSON.stringify(content)).digest('hex').substr(0, 5).toLowerCase();
};

const esVersion = config.elastic.esIndexVersion;

if (config.elastic.index.name === 'auto') {
    config.elastic.index.name = 'cde_' + esVersion + '_' + shortHash(createIndexJson.mappings);
}
if (config.elastic.formIndex.name === 'auto') {
    config.elastic.formIndex.name = 'form_' + esVersion + '_' + shortHash(createFormIndexJson.mappings);
}
if (config.elastic.boardIndex.name === 'auto') {
    config.elastic.boardIndex.name = 'board_' + esVersion + '_' + shortHash(boardCreateIndexJson.mappings);
}
if (config.elastic.cdeSuggestIndex.name === 'auto') {
    config.elastic.cdeSuggestIndex.name = 'cdesuggest_' + esVersion + '_' + shortHash(createSuggestIndexJson.mappings);
}
if (config.elastic.formSuggestIndex.name === 'auto') {
    config.elastic.formSuggestIndex.name =
        'formsuggest_' + esVersion + '_' + shortHash(createSuggestIndexJson.mappings);
}

export interface ElasticIndex {
    count: number;
    totalCount?: number; // populated after query
    filter?: (elt: Item, cb: Cb1<Item | void>) => void;
    indexJson: any;
    indexName: string;
    name: 'cde' | 'form' | 'board' | 'cdeSuggest' | 'formSuggest';
}

export const indices: ElasticIndex[] = [
    {
        name: 'cde',
        count: 0,
        indexName: config.elastic.index.name,
        indexJson: createIndexJson,
        filter: riverFunction,
    },
    {
        name: 'form',
        count: 0,
        indexName: config.elastic.formIndex.name,
        indexJson: createFormIndexJson,
        filter: riverFunction,
    },
    {
        name: 'board',
        count: 0,
        indexName: config.elastic.boardIndex.name,
        indexJson: boardCreateIndexJson,
    },
    {
        name: 'cdeSuggest',
        count: 0,
        indexName: config.elastic.cdeSuggestIndex.name,
        indexJson: createSuggestIndexJson,
        filter: suggestRiverFunction,
    },
    {
        name: 'formSuggest',
        count: 0,
        indexName: config.elastic.formSuggestIndex.name,
        indexJson: createSuggestIndexJson,
        filter: suggestRiverFunction,
    },
];
