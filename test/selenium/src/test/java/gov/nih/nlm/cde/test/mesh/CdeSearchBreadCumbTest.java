package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchBreadCumbTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchBreadcrumb() {
        goToCdeSearch();
        Assert.assertEquals(driver.getTitle(), "Data Element Search");
        clickElement(By.xpath("//div[. = 'Browse by Topic']"));
        clickElement(By.xpath("//span[contains(normalize-space(text()),'Environment and Public Health')]"));
        textPresent("results for", By.id("searchResultInfoBar"));
        int count = 0;
        int num = 0;
        while (count < 5 && num < 11) {
            num = getNumberOfResults();
            System.out.println("searchResultNum: " + num + ".  refreshing page " + count + " times.");
            hangon(20);
            count++;
            num = getNumberOfResults();
            driver.navigate().refresh();
        }
        Assert.assertTrue(num >= 11, "Not enough elements: " + num);
        findElement(By.id("classif-NINDS"));

        findElement(By.id("ftsearch-input")).sendKeys("type");
        hangon(2);
        clickElement(By.id("search.submit"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.partialLinkText("Domain"));
        clickElement(By.id("altClassificationFilterModeToggle"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.partialLinkText("Disease"));
        textPresent("NINDS > Disease");
        clickElement(By.id("topic-Public Health"));
        textPresent("Health Care > Environment and Public Health > Pub...");
        clickElement(By.id("regstatus-Qualified"));
        clickElement(By.id("datatype-Value List"));

        checkSearchResultInfo("type", "NINDS > Domain", "NINDS > Disease", "Health Care > Environment and Public Health > Pub...", "Qualified", "Value List");

        clickElement(By.id("datatype_crumb"));
        clickElement(By.id("status_crumb"));
        clickElement(By.id("topic_crumb"));
        clickElement(By.id("classif_crumb"));
        hangon(1);
        clickElement(By.id("classif_crumb"));
        clickElement(By.id("term_crumb"));

        textPresent("Browse by Classification");
    }
}
