package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeChangeDefinitionFormat extends NlmCdeBaseTest {

    @Test
    public void cdeChangeDefinitionFormat() {
        String cdeName = "Patient Newly Diagnosed INSS Stage 4 Neuroblastoma With Unfavorable Feature Eligibility Criteria Yes No Indicator";
        String definitionChange = "[def change: adding html characters][<b>bold</b>]";

        mustBeLoggedInAs(ctepEditor_username, password);
        goToCdeByName(cdeName);
        goToNaming();
        editDefinitionByIndex(0, definitionChange, false);
        newCdeVersion();

        clickElement(By.xpath("//*[@itemprop='definition_0']//mat-icon[normalize-space() = 'edit']"));
        clickElement(By.xpath("//*[@itemprop='definition_0']//button[. = 'Rich Text']"));
        hangon(1);
        clickElement(By.xpath("//*[@itemprop='definition_0']//button/mat-icon[normalize-space() = 'check']"));
        textNotPresent("Confirm");

        newCdeVersion();

        textPresent("html characters][bold]");

    }

}
