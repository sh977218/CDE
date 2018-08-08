package gov.nih.nlm.ie;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class CreateCdeTest extends NlmCdeBaseTest {

    private gov.nih.nlm.cde.test.CreateCde parentTest = new gov.nih.nlm.cde.test.CreateCde();

    @Test
    @SelectBrowser
    public void createCdeOnIE() {
        parentTest.createCde("Create Cde Name on IE", false);
    }

    @Test
    public void createCdeOnChrome() {
        parentTest.createCde("Create Cde Name on Chrome", false);
    }

}
