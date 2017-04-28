package gov.nih.nlm.ie;

import gov.nih.nlm.cde.test.valueDomain.PvTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class ChangePvIE extends NlmCdeBaseTest {

    PvTest parentTest = new PvTest();

    @Test
    @SelectBrowser
    public void changePvIE() {
        parentTest.changePermissibleValue("Brain swelling indicator");
    }

}
