@Grab(group='org.mongodb', module='mongo-java-driver', version='2.11.1')

import com.mongodb.*;
import com.mongodb.util.JSON;
import java.util.UUID;

//@Field DBCollection orgColl = db.getCollection("orgs");

public class Classifications {
    DBCollection orgColl;
    public Classifications(DBCollection org){
        orgColl = org;
    }
    def saveClassif = { newClassif ->
        def orgObject = orgColl.findOne(new BasicDBObject("name", newClassif.get("stewardOrg").get("name")));
        if (orgObject == null) {
            println("Missing Org: " + newClassif.get("stewardOrg").get("name")+"\nCreating new one.");
            def newOrg = new BasicDBObject();
            newOrg.put("name",newClassif.get("stewardOrg").get("name"));
            orgColl.insert(newOrg);
            orgObject = orgColl.findOne(new BasicDBObject("name", newClassif.get("stewardOrg").get("name")));
        }            
        def foundOrg = orgObject;    
        def foundConceptSystem = false;
        def foundConcept = false;

        def classifications = foundOrg.get("classifications");
        if (classifications == null) {
            foundOrg.put("classifications", []);
        }
        for (BasicDBObject existingClassif : classifications) {
            if (existingClassif.get("name").equals(newClassif.get("conceptSystem"))) {
                foundConceptSystem = true;
                def existingConcepts = existingClassif.get("elements");
                for (BasicDBObject existingConcept : existingConcepts) {
                    if (existingConcept.get("name").equals(newClassif.get("concept"))) {
                        foundConcept = true;
                    }
                }
                if (!foundConcept) {
                    existingConcepts.add(new BasicDBObject("name",newClassif.get("concept")));
                    existingClassif.append("elements", existingConcepts);
                }
            }            
        }
        if (!foundConceptSystem) {
            def conceptSystem = new BasicDBObject("name",newClassif.get("conceptSystem"));
            conceptSystem.put("elements",[new BasicDBObject("name",newClassif.get("concept"))]);
            def existingClassifications = foundOrg.get("classifications");
            existingClassifications.add(conceptSystem);
            foundOrg.append("classifications", existingClassifications);            
        }
        orgColl.update(new BasicDBObject("name", newClassif.get("stewardOrg").get("name")), foundOrg);
    };

    def buildClassif = {conceptSystem, concept, stewardOrgName ->
        def newClassif = new BasicDBObject();
        newClassif.put("conceptSystem", conceptSystem)
        newClassif.put("concept", concept)
        newClassif.put("stewardOrg", new BasicDBObject("name", stewardOrgName));
        newClassif;
    }

    def classify (ArrayList<BasicDBObject> classificationArray, String stewardOrgName, String conceptSystem, String concept) {
        def classif = buildClassif(conceptSystem, concept, stewardOrgName);
        saveClassif(classif);
        def conceptObj = new BasicDBObject();
        conceptObj.put("name",concept);  
        conceptObj.put("elements",[]); 
        def existed = false;
        for (int i=0; i<classificationArray.size(); i++) {
            def classification = classificationArray.get(i);
            if (classification.get("name")==conceptSystem) {
                def elements = classification.get("elements");
                elements.add(conceptObj);
                classification.put("elements",elements);
                existed = true;            
            }
        }
        if (!existed) {
            def conceptSystemObj =  new BasicDBObject();
            conceptSystemObj.put("name", conceptSystem);
            conceptSystemObj.put("elements", [conceptObj]);
            classificationArray.add(conceptSystemObj);
        }
    }
    
    def BasicDBObject buildStewardClassifictions (ArrayList<BasicDBObject> stewardClassificationsArray, String stewardOrgName){
        def stewardClassification = new BasicDBObject();
        stewardClassification.put("stewardOrg", new BasicDBObject("name", stewardOrgName));
        stewardClassification.put("elements",stewardClassificationsArray);
        stewardClassification;
    }        
    
}