package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddIdentifierTest extends NlmCdeBaseTest {
    @Test
    public void cdeAddIdentifier() {
        String cdeName = "Prostatectomy Performed Date";
        mustBeLoggedInAs(nlm_username, nlm_password);

        goToIdSources();

        addIdSource("test1",
                "http://cde.nlm.nih.gov/deView?tinyId={{id}}&version={{version}}",
                "http://cde.nlm.nih.gov/formView?tinyId={{id}}&version={{version}}");

        logout();
        mustBeLoggedInAs(ctepEditor_username, password);

        goToCdeByName(cdeName);
        goToIdentifiers();
        addNewIdentifier("PhenX", "MyId1", "MyVersion1");
        addNewIdentifier("test1", "MyId2");

        goToCdeByName(cdeName);
        goToIdentifiers();

        textPresent("MyId1");
        textPresent("PhenX");
        textPresent("MyVersion1");

        textPresent("MyId2");
        textPresent("test1");
    }
}
