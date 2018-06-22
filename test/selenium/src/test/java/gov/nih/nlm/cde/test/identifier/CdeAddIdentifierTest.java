package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddIdentifierTest extends NlmCdeBaseTest {
    @Test
    public void cdeAddIdentifier() {
        String cdeName = "Prostatectomy Performed Date";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
         goToIdentifiers();
        addNewIdentifier("MyOrigin1", "MyId1", "MyVersion1");
        addNewIdentifier("MyOrigin2", "MyId2", null);

        goToCdeByName(cdeName);
         goToIdentifiers();
        textPresent("MyOrigin1");
        textPresent("MyId1");
        textPresent("MyVersion1");
        textPresent("MyOrigin2");
        textPresent("MyId2");
    }
}
