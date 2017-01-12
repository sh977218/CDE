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

        findElement(By.linkText("Validation Rules")).click();
        findElement(By.cssSelector("#rule_Candidate_0 .fa-check"));

        findElement(By.cssSelector("#rule_Recorded_0 .fa-times"));
        findElement(By.cssSelector("#rule_Recorded_1 .fa-times"));
        findElement(By.cssSelector("#rule_Recorded_2 .fa-check"));
        findElement(By.cssSelector("#rule_Recorded_3 .fa-times"));

        findElement(By.cssSelector("#rule_Qualified_0 .fa-check"));
        findElement(By.cssSelector("#rule_Qualified_1 .fa-check"));
        findElement(By.cssSelector("#rule_Qualified_2 .fa-times"));
    }
}
