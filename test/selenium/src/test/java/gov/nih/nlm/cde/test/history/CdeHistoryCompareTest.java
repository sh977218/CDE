package gov.nih.nlm.cde.test.history;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeHistoryCompareTest extends NlmCdeBaseTest {
    @Test
    public void cdeHistoryCompare() {
        String cdeName = "Eyes affect productivity";
        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("testing");
    }
}
