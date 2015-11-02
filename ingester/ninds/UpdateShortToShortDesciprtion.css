db.getCollection('dataelements').update(
{"naming.context.contextName": "Short", source: "NINDS"},
{$set: {"naming.$.context.contextName": "Short Description"}},
{multi: true})


db.getCollection('dataelements').update(
{source: "NINDS"},
{$rename: {"valueDomain.datatypeInteger": "valueDomain.datatypeNumber"}},
{multi: true})