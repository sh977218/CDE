package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditCdeByTinyId extends NlmCdeBaseTest {

    @Test
    public void editCdeByTinyId() {
        mustBeLoggedInAs(ctepCurator_username, password);
        driver.get(baseUrl + "/deview?tinyId=xNugcDxoqKW");
        findElement(By.cssSelector("#nameEdit i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        newCdeVersion("Change note for change number 1");
        driver.get(baseUrl + "/deview?tinyId=xNugcDxoqKW");
        textPresent("General Details");
        textPresent("[name change number 1]");
    }

}