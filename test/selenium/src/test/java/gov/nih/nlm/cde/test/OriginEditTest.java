package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OriginEditTest extends NlmCdeBaseTest {

    @Test
    void originEdit() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Person Gender Text Type");
        String origin = "this is new origin.";
        findElement(By.xpath("//*[@id=\"origin\"]/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//*[@id=\"origin\"]/span/form/input")).clear();
        findElement(By.xpath("//*[@id=\"origin\"]/span/form/input")).sendKeys(origin);
        findElement(By.xpath("//*[@id=\"origin\"]/span/form/button[1]")).click();
        findElement(By.id("openSave")).click();

        findElement(By.xpath("//*[@id=\"ng-app\"]/body/div[4]/div/div/form/div[1]/div[2]/input")).sendKeys(".1");
        hangon(1);
        findElement(By.id("confirmNewVersion")).click();
        textPresent("Saved.");
        closeAlert();
        String newOrigin = findElement(By.cssSelector("#origin > span > span")).getText();

        Assert.assertEquals(origin, newOrigin);


    }
}






