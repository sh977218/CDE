package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.testng.annotations.Test;

public class CdePVLoincTest extends NlmCdeBaseTest {
    String[] urls = new String[]{
            "/de/mkmhYJOnk7l",
            "/de/mkmhYJOnk7l/version/",
            "/deById/5b55fc19c805703830125b6a/",
            "/deList/mkmhYJOnk7l"
    };

    @Test
    public void cdeNotLoginCannotSeeLoinc() {
        mustBeLoggedOut();
        for (String url : urls) {
            driver.get(baseUrl + url);
            String source = driver.getPageSource();
            boolean isContains = source.contains("LA6270-8");
            Assert.assertFalse(url + " failed.\n" +
                            "<source>" + source + "</source>\n" +
                            "<isContains>" + isContains + "</isContains>\n"
                    , isContains);
        }
    }

    @Test
    public void cdeLoginCanSeeLoinc() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        for (String url : urls) {
            driver.get(baseUrl + url);
            String source = driver.getPageSource();
            boolean isContains = source.contains("LA6270-8");
            Assert.assertTrue(url + " failed.\n" +
                            "<source>" + source + "</source>\n" +
                            "<isContains>" + isContains + "</isContains>\n"
                    , isContains);
        }
    }
}
