package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class AdminCantEditStandard extends CdeStandardStatusTest {

    @Test(priority = -1)
    public void adminCantEditStandard() {
        adminCantEditStandardCde("Patient Visual Change", "Standard");
    }

}
