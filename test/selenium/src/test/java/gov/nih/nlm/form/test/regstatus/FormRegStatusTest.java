package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.common.test.RegStatusTest;
import org.testng.annotations.Test;

public class FormRegStatusTest extends RegStatusTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }       

    @Test
    public void cancelRegStatus() {
        cancelRegStatus("AED Resistance Log", ninds_username);
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
