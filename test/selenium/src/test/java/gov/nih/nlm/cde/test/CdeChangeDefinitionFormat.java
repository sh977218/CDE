package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeChangeDefinitionFormat extends NlmCdeBaseTest {

    @Test
    public void cdeChangeDefinitionFormat() {
        String cdeName = "Patient Newly Diagnosed INSS Stage 4 Neuroblastoma With Unfavorable Feature Eligibility Criteria Yes No Indicator";
        String definitionChange = "[def change: adding html characters][<b>bold</b>]";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        goToNaming();
        editDefinitionByIndex(0, definitionChange, false);
        newCdeVersion();

        changeDefinitionFormat(0, true);
        newCdeVersion();

        textPresent("html characters][bold]");

    }

}
