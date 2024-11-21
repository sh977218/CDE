import {readFileSync} from "fs";

import {NCI_ORG_INFO_MAP, ORG_INFO} from '../../nci/shared/ORG_INFO_MAP';
import {formModel, formSourceModel} from "server/form/mongo-form";
import {generateTinyId} from "server/system/mongo-data";
import {parseDesignations2} from "../../nci/shared/ParseDesignations";
import {parseDefinitions2} from "../../nci/shared/ParseDefinitions";
import {parseSources2} from "../../nci/shared/ParseSources";
import {parseReferenceDocuments2} from "../../nci/shared/ParseReferenceDocuments";
import {parseProperties2} from "../../nci/shared/ParseProperties";
import {parseIds2} from "../../nci/shared/ParseIds";
import {parseAttachments2} from "../../nci/shared/ParseAttachments";
import {created, imported, BATCHLOADER} from "../../shared/utility";
import {parseFormElements} from "./parseFormElements";
import {parseClassification2} from "../shared/ParseClassification";

const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({explicitArray: false});

export async function loadFormFromXml(orgName: string) {
    const orgInfo = NCI_ORG_INFO_MAP[orgName];
    const cadsrXmlFilePath = orgInfo.xml || '';
    const cadsrXmlString = readFileSync(cadsrXmlFilePath);
    const cadsrXml = await xmlParser.parseStringPromise(cadsrXmlString);
    await loadCadsrForm(cadsrXml, orgInfo)
}

async function loadCadsrForm(cadsrXml: any, orgInfo: ORG_INFO) {
    const nciForm = await createNciForm(cadsrXml, orgInfo)
    const newForm = new formModel(nciForm);
    const savedNewForm = await newForm.save();
    console.info(`${savedNewForm.tinyId} form saved`)

    const newFormSource = new formSourceModel(nciForm);
    const savedNewFormSource = await newFormSource.save();
    console.info(`${savedNewFormSource.tinyId} form source saved`)
}

async function createNciForm(cadsrXml: any, orgInfo: ORG_INFO) {
    const nciXmlForm = cadsrXml.forms.form
    const designations = parseDesignations2(nciXmlForm);
    const definitions = parseDefinitions2(nciXmlForm);
    const sources = parseSources2(nciXmlForm, orgInfo);
    const referenceDocuments = parseReferenceDocuments2(nciXmlForm);
    const properties = parseProperties2(nciXmlForm);
    const ids = parseIds2(nciXmlForm);
    const attachments = parseAttachments2(nciXmlForm);
    const formElements = await parseFormElements(nciXmlForm)
    const nciForm: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NCI'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        designations,
        definitions,
        source: orgInfo.stewardOrgName,
        sources,
        formElements,
        referenceDocuments,
        properties,
        ids,
        attachments,
        classification: [],
    };
    await parseClassification2(nciXmlForm, nciForm, orgInfo)

    return nciForm;
}