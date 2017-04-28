package gov.nih.nlm.ie;

import gov.nih.nlm.form.test.logic.NoLabelLogic;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class NoLabelLogicIE extends NlmCdeBaseTest {

    NoLabelLogic parentTest = new NoLabelLogic();

    @Test
    @SelectBrowser
    public void noLabelLogicIE() {
        parentTest.noLabelLogic();
    }

}
