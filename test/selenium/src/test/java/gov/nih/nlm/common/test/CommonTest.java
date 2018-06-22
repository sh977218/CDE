package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;


public abstract class CommonTest extends NlmCdeBaseTest {
    public void goToEltByName(String name) {
        goToEltByName(name, null);
    }

    public abstract void goToEltByName(String name, String status);

    public abstract void goToEltSearch();

}
