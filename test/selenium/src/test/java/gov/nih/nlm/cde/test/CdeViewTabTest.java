package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.testng.annotations.Test;

public class CdeViewTabTest extends ViewTabTest {
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void cdeViewTabTest() {
        showHideAllTabTest("ImgTagTest");
    }
}
