package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeValidRuleTest extends NlmCdeBaseTest {
    @Test
    public void cdeValidRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        addCdeToQuickBoard("Disability Rating Scale (DRS) - Grooming disability scale");
        hangon(1);
        addCdeToQuickBoard("Disability Rating Scale (DRS) - Function level scale");
        hangon(1);
        goToCdeByName("DRS Total Score");

        goToScoreDerivations();
        clickElement(By.id("addNewScore"));
        textPresent("All 2 CDEs in your quickboard.");
        findElement(By.id("newDerivationRule.name")).sendKeys("DRS Score");
        clickElement(By.id("createDerivationRule"));
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        newCdeVersion();
        clickElement(By.partialLinkText("Disability Rating Scale (DRS) - Function level scale"));
        textPresent("This Data Element is used to derive to the following Data Elements:");
        clickElement(By.linkText("DRS Total Score"));
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        textNotPresent("Add Score");
        clickElement(By.id("removeDerivationRule-0"));
        newCdeVersion();
    }
}
