package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RemoveVsacIdTest extends NlmCdeBaseTest {
    @Test
    public void removeVsacId() {
        String cdeName = "Left Colon Excision Ind-2";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("updateOIDBtn"));
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        clickElement(By.id("vsacIdCheck"));
        textPresent("2135-2");
        textPresent("2186-5");
        newCdeVersion();
        hangon(1);
        clickElement(By.id("removeVSButton"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("2.16.840.1.114222.4.11.837"), -1);
        newCdeVersion();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
    }
}
