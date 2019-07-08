db.dataelements.updateMany({
    "source": "GRDR",
    "naming.context.contextName": null
}, {$set: {"naming.$.context": {"contextName": "Health", "acceptability": "preferred"}}});
