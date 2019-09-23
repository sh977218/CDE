package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CDELoggedInCanSeeLoinc extends NlmCdeBaseTest {

    @Test
    public void cdeLoginCanSeeLoinc() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        for (String url : CdePVLoincTest.urls) {
            driver.get(baseUrl + url);
            String source = driver.getPageSource();
            boolean isContains = source.contains("LA6270-8");
            Assert.assertTrue(isContains, url + " failed.\n" +
                            "<source>" + source + "</source>\n" +
                            "<isContains>" + isContains + "</isContains>\n");
        }
    }
}
