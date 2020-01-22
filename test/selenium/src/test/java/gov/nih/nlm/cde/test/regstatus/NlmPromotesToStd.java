package gov.nih.nlm.cde.test.regstatus;

import org.testng.annotations.Test;

public class NlmPromotesToStd extends CdeRegStatusTest {

    @Test
    public void nlmPromotesToStandardCde() {
        nlmPromotesToStandard("Axillary Surgery Dissection Date");
    }
}
