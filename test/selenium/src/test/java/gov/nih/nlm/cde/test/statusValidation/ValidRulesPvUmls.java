package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValidRulesPvUmls extends NlmCdeBaseTest {
    @Test
    public void validRulesPvUmls(){
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToValidationRules();
        clickElement(By.id("addRule"));
        textPresent("Field matches regular expression");
        hangon(1);
        new Select(findElement(By.id("org"))).selectByVisibleText("CIP");
        findElement(By.id("ruleName")).sendKeys("Pv Umls");
        new Select(findElement(By.id("targetStatus"))).selectByVisibleText("Incomplete");
        new Select(findElement(By.id("field"))).selectByVisibleText("valueDomain.permissibleValues");
        textNotPresent("Field matches regular expression");
        clickElement(By.xpath("//label[.//input[@name='customPvUmls']]"));
        clickElement(By.id("saveRule"));
        goToCdeSearch();
        clickElement(By.id("browseOrg-CIP"));
        findElement(By.id("pinAll"));
        clickElement(By.id("export"));
        clickElement(By.id("exportValidRule"));
        clickElement(By.id("selectStatus"));
        clickElement(By.xpath("//*[contains(@class,'mat-option-text') and contains(.,'Incomplete')]"));
        clickElement(By.id("exportVR"));
        textNotPresent("Validation finished with Errors");
        textPresent("Pv Umls");
        int numberResults = driver.findElements(By.xpath("//tr[td]")).size();
        textPresent("bzGjaFPtQCs");
        textPresent("eAKm4RYdgeB");
        // possibly HvzRPSbkUgc
        Assert.assertTrue(numberResults == 2 || numberResults == 3, "2 or 3 depending on test order, but got " + numberResults);
    }
}
