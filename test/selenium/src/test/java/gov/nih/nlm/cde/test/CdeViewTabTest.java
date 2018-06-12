package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.testng.annotations.Test;

public class CdeViewTabTest extends ViewTabTest {
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test(priority = 5)
    public void cdeViewTabTest() {
        showHideAllTabTest("ImgTagTest");
    }
}
