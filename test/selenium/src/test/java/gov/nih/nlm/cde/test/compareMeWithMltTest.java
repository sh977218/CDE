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
        clickElement(By.xpath("//*[@id='mltAccordion']//div[@class='card']/div[span[contains(.,'Common Toxicity Criteria Adverse Event Platelet Count Grade')]]//i[@title='Add to Quick Board']"));
        checkAlert("Added to QuickBoard");
        clickElement(By.id("closeMoreLikeThisBtn"));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));
        textPresent("in CTC category Blood/Bone Marrow",
                By.xpath(getSideBySideXpath("left", "naming", "notmatch", 1)));
        textPresent("CTC Adverse Event Platelets Grade",
                By.xpath(getSideBySideXpath("right", "naming", "notmatch", 2)));
    }

}