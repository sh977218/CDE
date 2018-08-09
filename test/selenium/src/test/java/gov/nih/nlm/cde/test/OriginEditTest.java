package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OriginEditTest extends NlmCdeBaseTest {

    void originEdit() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Person Gender Text Type");
        String origin = "this is new origin.";
        clickElement(By.xpath("//*[@id='origin']/span/span/i"));
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='origin']/span/form/input")).clear();
        findElement(By.xpath("//*[@id='origin']/span/form/input")).sendKeys(origin);
        clickElement(By.xpath("//*[@id='origin']/span/form/button[1]"));
        clickElement(By.id("openSave"));

        findElement(By.xpath("//*[@id='version']")).sendKeys(".1");
        hangon(1);
        clickElement(By.id("confirmNewVersion"));
        checkAlert("Saved.");
        String newOrigin = findElement(By.cssSelector("#origin > span > span")).getText();

        Assert.assertEquals(origin, newOrigin);
    }
}






