package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdePVLoincTest extends NlmCdeBaseTest {
    static String[] urls = new String[]{
            "/server/de/mkmhYJOnk7l",
            "/server/de/mkmhYJOnk7l/version/",
            "/server/de/byId/5b55fc19c805703830125b6a/",
            "/server/de/list/mkmhYJOnk7l"
    };

    @Test
    public void cdeNotLoginCannotSeeLoinc() {
        for (String url : urls) {
            driver.get(baseUrl + url);
            String source = driver.getPageSource();
            boolean isContains = source.contains("LA6270-8");
            Assert.assertFalse(isContains,url + " failed.\n" +
                            "<source>" + source + "</source>\n" +
                            "<isContains>" + isContains + "</isContains>\n");
        }
    }

}
