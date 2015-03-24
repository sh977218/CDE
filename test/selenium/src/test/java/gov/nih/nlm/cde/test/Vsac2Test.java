package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class Vsac2Test extends NlmCdeBaseTest {

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

    @Test(dependsOnMethods = {"importVsacValues"})
    public void modifyValueCode() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-valid")));
        findElement(By.cssSelector("#pvName-4 .fa-edit")).click();
        findElement(By.cssSelector("#pvName-4 input.typeahead")).sendKeys(" Category");
        findElement(By.cssSelector("#pvName-4 .fa-check")).click();
        hangon(1);
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-warning")));

        findElement(By.cssSelector("#pvCode-4 .fa-edit")).click();
        findElement(By.cssSelector("#pvCode-4 input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCode-4 .fa-check")).click();

        findElement(By.cssSelector("#pvCodeSystem-4 .fa-edit")).click();
        findElement(By.xpath("//td[@id='pvCodeSystem-4']//input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCodeSystem-4 .fa-check")).click();

        newCdeVersion("Modified VS Codes");

        goToCdeByName("Patient Race Category");

        Assert.assertTrue(textPresent("Other Race Category"));
        Assert.assertTrue(textPresent("2131-1.1"));
        Assert.assertTrue(textPresent("CDCREC.1"));
    }
}
