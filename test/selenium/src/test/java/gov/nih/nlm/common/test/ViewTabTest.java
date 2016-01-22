package gov.nih.nlm.common.test;


import org.testng.annotations.Test;

public abstract class ViewTabTest extends CommonTest {

    @Test
    public void showHideAllTabTest(String eltName) {
        goToEltByName(eltName);
        showAllTabs();
        hideAllTabs();
    }
}
