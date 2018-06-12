package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class AdminCantEditStandardCdeTest extends CdeStandardStatusTest {

    @Test
    public void adminCantEditStandardCde() {
        adminCantEditStandardCde("Patient Visual Change Chief Complaint Indicator");
    }

}
