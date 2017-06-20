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
        clickElement(By.id("naming_tab"));
        editDefinitionByIndex(0, definitionChange, false);
        newCdeVersion();

        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-edit')]"));
        clickElement(By.xpath( "//*[@id='definition_0']//button[contains(text(),'Rich Text')]"));

        hangon(2);
        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-check')]"));
        textNotPresent("Confirm");

        newCdeVersion();

        textPresent("html characters][bold]");

    }

}
