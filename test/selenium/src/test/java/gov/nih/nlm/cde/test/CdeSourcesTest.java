package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSourcesTest extends NlmCdeBaseTest {

    @Test
    public void cdeSourceTest() {
        String cdeName = "Patient Gender Code";
        goToCdeByName(cdeName);
        textPresent("Name:");
        textPresent("caDSR");
        textPresent("Created:");
        textPresent("12/10/1994");
        textPresent("Updated:");
        textPresent("10/17/2016");
        textPresent("Registration Status:");
        textPresent("standard");
        textPresent("Datatype:");
        textPresent("Number");
        textPresent("Copyright:");
        findElement(By.linkText("Terms of Use"));
    }
}
