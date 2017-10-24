package gov.nih.nlm.form.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddRemoveIdentifierTest extends NlmCdeBaseTest {
    @Test
    void formAddRemoveIdentifier() {
        String formName = "Vision Deficit Report";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
         goToIdentifiers();

        addNewIdentifier("MyOrigin1", "MyId1", "MyVersion1");
        addNewIdentifier("MyOrigin2", "MyId2", null);
        addNewIdentifier("MyOrigin3", "MyId3", "MyVersion3");

        //remove MyOrigin2
        clickElement(By.id("removeIdentifier-1"));
        clickElement(By.id("confirmRemoveIdentifier-1"));

        goToFormByName(formName);

         goToIdentifiers();
        textPresent("MyOrigin1");
        textPresent("MyId1");
        textPresent("MyVersion1");
        textPresent("MyOrigin3");
        textPresent("MyId3");
        textPresent("MyVersion3");
        textNotPresent("MyOrigin2");
        textNotPresent("MyId2");
    }
}
