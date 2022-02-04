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
        goToCdeSearch();
        clickElement(By.id("browseOrg-CIP"));
        clickElement(By.linkText("Patient Ethnic Group Category"));
        clickElement(By.id("validateAgainstUMLS"));
        textPresent("UMLS Validation Passed");
    }
}
