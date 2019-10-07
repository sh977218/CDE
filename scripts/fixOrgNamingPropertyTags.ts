import { isEmpty, uniq } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { Org } from 'server/system/mongo-data';

Org.find({}, async (err, orgs) => {
    if (err) {
        throw err;
    } else {
        for (const org of orgs) {
            console.log('Start updating ' + org.name);
            console.log('Old nameTags: ' + org.nameTags);
            console.log('Old propertyKeys: ' + org.propertyKeys);
            const query = {'stewardOrg.name': org.name};
            const deDesignationsTags = await dataElementModel.distinct('designations.tags', query);
            const deDefinitionsTags = await dataElementModel.distinct('definitions.tags', query);
            const formDesignationsTags = await formModel.distinct('designations.tags', query);
            const formDefinitionsTags = await formModel.distinct('definitions.tags', query);
            const dePropertyKeys = await dataElementModel.distinct('properties.key', query);
            const formPropertyKeys = await formModel.distinct('properties.key', query);

            const deNamingTags = uniq(deDesignationsTags.concat(deDefinitionsTags));
            const formNamingTags = uniq(formDesignationsTags.concat(formDefinitionsTags));
            const namingTags = uniq(deNamingTags.concat(formNamingTags));
            const propertiesKeys = uniq(dePropertyKeys.concat(formPropertyKeys));
            org.nameTags = namingTags.filter(n => !isEmpty(n));
            org.propertyKeys = propertiesKeys.filter(p => !isEmpty(p));
            const newOrg = await org.save();
            console.log('New nameTags: ' + newOrg.nameTags);
            console.log('New propertyKeys: ' + newOrg.propertyKeys);
            console.log('Finished Updating ' + org.name);
            console.log('----------------------------------------------------------');
        }
        console.log('Finished All Orgs.');
        process.exit(1);
    }
});
