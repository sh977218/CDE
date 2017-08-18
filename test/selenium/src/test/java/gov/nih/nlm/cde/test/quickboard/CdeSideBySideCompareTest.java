package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSideBySideCompareTest extends NlmCdeBaseTest {

    @Test
    public void cdeSideBySideCompare() {
        String cdeName1 = "cdeCompare1";
        String cdeName2 = "cdeCompare2";
        mustBeLoggedInAs(testAdmin_username, password);
        addCdeToQuickBoard(cdeName1);
        addCdeToQuickBoard(cdeName2);
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("TEST", By.xpath(getSideBySideXpath("left", "steward", "fullmatch", 1)));
        textPresent("TEST", By.xpath(getSideBySideXpath("right", "steward", "fullmatch", 1)));
        textPresent("Incomplete", By.xpath(getSideBySideXpath("left", "status", "fullmatch", 1)));
        textPresent("Incomplete", By.xpath(getSideBySideXpath("right", "status", "fullmatch", 1)));

        textPresent("cdeCompare2", By.xpath(getSideBySideXpath("left", "naming", "notmatch", 1)));
        textPresent("cdeCompare1", By.xpath(getSideBySideXpath("right", "naming", "notmatch", 1)));

        textPresent("reference document title 2", By.xpath(getSideBySideXpath("left", "reference documents", "notmatch", 1)));
        textPresent("reference document title 1", By.xpath(getSideBySideXpath("right", "reference documents", "notmatch", 1)));

        textNotPresent("key 2", By.xpath(getSideBySideXpath("left", "properties", "notmatch", 1)));
        textPresent("key 1", By.xpath(getSideBySideXpath("right", "properties", "notmatch", 1)));

        textPresent("concept name 2", By.xpath(getSideBySideXpath("left", "data element concept", "notmatch", 1)));
        textPresent("concept name 21", By.xpath(getSideBySideXpath("right", "data element concept", "notmatch", 1)));
        clickElement(By.id("closeModal"));

        clickElement(By.id("qb_de_empty"));
        textPresent("CDE QuickBoard (0)");
    }

}
