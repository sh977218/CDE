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
        clickElement(By.cssSelector("#dd_def .fa-edit"));
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        clickElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']"));
        newCdeVersion();

        textPresent("<b>bold</b>");
        clickElement(By.cssSelector("#dd_def .fa-edit"));
        clickElement(By.xpath("//dd[@id='dd_def']//button[contains(text(),'Rich Text')]"));
        hangon(2);
        clickElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']"));
        newCdeVersion();
        textNotPresent("<b>bold</b>");
    }

}
