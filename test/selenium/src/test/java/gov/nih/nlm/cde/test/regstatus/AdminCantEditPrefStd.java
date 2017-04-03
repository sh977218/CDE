package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class AdminCantEditPrefStd extends CdeStandardStatusTest {

    @Test
    public void adminCantEditStandard() {
        String cdeName = "Pattern Transfer Retrieval Storage Data Research Activity Consortium or Network Or Professional Organization or Group Funding Mechanism FundingMechanismCode";
        adminCantEditStandardCde(cdeName);
    }

}
