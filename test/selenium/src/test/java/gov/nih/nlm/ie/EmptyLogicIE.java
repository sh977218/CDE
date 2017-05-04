package gov.nih.nlm.ie;

import gov.nih.nlm.form.test.logic.EmptyLogic;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class EmptyLogicIE extends NlmCdeBaseTest {

    private EmptyLogic parentTest = new EmptyLogic();

    @Test
    @SelectBrowser
    public void noLabelLogicIE() {
        parentTest.emptyLogic();
    }

}
