package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FindRetiredById extends NlmCdeBaseTest {
    @Test
    public void retiredCdeById() {
        String cdeName = "Skull fracture anatomic site";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        editRegistrationStatus("Retired", null, null, null, null);
        textPresent("Data Element saved.");
        closeAlert();
        goToCdeByName(cdeName);
        textPresent("Warning: this data element is retired.");
    }


    @Test
    public void retiredFormById() {
        String formName = "PTSD Checklist - Civilian (PCL-C)";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        editRegistrationStatus("Retired", null, null, null, null);
        textPresent("Form saved.");
        closeAlert();
        goToFormByName(formName);
        textPresent("Warning: this form is retired.");
    }

}