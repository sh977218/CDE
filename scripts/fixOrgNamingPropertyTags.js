const _ = require('lodash');

const mongo_cde = require('../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const mongo_form = require('../server/form/mongo-form');
const Form = mongo_form.Form;
const Org = require('../server/system/mongo-data').Org;

Org.find({}, async (err, orgs) => {
    if (err) throw err;
    else {
        for (let org of orgs) {
            console.log('Start updating ' + org.name);
            console.log('nameTags: ' + org.nameTags);
            console.log('propertyKeys: ' + org.propertyKeys);
            let deDesignationsTags = await DataElement.distinct('designations.tags');
            let deDefinitionsTags = await DataElement.distinct('definitions.tags');
            let formDesignationsTags = await Form.distinct('designations.tags');
            let formDefinitionsTags = await Form.distinct('definitions.tags');
            let dePropertyKeys = await DataElement.distinct('properties.keys');
            let formPropertyKeys = await Form.distinct('properties.keys');
            let deNamingTags = _.uniq(deDesignationsTags.concat(deDefinitionsTags))
            let formNamingTags = _.uniq(formDesignationsTags.concat(formDefinitionsTags))
            let namingTags = _.uniq(deNamingTags.concat(formNamingTags));
            let propertiesKeys = _.uniq(dePropertyKeys.concat(formPropertyKeys));
            org.nameTags = namingTags;
            org.propertyKeys = propertiesKeys;
            await org.save();
            console.log('Finished Updating ' + org.name);
        }
    }
});