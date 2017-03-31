package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeChangeDefinitionFormat extends NlmCdeBaseTest {

    @Test
    public void changeDefinitionFormat() {
        String cdeName = "Patient Newly Diagnosed INSS Stage 4 Neuroblastoma With Unfavorable Feature Eligibility Criteria Yes No Indicator";
        String definitionChange = "[def change: adding html characters][<b>bold</b>]";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        editDefinitionByIndex(0, definitionChange, false);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        switchDefinitionFormatByIndex(0, null, true);
        newCdeVersion();
    }

}
