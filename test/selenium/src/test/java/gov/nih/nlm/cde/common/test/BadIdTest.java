package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BadIdTest extends NlmCdeBaseTest {

//    @Test
    public void badCdeId() {
        driver.get(baseUrl + "/#/deview?tinyId=thisisabogusid");
        textPresent("Sorry, we are unable to retrieve this element.");
        textPresent("The Repository is a platform for identifying");
    }

//    @Test
    public void badFormId() {
        driver.get(baseUrl + "/#/formView?tinyId=thisisabogusid");
        textPresent("Sorry, we are unable to retrieve this element.");
        textPresent("The Repository is a platform for identifying");
    }

}