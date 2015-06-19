package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class Vsac2Test extends NlmCdeBaseTest {

    @Test
    public void importVsacValues() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Native Hawaiian or other Pacific Islander"));
        Assert.assertTrue(textNotPresent("Match"));
        findElement(By.id("removeAllPvs")).click();
        Assert.assertTrue(textNotPresent("Native Hawaiian or other Pacific Islander"));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.836");
        findElement(By.id("vsacIdCheck")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        findElement(By.id("addVsacValue-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        findElement(By.id("addAllVsac")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
        findElement(By.id("pvRemove-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));

        newCdeVersion("Importing All VSAC Values");


        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
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
        clickElement(By.cssSelector("#pvCodeSystem-4 .fa-check"));

        newCdeVersion("Modified VS Codes");

        goToCdeByName("Patient Race Category");

        findElement(By.linkText("Permissible Values")).click();

        textPresent("Other Race Category");
        textPresent("2131-1.1");
        textPresent("CDCREC.1");
    }
}