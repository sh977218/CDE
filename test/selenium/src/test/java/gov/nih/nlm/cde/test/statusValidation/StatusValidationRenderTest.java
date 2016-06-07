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
        elementVisible(By.id("incompletePossible"));
        elementVisible(By.id("candidatePossible"));
        elementVisible(By.id("recordedNotPossible"));
        elementVisible(By.id("qualifiedNotPossible"));
        elementVisible(By.id("standardNotPossible"));
        elementVisible(By.id("prefStandardNotPossible"));
    }
}
