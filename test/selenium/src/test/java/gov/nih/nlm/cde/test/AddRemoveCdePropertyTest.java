package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.PropertyTest;
import org.testng.annotations.Test;

public class AddRemoveCdePropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void addRemoveCdeProperty() {
        addRemoveProperty("Aromatase Inhibitor Most Recent Received Text", null);
    }

}
