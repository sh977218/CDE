package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FindRetiredById extends NlmCdeBaseTest {
    @Test
    public void retiredCdeById() {
        String cdeName = "Skull fracture anatomic site";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToGeneralDetail();
        editRegistrationStatus("Retired", null, null, null, null);
        textPresent("Data Element saved.");
        closeAlert();
        textPresent("Warning: this data element is retired.");
    }


    @Test
    public void retiredFormById() {
        String formName = "PTSD Checklist - Civilian (PCL-C)";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToGeneralDetail();
        editRegistrationStatus("Retired", null, null, null, null);
        textPresent("Form saved.");
        closeAlert();
        textPresent("Warning: this form is retired.");
    }

}