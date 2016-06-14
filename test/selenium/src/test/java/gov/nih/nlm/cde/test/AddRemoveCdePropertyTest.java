package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.testng.annotations.Test;

public class AddRemoveCdePropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void addRemoveCdeProperty() {
        addRemoveProperty("Test CDE Properties", null);
    }

}
