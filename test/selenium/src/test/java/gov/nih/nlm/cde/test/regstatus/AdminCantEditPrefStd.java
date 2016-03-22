package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class AdminCantEditPrefStd extends CdeStandardStatusTest {

    @Test
    public void adminCantEditStandard() {
        adminCantEditStandardCde("Identifier Primary Flag java.lang.Boolean");
    }

}
