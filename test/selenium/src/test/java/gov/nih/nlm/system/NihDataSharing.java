package gov.nih.nlm.system;

import org.testng.annotations.Test;

public class NihDataSharing extends NlmCdeBaseTest {

    @Test
    public void nihDataSharing() {
        driver.get(baseUrl + "/nihDataSharing");
        textPresent("NIH Data Sharing Page Works");
    }
}
