package gov.nih.nlm.ie;

import gov.nih.nlm.cde.test.permissibleValue.PvTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;

public class ChangePvIE extends NlmCdeBaseTest {

    PvTest parentTest = new PvTest();

//    @Test
    @SelectBrowser
    public void changePvIE() {
        parentTest.changePermissibleValue("Brain swelling indicator");
    }

}
