package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class compareMeWithMltTest extends NlmCdeBaseTest {

    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        clickElement(By.id("addToQuickBoard"));
        textPresent("Added to QuickBoard");
        closeAlert();

        clickElement(By.id("cdeMoreLikeThisBtn"));
        textPresent("Common Toxicity Criteria Adverse Event Platelet Count Grade");
        clickElement(By.id("addToCompare_0"));
        textPresent("Added to QuickBoard");
        closeAlert();

        clickElement(By.id("closeMoreLikeThisBtn"));
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("in CTC category Blood/Bone Marrow");
        textPresent("CTC Adverse Event Platelets Grade");
    }

}