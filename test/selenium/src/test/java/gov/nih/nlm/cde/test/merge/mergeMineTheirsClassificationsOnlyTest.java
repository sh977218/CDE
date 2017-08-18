package gov.nih.nlm.cde.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class mergeMineTheirsClassificationsOnlyTest extends NlmCdeBaseTest {
    @Test
    public void mergeMineTheirsClassificationsOnly() {
        String cdeName1 = "Diagnosis Change Date java.util.Date";
        String cdeName2 = "Form Element End Date java.util.Date";
        mustBeLoggedInAs(cabigAdmin_username, password);
        addToCompare(cdeName1, cdeName2);
        clickElement(By.id("openMergeDataElementModalBtn"));
        clickElement(By.id("doMergeBtn"));
        clickElement(By.id("destinationElement"));
        switchTab(1);
        textPresent("caBIG");
        textPresent("caLIMS2");
        textPresent("gov.nih.nci.calims2.domain.inventory");
        switchTabAndClose(0);
    }
}
