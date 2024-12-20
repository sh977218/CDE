package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddRemovePropertyTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddRemoveProperty() {
        String cdeName = "Adrenal Gland Received Other Specify";
        String key0 = "pk1";
        String value0 = "MyValue1";
        String key1 = "pk2";
        String value1 = "MyValue2";
        String key2 = "pk3";
        String value2 = "MyValue3";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToProperties();
        addNewProperty(key0, value0, false);
        addNewProperty(key1, value1, false);
        addNewProperty(key2, value2, false);
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
