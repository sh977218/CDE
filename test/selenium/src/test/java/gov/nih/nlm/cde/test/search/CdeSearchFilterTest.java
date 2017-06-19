package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchFilterTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchByFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();

        clickElement(By.cssSelector("#search_by_classification_ACRIN fieldset"));
        textPresent("5 results for");
        textPresent("Neoadjuvant Therapy");
        textPresent("Under Review (3)");
        textPresent("Candidate (3)");
        textPresent("Incomplete (2)");
        textPresent("Value List (4)");
        textPresent("NUMBER (1)");

        clickElement(By.id("status-text-Candidate"));
        textPresent("3 results for");
        textNotPresent("Neoadjuvant Therapy");
        textPresent("Under Review (1)");
        textPresent("Candidate (3)");
        textPresent("Incomplete (2)");
        textPresent("Value List (2)");
        textPresent("NUMBER (1)");

        clickElement(By.xpath("//*[@id='datatype-text-Value List']"));
        textPresent("2 results for");
        textNotPresent("Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number");
        textPresent("Candidate (3)");
        textPresent("Incomplete (2)");
        textPresent("Value List (2)");
        textPresent("NUMBER (1)");
    }

}