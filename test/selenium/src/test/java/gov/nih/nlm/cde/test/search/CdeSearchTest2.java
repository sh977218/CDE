package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeSearchTest2 extends NlmCdeBaseTest {
    
    @Test
    public void StandardStatusWarningCheck() {
        // Check that a none Standard or Preferred Standard CDE doesn't have warning message when not logged in
        goToCdeByName("Specimen Collection Sampling Number");
        textNotPresent("Note: You may not edit this CDE because it is standard.");

        // Check that a Standard CDE doesn't have warning message when viewed by non logged user
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        textNotPresent("Note: You may not edit this CDE because it is standard.");
        
        // Check that a Standard CDE doesn't have warning message when viewed by site admin
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        textNotPresent("Note: You may not edit this CDE because it is standard.");
        
        // Check that a Standard CDE have warning message
        logout();
        mustBeLoggedInAs(ctepEditor_username, password);
        goToCdeByName("Person Birth Date");
        textPresent("Note: You may not edit this CDE because it is standard.");
    }

}
