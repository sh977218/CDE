package gov.nih.nlm.ie;

import gov.nih.nlm.form.test.CreateForm;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class CreateFormIE extends NlmCdeBaseTest {
    private CreateForm parentTest = new CreateForm();

    @Test
    public void createFormIE() {
        parentTest.createForm("Create IEForm Name", false);
    }

}
