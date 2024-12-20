package gov.nih.nlm.cde.test.concepts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveConcepts extends NlmCdeBaseTest {

    @Test
    public void removeConcepts() {
        String cdeName = "ConceptCDE";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToConcepts();
        textPresent("DEC1");
        textPresent("DEC_ID_1");
        textPresent("DEC2");
        textPresent("DEC_ID_2");
        textPresent("DEC3");
        textPresent("DEC_ID_3");

        textPresent("OC1");
        textPresent("OC_ID_1");
        textPresent("OC2");
        textPresent("OC_ID_2");
        textPresent("OC3");
        textPresent("OC_ID_3");

        textPresent("Prop1");
        textPresent("Prop_ID_1");
        textPresent("Prop2");
        textPresent("Prop_ID_2");
        textPresent("Prop3");
        textPresent("Prop_ID_3");

        removeDataElementConcept(1);
        removeObjectClassConcept(1);
        removePropertyConcept(1);

        textPresent("DEC1");
        textPresent("DEC_ID_1");
        textNotPresent("DEC2");
        textNotPresent("DEC_ID_2");
        textPresent("DEC3");
        textPresent("DEC_ID_3");

        textPresent("OC1");
        textPresent("OC_ID_1");
        textNotPresent("OC2");
        textNotPresent("OC_ID_2");
        textPresent("OC3");
        textPresent("OC_ID_3");

        textPresent("Prop1");
        textPresent("Prop_ID_1");
        textNotPresent("Prop2");
        textNotPresent("Prop_ID_2");
        textPresent("Prop3");
        textPresent("Prop_ID_3");
    }

}
