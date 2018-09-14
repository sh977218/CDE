package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class StatusValidationRenderTest extends BaseClassificationTest {
    @Test
    public void rulesRender(){
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName("Reg Status Lift");

        clickElement(By.id("rules_tab"));
        findElement(By.xpath("//div[@id='rule_Candidate_0']/mat-icon[. = 'check']"));

        findElement(By.xpath("//div[@id='rule_Recorded_0']/mat-icon[. = 'cancel']"));
        findElement(By.xpath("//div[@id='rule_Recorded_1']/mat-icon[. = 'cancel']"));
        findElement(By.xpath("//div[@id='rule_Recorded_2']/mat-icon[. = 'check']"));
        findElement(By.xpath("//div[@id='rule_Recorded_3']/mat-icon[. = 'cancel']"));


        findElement(By.xpath("//div[@id='rule_Qualified_0']/mat-icon[. = 'check']"));
        findElement(By.xpath("//div[@id='rule_Qualified_1']/mat-icon[. = 'check']"));
        findElement(By.xpath("//div[@id='rule_Qualified_2']/mat-icon[. = 'cancel']"));
    }
}
