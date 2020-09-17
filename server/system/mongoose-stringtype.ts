import { Schema as mongooseSchema } from 'mongoose';

export function addStringtype(mongoose: any) {
    const Schema = mongoose.Schema;

    function SchemaString(this: mongooseSchema.Types.String, key: string, options: any) {
        options.set = function deleteEmpty(v: string) {
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
    SchemaString.prototype.cast = (value: any) => '' + value;

    Schema.Types.StringType = SchemaString;
    mongoose.Types.StringType = mongoose.mongo.StringType;
}
