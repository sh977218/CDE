package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class VMDefinitionTest extends NlmCdeBaseTest {

    @Test
    public void vmDefinitions() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Specimen Integrity Type SpecimenIntegrity");
        goToPermissibleValues();
        textPresent("Undamaged in any way; whole");
    }

}
