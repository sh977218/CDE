package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class CdeRetire extends CdeRegStatusTest {

    @Test(priority = 2)
    public void retire() {
        retire("Laboratory Procedure Alkaline Phosphatase Result Date", ctepCurator_username);
    }

}