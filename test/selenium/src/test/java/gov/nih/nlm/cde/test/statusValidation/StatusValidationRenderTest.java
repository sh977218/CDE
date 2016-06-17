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
        elementVisible(By.cssSelector("#rule_Candidate_0 .fa-check"));

        elementVisible(By.cssSelector("#rule_Recorded_0 .fa-times"));
        elementVisible(By.cssSelector("#rule_Recorded_1 .fa-times"));
        elementVisible(By.cssSelector("#rule_Recorded_2 .fa-check"));
        elementVisible(By.cssSelector("#rule_Recorded_3 .fa-times"));

        elementVisible(By.cssSelector("#rule_Qualified_0 .fa-check"));
        elementVisible(By.cssSelector("#rule_Qualified_1 .fa-check"));
        elementVisible(By.cssSelector("#rule_Qualified_2 .fa-times"));
    }

    @Test
    public void exportValidRules(){
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        hangon(2);
        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
    }
}
