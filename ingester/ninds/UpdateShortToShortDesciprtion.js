db.dataelements.find(
    {"naming.context.contextName": "Short", source: "NINDS"})
    .limit(1000).forEach(function (doc) {
        doc.naming.forEach(function (name) {
            if (name.context.contextName === 'Short')
                name.context.contextName = 'Short Description';
            db.dataelements.save(doc);
        })
    });

db.getCollection('dataelements').update(
    {source: "NINDS","valueDomain.datatypeInteger":{ $exists: true }},
    {$rename: {"valueDomain.datatypeInteger": "valueDomain.datatypeNumber"}},
    {multi: true});

