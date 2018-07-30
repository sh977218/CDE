package gov.nih.nlm.ie;

import gov.nih.nlm.cde.test.CreateCdeTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class CreateCdeIE extends NlmCdeBaseTest {

    private CreateCdeTest parentTest = new CreateCdeTest();

    @Test
    @SelectBrowser
    public void createCdeIE() {
        parentTest.createCde("Create IECde Name", false);
    }

}
