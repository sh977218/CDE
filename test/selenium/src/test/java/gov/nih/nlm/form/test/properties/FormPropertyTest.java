package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.common.test.PropertyTest;
import gov.nih.nlm.system.RecordVideo;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

}
