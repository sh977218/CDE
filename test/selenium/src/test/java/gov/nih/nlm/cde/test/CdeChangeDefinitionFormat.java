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
        clickElement(By.cssSelector("#dd_def_0 .fa-edit"));
        findElement(By.cssSelector("#dd_def_0 textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        clickElement(By.cssSelector("#dd_def_0 .fa-check"));
        newCdeVersion();

        textPresent("<b>bold</b>");
        clickElement(By.id("naming_tab"));
        clickElement(By.cssSelector("#dd_def_0 .fa-edit"));
        clickElement(By.xpath("//div[@id='dd_def_0']//button[contains(text(),'Rich Text')]"));
        hangon(2);
        clickElement(By.xpath("//div[@id='dd_def_0']//button[@class='fa fa-check']"));
        newCdeVersion();
        textNotPresent("<b>bold</b>");
    }

}
