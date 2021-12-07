package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormGeneralInfoTest extends BaseFormTest {

    @Test
    public void formGeneralInformationTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Section Inside Section Form");
        goToGeneralDetail();
        generalDetailsPropertyValueContains("Created:", "05/09/2016 @ 5:21PM");
        generalDetailsPropertyValueContains("Updated:", "05/11/2016 @ 11:11AM");
        generalDetailsPropertyValueContains("Created By:", "testAdmin");
        generalDetailsPropertyValueContains("Updated By:", "testAdmin");
    }

    @Test
    public void formGeneralInformationLoggedOutTest() {
        goToFormByName("Section Inside Section Form");
        goToGeneralDetail();
        generalDetailsPropertyValueContains("Created:", "05/09/2016 @ 5:21PM");
        generalDetailsPropertyValueContains("Updated:", "05/11/2016 @ 11:11AM");
        textNotPresent("Created By:", By.xpath(xpathGeneralDetailsProperty()));
        textNotPresent("Updated By:", By.xpath(xpathGeneralDetailsProperty()));
    }

}
