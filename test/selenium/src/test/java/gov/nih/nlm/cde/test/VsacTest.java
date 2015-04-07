
package gov.nih.nlm.cde.test;

import java.util.List;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class VsacTest extends NlmCdeBaseTest {
    @Test
    public void removeVsacId() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        closeAlert();

        textPresent("20121025");

        newCdeVersion();
        hangon(1);

        findElement(By.id("removeVSButton")).click();

        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("2.16.840.1.114222.4.11.837"), -1);

        newCdeVersion();


        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
    }

    @Test
    public void assignVsacId() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("No Value Set specified."));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("invalidId");
        findElement(By.id("vsacIdCheck")).click();
        Assert.assertTrue(textPresent("Invalid VSAC OID"));
        closeAlert();
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        // check that version got fetched.
        Assert.assertTrue(textPresent("20121025"));
        newCdeVersion("Adding vsac Id");

        Assert.assertTrue(textPresent("20121025"));
        Assert.assertTrue(textPresent("2135-2"));
        Assert.assertTrue(textPresent("CDCREC"));
        WebElement tbody = driver.findElement(By.id("vsacTableBody"));
        List<WebElement> vsacLines = tbody.findElements(By.tagName("tr"));
        Assert.assertEquals(vsacLines.size(), 2);
        Assert.assertTrue(textPresent("Match"));
    }

}