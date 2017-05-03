package gov.nih.nlm.ie;

import gov.nih.nlm.form.test.logic.EmptyLogic;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class EmptyLogicIE extends NlmCdeBaseTest {

    EmptyLogic parentTest = new EmptyLogic();

    @Test
    @SelectBrowser
    @RecordVideo
    public void noLabelLogicIE() {
        parentTest.emptyLogic();
    }

}
