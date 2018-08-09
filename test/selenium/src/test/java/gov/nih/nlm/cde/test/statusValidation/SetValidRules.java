package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class SetValidRules extends BaseClassificationTest {
    @Test
    public void setValidRules() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_org_authority"));
        clickElement(By.linkText("Status Validation Rules"));
        clickElement(By.id("addRule"));
        new Select(findElement(By.id("org"))).selectByVisibleText("TEST");
        findElement(By.id("ruleName")).sendKeys("Test Rule #1");
        new Select(findElement(By.id("field"))).selectByVisibleText("properties.key");
        new Select(findElement(By.id("targetStatus"))).selectByVisibleText("Recorded");
        findElement(By.id("regex")).sendKeys("non-existent");
        new Select(driver.findElement(By.id("occurence"))).selectByVisibleText("All Elements");
        clickElement(By.id("saveRule"));
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        findElement(By.id("pinAll"));
        clickElement(By.id("export"));
        clickElement(By.id("exportValidRule"));
        clickElement(By.id("selectStatus"));
        clickElement(By.id("recorded"));
        clickElement(By.id("exportVR"));
        textPresent("Test Rule #1");
    }
}
