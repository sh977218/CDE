package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.common.test.RegStatusTest;
import org.testng.annotations.Test;

public class FormRegStatus extends RegStatusTest {

    @Override
    public void goToEltByName(String name) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }       
    
    @Test
    public void changeRegistrationStatus() {
        changeRegistrationStatus("Form Status Test", ctepCurator_username);
    }
        
    @Test
    public void retire() {
        retire("Form Retire Test", ctepCurator_username);
    }

    @Test
    public void nlmPromotesToStandard() {
        nlmPromotesToStandard("Form Standard Test");
    }
    
}