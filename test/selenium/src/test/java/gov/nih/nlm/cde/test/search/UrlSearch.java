package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UrlSearch extends NlmCdeBaseTest {

    @Test
    public void urlSearch() {
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("browseOrg-caBIG"));
        String curUrl = driver.getCurrentUrl();
        driver.get(curUrl + "&regStatus=Candidate");
        textPresent("All Terms | caBIG | Candidate");
    }

}
