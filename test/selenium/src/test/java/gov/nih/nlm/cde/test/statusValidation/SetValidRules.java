package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class SetValidRules extends BaseClassificationTest {
    @Test
    public void setValidRules(){
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.id("user_org_authority")).click();
        findElement(By.linkText("Status Validation Rules")).click();
        findElement(By.id("addRule")).click();
        new Select(findElement(By.id("org"))).selectByVisibleText("TEST");
        findElement(By.id("ruleName")).sendKeys("Test Rule #1");
        new Select(findElement(By.id("field"))).selectByVisibleText("properties.key");
        new Select(findElement(By.id("targetStatus"))).selectByVisibleText("Recorded");
        findElement(By.id("regex")).sendKeys("non-existent");
        new Select(driver.findElement(By.id("occurence"))).selectByVisibleText("All Elements");
        findElement(By.id("saveRule")).click();
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        findElement(By.id("pinAll"));
        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
        textPresent("Test Rule #1");
    }
}
