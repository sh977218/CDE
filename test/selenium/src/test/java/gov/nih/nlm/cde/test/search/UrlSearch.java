package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UrlSearch extends NlmCdeBaseTest {

    @Test
    public void urlSearch() {
        goToCdeSearch();
        String curUrl = driver.getCurrentUrl();
        driver.get(curUrl + "?regStatuses=Candidate&selectedOrg=caBIG");
        checkSearchResultInfo(null, "caBIG", null, null, "Candidate", null);
    }

}
