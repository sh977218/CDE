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
        goToCdeSummary();
        editRegistrationStatus("Retired", null, null, null, null);
        goToCdeByName(cdeName);
        newCdeVersion();
        textPresent("Warning: This data element is retired.");
    }


    @Test
    public void retiredFormById() {
        String formName = "PTSD Checklist - Civilian (PCL-C)";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToGeneralDetail();
        editRegistrationStatus("Retired", null, null, null, null);
        goToFormByName(formName);
        newFormVersion();
        textPresent("Warning: This form is retired.");
    }

}