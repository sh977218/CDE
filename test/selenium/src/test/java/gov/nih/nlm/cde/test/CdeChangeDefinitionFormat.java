package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeChangeDefinitionFormat extends NlmCdeBaseTest {

    @Test
    public void changeDefinitionFormat() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String cdeName = "INSS";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-edit')]"));
        findElement(By.xpath("//*[@id='definition_0']//textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        textPresent("[def change: adding html characters][<b>bold</b>]");
        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-check')]"));
        newCdeVersion();

        textPresent("<b>bold</b>");
        clickElement(By.id("naming_tab"));
        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-edit')]"));
        clickElement(By.xpath("//*[@id='definition_0']//button[contains(text(),'Rich Text')]"));
        textPresent("Characters:");
        clickElement(By.xpath("//*[@id='definition_0']//*[contains(@class,'fa-check')]"));
        newCdeVersion();
        textNotPresent("<b>bold</b>");
    }

}
