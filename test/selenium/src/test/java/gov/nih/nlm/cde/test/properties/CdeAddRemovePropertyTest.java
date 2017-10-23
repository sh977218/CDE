package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddRemovePropertyTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddRemoveProperty() {
        String cdeName = "Adrenal Gland Received Other Specify";
        String key0 = "propKey0";
        String value0 = "MyValue0";
        String key1 = "propKey1";
        String value1 = "MyValue1";
        String key2 = "propKey2";
        String value2 = "MyValue2";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToProperties();
        addNewProperty(key0, value0);
        addNewProperty(key1, value1);
        addNewProperty(key2, value2);
        removeProperty(1);

        goToCdeByName(cdeName);
        goToProperties();
        textPresent(key0);
        textPresent(value0);
        textNotPresent(key1);
        textNotPresent(value1);
        textPresent(key2);
        textPresent(value2);
    }

}
