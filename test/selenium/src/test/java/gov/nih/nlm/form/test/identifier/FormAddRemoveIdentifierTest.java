package gov.nih.nlm.form.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddRemoveIdentifierTest extends NlmCdeBaseTest {
    @Test
    void formAddRemoveIdentifier() {
        String formName = "Vision Deficit Report";
        mustBeLoggedInAs(nlm_username, nlm_password);

        goToIdSources();
        addIdSource("test2",
                "http://cde.nlm.nih.gov/deView?tinyId={{id}}&version={{version}}",
                "http://cde.nlm.nih.gov/formView?tinyId={{id}}&version={{version}}");

        logout();
        mustBeLoggedInAs(ctepCurator_username, password);

        goToFormByName(formName);
        goToIdentifiersForm();

        addNewIdentifier("PhenX", "MyId1", "MyVersion1");
        addNewIdentifier("caDSR", "MyId2");
        addNewIdentifier("test2", "MyId3", "MyVersion3");

        // remove MyId2
        clickElement(By.id("removeIdentifier-1"));
        clickElement(By.id("confirmRemoveIdentifier-1"));

        goToFormByName(formName);

        goToIdentifiersForm();
        textPresent("MyId1");
        textPresent("PhenX");
        textPresent("MyVersion1");

        textPresent("MyId3");
        textPresent("test2");
        textPresent("MyVersion3");

        textNotPresent("MyId2");
        textNotPresent("caDSR");
    }
}
