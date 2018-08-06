package gov.nih.nlm.ie;

import gov.nih.nlm.form.test.CreateForm;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class CreateFormTwoBrowsers extends NlmCdeBaseTest {

    private CreateForm parentTest = new CreateForm();

    @Test
    @SelectBrowser
    public void createFormOnIE() {
        parentTest.createForm("Create IEForm Name", false);
    }

    @Test
    public void createFormOnChrome() {
        parentTest.createForm("Create Chrome Form Name", false);
    }


}
