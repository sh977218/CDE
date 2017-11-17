package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormGeneralInfoTest extends BaseFormTest {

    @Test
    public void formGeneralInformationTest() {
        goToFormByName("Section Inside Section Form");
        goToGeneralDetail();
        textPresent("Created:");
        textPresent("05/09/2016 @ 5:21PM");
        textPresent("Updated:");
        textPresent("05/11/2016 @ 11:11AM");
        textPresent("Created By:");
        textPresent("testAdmin");
    }

}
