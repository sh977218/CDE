package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class CdeRegStatusTest3 extends CdeRegStatusTest {

    @Test
    public void cancelRegStatus() {
        cancelRegStatus("Form Form Element Administered Item Modified By java.lang.String", cabigAdmin_username);
    }   
    
    @Test
    public void cantEditStatusIfPendingChanges() {
        cantEditStatusIfPendingChanges("Form Form Element Administered Item Modified By java.lang.String", cabigAdmin_username);        
    }
    
    @Test
    public void changeRegistrationStatus() {
        changeRegistrationStatus("Investigator Identifier java.lang.Integer", cabigAdmin_username);
    }
        
    @Test
    public void retire() {
        retire("Laboratory Procedure Alkaline Phosphatase Result Date", ctepCurator_username);
    }
    
}
