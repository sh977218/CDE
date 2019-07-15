import { isEmpty, uniq } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';
import { Form } from '../server/form/mongo-form';
import { Org } from '../server/system/mongo-data';

Org.find({}, async (err, orgs) => {
    if (err) throw err;
    else {
        for (let org of orgs) {
            console.log('Start updating ' + org.name);
            console.log('Old nameTags: ' + org.nameTags);
            console.log('Old propertyKeys: ' + org.propertyKeys);
            let query = {'stewardOrg.name': org.name};
            let deDesignationsTags = await DataElement.distinct('designations.tags', query);
            let deDefinitionsTags = await DataElement.distinct('definitions.tags', query);
            let formDesignationsTags = await Form.distinct('designations.tags', query);
            let formDefinitionsTags = await Form.distinct('definitions.tags', query);
            let dePropertyKeys = await DataElement.distinct('properties.key', query);
            let formPropertyKeys = await Form.distinct('properties.key', query);

            let deNamingTags = uniq(deDesignationsTags.concat(deDefinitionsTags));
            let formNamingTags = uniq(formDesignationsTags.concat(formDefinitionsTags));
            let namingTags = uniq(deNamingTags.concat(formNamingTags));
            let propertiesKeys = uniq(dePropertyKeys.concat(formPropertyKeys));
            org.nameTags = namingTags.filter(n => !isEmpty(n));
            org.propertyKeys = propertiesKeys.filter(p => !isEmpty(p));
            let newOrg = await org.save();
            console.log('New nameTags: ' + newOrg.nameTags);
            console.log('New propertyKeys: ' + newOrg.propertyKeys);
            console.log('Finished Updating ' + org.name);
            console.log('----------------------------------------------------------')
        }
        console.log('Finished All Orgs.');
        process.exit(1);
    }
});
