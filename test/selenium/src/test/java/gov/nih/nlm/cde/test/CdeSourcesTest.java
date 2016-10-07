package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeSourcesTest extends NlmCdeBaseTest {

    @Test
    public void cdeSourceTest() {
        String cdeName = "Patient Gender Code";
        goToCdeByName(cdeName);
        textPresent("Source Name:");
        textPresent("caDSR");
        textPresent("Source Created Date:");
        textPresent("12/10/1994 @ 3:59PM");
        textPresent("Source Modified Date:");
        textPresent("10/17/2016 @ 4:59PM");
        textPresent("Source Status:");
        textPresent("standard");
        textPresent("Source Datatype:");
        textPresent("Number");
    }
}
