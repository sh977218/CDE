package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class NlmPromotesToStd extends CdeRegStatusTest {

    @Test
    public void nlmPromotesToStandard() {
        nlmPromotesToStandard("Axillary Surgery Dissection Date");
    }
}
