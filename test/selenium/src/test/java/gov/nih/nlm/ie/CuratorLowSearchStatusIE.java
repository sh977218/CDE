package gov.nih.nlm.ie;

import gov.nih.nlm.cde.test.search.CuratorLowStatusSearch;
import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.testng.annotations.Test;

public class CuratorLowSearchStatusIE extends NlmCdeBaseTest {

    CuratorLowStatusSearch parentTest = new CuratorLowStatusSearch();

    @Test
    @SelectBrowser
    public void curatorLowSearchStatusIE() {
        parentTest.curatorLowStatusSearch();
    }

}
