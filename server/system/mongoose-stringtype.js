module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    function SchemaString (key, options) {
        options.set = function deleteEmpty(v) {
            if (v === null || v === '') {
                return;
            }
            return v;
        };
        Schema.Types.String.call(this, key, options);
    }
    SchemaString.schemaName = 'StringType';
    SchemaString.prototype = Object.create( Schema.Types.String.prototype );
    SchemaString.prototype.constructor = SchemaString;

    Schema.Types.StringType = SchemaString;
    mongoose.Types.StringType = mongoose.mongo.StringType;
};
