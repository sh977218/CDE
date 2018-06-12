package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class SearchPageSize extends NlmCdeBaseTest {

    @Test
    public void searchPageSize () {
        driver.get(baseUrl + "/cde/search?selectedOrg=NINDS&page=501");
        checkAlert("There was a problem with your query");

        driver.get(baseUrl + "/form/search?selectedOrg=NINDS&page=501");
        checkAlert("There was a problem with your query");
    }
}
