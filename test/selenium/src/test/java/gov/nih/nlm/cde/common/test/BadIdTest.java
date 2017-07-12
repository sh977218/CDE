package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BadIdTest extends NlmCdeBaseTest {

    @Test(priority = 5)
    public void badCdeId() {
        driver.get(baseUrl + "/deView?tinyId=thisisabogusid");
        textPresent("Sorry, we are unable to retrieve this element.");
    }

    @Test(priority = 5)
    public void badFormId() {
        driver.get(baseUrl + "/formView?tinyId=thisisabogusid");
        textPresent("Sorry, we are unable to retrieve this element.");
    }

}