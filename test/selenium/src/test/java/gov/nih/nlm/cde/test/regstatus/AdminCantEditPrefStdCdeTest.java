package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class AdminCantEditPrefStdCdeTest extends CdeStandardStatusTest {

    @Test
    public void adminCantEditPrefStdCde() {
        String cdeName = "Pattern Transfer Retrieval Storage Data Research Activity Consortium or Network Or Professional Organization or Group Funding Mechanism FundingMechanismCode";
        adminCantEditStandardCde(cdeName);
    }

}
