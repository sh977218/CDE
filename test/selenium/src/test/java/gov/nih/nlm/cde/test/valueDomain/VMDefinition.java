package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class VMDefinition extends NlmCdeBaseTest {

    @Test
    public void vmDefinitions() {
        goToCdeByName("Specimen Integrity Type SpecimenIntegrity");
        clickElement(By.id("pvs_tab"));
        textPresent("Undamaged in any way; whole");
    }

}