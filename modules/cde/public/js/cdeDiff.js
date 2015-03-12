angular.module('cdeModule').factory('CdeDiffPopulate', function() {
    var CdeDiffPopulate = this;
    CdeDiffPopulate.pathFieldMap = {
        1: [
            {fieldName: "Naming", path: ["naming"]}
            , {fieldName: "Properties", path: ["properties"]}
            , {fieldName: "Identifiers", path: ["ids"]}
            , {fieldName: "Mapping Specifications", path: ["mappingSpecifications"]}
            , {fieldName: "Attachments", path: ["attachments"]}
            , {fieldName: "Version", path: ["version"]}
        ]
        , 2: [
            {fieldName: "Concepts - Property", path: ["property", "concepts"]}
            , {fieldName: "Concepts - Object Class", path: ["objectClass", "concepts"]}
            , {fieldName: "Concepts - Data Element", path: ["dataElementConcept", "concepts"]}
            , {fieldName: "Registration State", path: ["registrationState", "registrationStatus"]}
            , {fieldName: "Steward Organization", path: ["stewardOrg", "name"]}
            , {fieldName: "Permissible Values - Value Type", path: ["valueDomain", "datatype"]}
            , {fieldName: "Permissible Values - Text", path: ["valueDomain", "datatypeText"]}
            , {fieldName: "Permissible Values - Integer", path: ["valueDomain", "datatypeInteger"]}
            , {fieldName: "Permissible Values - Date", path: ["valueDomain", "datatypeDate"]} 
            , {fieldName: "Permissible Values - Value List", path: ["valueDomain", "datatypeValueList"]} 
            , {fieldName: "Unit of Measure", path: ["valueDomain", "uom"]} 
            , {fieldName: "Permissible Values - VSAC Mapping", path: ["dataElementConcept", "conceptualDomain"]} 
            , {fieldName: "Permissible Values - Externaly Defined", path: ["valueDomain", "datatypeExternallyDefined"]} 
            , {fieldName: "Permissible Values" , path: ["valueDomain", "permissibleValues"]} 
            , {fieldName: "Permissible Values - Float" , path: ["valueDomain", "datatypeFloat"]} 
            
            
        ]        
        , 3: [
            {fieldName: "Naming - Other Name", path: ["naming",-1,"designation"]}
            , {fieldName: "Naming - Other Definition", path: ["naming",-1,"definition"]}        
            , {fieldName: "Primary Name", path: ["naming",0,"designation"]}
            , {fieldName: "Primary Definition", path: ["naming",0,"definition"]}
            , {fieldName: "Permissible Values - Text - Regular Expression", path: ["valueDomain", "datatypeText", "regex"]}
            , {fieldName: "Permissible Values - Text - Freetext Rule", path: ["valueDomain", "datatypeText", "rule"]}
            , {fieldName: "Permissible Values - Text - Maximum Length", path: ["valueDomain", "datatypeText", "maxLength"]}
            , {fieldName: "Permissible Values - Text - Minimum Length", path: ["valueDomain", "datatypeText", "minLength"]} 
            , {fieldName: "Permissible Values - Integer - Maximum Value", path: ["valueDomain", "datatypeInteger", "maxValue"]}
            , {fieldName: "Permissible Values - Integer - Minimum Value", path: ["valueDomain", "datatypeInteger", "minValue"]}     
            , {fieldName: "Permissible Values - Date - Format", path: ["valueDomain", "datatypeDate", "format"]}     
            , {fieldName: "Permissible Values - Value List - Datatype", path: ["valueDomain", "datatypeValueList", "datatype"]}   
            , {fieldName: "Permissible Values - Properties - Value", path: ["properties", -1, "value"]}   
            , {fieldName: "Naming - Other Definition - Format", path: ["naming", -1, "definitionFormat"]}            
            , {fieldName: "Permissible Values - Float - Minimum Value", path: ["valueDomain", "datatypeFloat", "minValue"]}
            , {fieldName: "Permissible Values - Float - Maximum Value", path: ["valueDomain", "datatypeFloat", "maxValue"]}
            , {fieldName: "Permissible Values - Float - Precision", path: ["valueDomain", "datatypeFloat", "precision"]}
            , {fieldName: "Properties - Value - Format", path: ["properties", -1, "valueFormat"]}
            , {fieldName: "Properties - Key", path: ["properties", -1, "key"]}
            , {fieldName: "Identifiers - Source", path: ["ids", -1, "source"]}
            , {fieldName: "Identifiers - ID", path: ["ids", -1, "id"]}
            , {fieldName: "Identifiers - Version", path: ["ids", -1, "version"]}  
            , {fieldName: "Attachments - File ID", path: ["attachments", -1, "fileid"]}
            , {fieldName: "Attachments - Filename", path: ["attachments", -1, "filename"]}
            , {fieldName: "Attachments - Upload Date", path: ["attachments", -1, "uploadDate"]}
            , {fieldName: "Attachments - File Size", path: ["attachments", -1, "filesize"]} 
            , {fieldName: "Mapping Specifications - Content", path: ["mappingSpecifications", -1, "content"]}
            , {fieldName: "Mapping Specifications - Type", path: ["mappingSpecifications", -1, "spec_type"]}
            , {fieldName: "Mapping Specifications - Script", path: ["mappingSpecifications", -1, "script"]}           
        ]
        , 4: [
            {fieldName: "Permissible Values", path: ["valueDomain", "permissibleValues", -1, "permissibleValue"]}
            , {fieldName: "Concepts - Data Element - Name", path: ["dataElementConcept", "concepts", -1, "name"]}
            , {fieldName: "Concepts - Data Element - Origin", path: ["dataElementConcept", "concepts", -1, "origin"]}
            , {fieldName: "Concepts - Data Element - Origin ID", path: ["dataElementConcept", "concepts", -1, "originId"]}
            , {fieldName: "Permissible Values - Code Name", path: ["valueDomain", "permissibleValues", -1, "valueMeaningName"]}
            , {fieldName: "Permissible Values - Value", path: ["valueDomain", "permissibleValues", -1, "permissibleValue"]}
            , {fieldName: "Permissible Values - Code", path: ["valueDomain", "permissibleValues", -1, "valueMeaningCode"]}         
            , {fieldName: "Permissible Values - Code System", path: ["valueDomain", "permissibleValues", -1, "codeSystemName"]}
            , {fieldName: "Naming - Primary Name - Context", path: ["naming", 1, "context", "contextName"]}
            , {fieldName: "Naming - Other Name - Context", path: ["naming", -1, "context", "contextName"]}
            , {fieldName: "Properties - Object Class - Name", path: ["objectClass", "concepts", -1, "name"]}
            
            
            
        ]
    };
    
    CdeDiffPopulate.nullsToBottom = function(obj) {
        return (angular.isDefined(obj.updated) ? 0 : 1);
    };    
    
    CdeDiffPopulate.comparePaths = function(patternPath,realPath){
        var equal = true;
        patternPath.forEach(function(el,i){
            if (typeof el === "number" && el===-1) return;
            if (el===realPath[i]) equal = equal && true;
            else equal = false;
        });
        return equal;
    };
    
    CdeDiffPopulate.makeHumanReadable = function(change){
        if (!change) return;
        this.stringify = function(obj) {
            if (typeof obj === "string") return obj;
            if (typeof obj === "number") return obj;
            return Object.keys(obj).map(function(f){
                return f + ": " + obj[f];
            }).join(", ");                    
        };
        this.stringifyClassif = function(obj) {
            if (obj && obj.elements) return " > " + obj.name + this.stringifyClassif(obj.elements[0]);
            else return "";
        };                
        if (change.kind==="E") {
            change.modificationType = "Modified Field";
            change.newValue = change.rhs;
            change.previousValue = change.lhs;
        }
        if (change.kind==="N") {
            change.modificationType = "New Item";
            change.newValue = this.stringify(change.rhs);
        }                
        if (change.kind==="A" && change.item.kind==="N") {
            change.modificationType = "New Item";
            change.newValue = this.stringify(change.item.rhs);                  
        }
        if (change.kind==="A" && change.item.kind==="D") {
            change.modificationType = "Item Deleted";
            change.newValue = this.stringify(change.item.lhs);
        }            
        if (change.kind==="D") {
            change.modificationType = "Item Deleted";
            change.previousValue = this.stringify(change.lhs);
        }                   
        if (change.path[0] === "classification") {
            change.fieldName = "Classification";
            if (change.item && change.item.lhs) change.newValue = this.stringifyClassif(change.item.lhs);
            if (change.item && change.item.rhs) change.newValue = this.stringifyClassif(change.item.rhs);
            return;
        }
        CdeDiffPopulate.pathFieldMap[change.path.length].forEach(function(pathPair){
            if (CdeDiffPopulate.comparePaths(pathPair.path, change.path)) change.fieldName = pathPair.fieldName;
        });
    };        
         
    return CdeDiffPopulate;
});