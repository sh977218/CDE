package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.NamingTest;
import org.testng.annotations.Test;

public class CdeNamingTest extends NamingTest {
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void addRemoveEdit() {
        addRemoveEditTest();
    }

    @Test
    public void cdeReorderNaming() {
        reorderNamingTest("cde for test cde reorder detail tabs");
    }
}
