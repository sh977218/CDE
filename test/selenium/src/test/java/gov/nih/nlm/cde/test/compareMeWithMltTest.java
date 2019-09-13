package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class compareMeWithMltTest extends NlmCdeBaseTest {

    @Test
    public void compareMeWithMlt() {
        String cdeName = "Common Toxicity Criteria Adverse Event Iron Excess Grade";
        goToCdeByName(cdeName);
        clickElement(By.id("addToQuickBoard"));
        checkAlert("Added to QuickBoard!");
        clickElement(By.id("mltButton"));
        clickElement(By.xpath("//*[@id='mltAccordion']//div[contains(@class, 'card')]/div[span[contains(.,'Common Toxicity Criteria Adverse Event Platelet Count Grade')]]//mat-icon[@title='Add to Quick Board']"));
        clickElement(By.id("closeMoreLikeThisBtn"));
        checkAlert("Added to QuickBoard");
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde", true);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));
        textPresent("in CTC category Blood/Bone Marrow", By.xpath(getSideBySideXpath("left", "definition", "notmatch", 1)));
        textPresent("CTC Adverse Event Platelets Grade", By.xpath(getSideBySideXpath("right", "definition", "notmatch", 2)));
    }

}