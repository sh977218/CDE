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
            console.log('Old nameTags: ' + org.nameTags);
            console.log('');
            console.log('Old propertyKeys: ' + org.propertyKeys);
            let query = {'stewardOrg.name': org.name};
            let deDesignationsTags = await DataElement.distinct('designations.tags', query);
            let deDefinitionsTags = await DataElement.distinct('definitions.tags', query);
            let formDesignationsTags = await Form.distinct('designations.tags', query);
            let formDefinitionsTags = await Form.distinct('definitions.tags', query);
            let dePropertyKeys = await DataElement.distinct('properties.key', query);
            let formPropertyKeys = await Form.distinct('properties.key', query);

            let deNamingTags = _.uniq(deDesignationsTags.concat(deDefinitionsTags));
            let formNamingTags = _.uniq(formDesignationsTags.concat(formDefinitionsTags));
            let namingTags = _.uniq(deNamingTags.concat(formNamingTags));
            let propertiesKeys = _.uniq(dePropertyKeys.concat(formPropertyKeys));
            org.nameTags = namingTags.filter(n => !_.isEmpty(n));
            org.propertyKeys = propertiesKeys.filter(p => !_.isEmpty(p));
            let newOrg = await org.save();
            console.log('New nameTags: ' + newOrg.nameTags);
            console.log('');
            console.log('New propertyKeys: ' + newOrg.propertyKeys);
            console.log('Finished Updating ' + org.name);
            console.log('----------------------------------------------------------')
        }
        console.log('Finihsed All Orgs.');
        process.exit(1);
    }
});