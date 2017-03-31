package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.testng.annotations.Test;

public class FormViewTabTest extends ViewTabTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    @Test
    public void formViewTabTest() {
        showHideAllTabTest("Intake Medical History");
    }
}
