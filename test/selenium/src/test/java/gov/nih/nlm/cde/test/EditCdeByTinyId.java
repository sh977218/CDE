package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditCdeByTinyId extends NlmCdeBaseTest {

    @Test
    public void editCdeByTinyId() {
        mustBeLoggedInAs(ctepCurator_username, password);
        driver.get(baseUrl + "/deview?tinyId=xNugcDxoqKW");
        clickElement(By.id("naming_tab"));
        findElement(By.cssSelector("#dd_name_0 i.fa-edit")).click();
        findElement(By.cssSelector("#dd_name_0 input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        newCdeVersion("Change note for change number 1");
        driver.get(baseUrl + "/deview?tinyId=xNugcDxoqKW");
        textPresent("General Details");
        textPresent("[name change number 1]");
    }

}
