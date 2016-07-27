package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class StatusValidationRenderTest extends BaseClassificationTest {
    @Test
    public void rulesRender(){
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName("Reg Status Lift");
        showAllTabs();
        findElement(By.id("status_tab")).click();
        findElement(By.cssSelector("#rule_Candidate_0 .fa-check"));

        findElement(By.cssSelector("#rule_Recorded_0 .fa-times"));
        findElement(By.cssSelector("#rule_Recorded_1 .fa-times"));
        findElement(By.cssSelector("#rule_Recorded_2 .fa-check"));
        findElement(By.cssSelector("#rule_Recorded_3 .fa-times"));

        findElement(By.cssSelector("#rule_Qualified_0 .fa-check"));
        findElement(By.cssSelector("#rule_Qualified_1 .fa-check"));
        findElement(By.cssSelector("#rule_Qualified_2 .fa-times"));
    }

    @Test
    public void exportValidRules(){
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        textPresent("Incomplete");
        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
        textPresent("Distance from Closest Margin");
        textPresent("Neoadjuvant Therapy Specify");
    }

    @Test
    public void setValidRules(){
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.id("user_org_authority")).click();
        findElement(By.linkText("Status Validation Rules")).click();
        findElement(By.id("addRule")).click();

        new Select(driver.findElement(By.id("org"))).selectByVisibleText("TEST");
        findElement(By.id("ruleName")).sendKeys("Test Rule #1");
        new Select(driver.findElement(By.id("field"))).selectByVisibleText("properties.key");
        new Select(driver.findElement(By.id("targetStatus"))).selectByVisibleText("Recorded");
        findElement(By.id("regex")).sendKeys("non-existent");
        new Select(driver.findElement(By.id("occurence"))).selectByVisibleText("All Elements");
        findElement(By.id("saveRule")).click();
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();

        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
        textPresent("Test Rule #1");
    }
}
