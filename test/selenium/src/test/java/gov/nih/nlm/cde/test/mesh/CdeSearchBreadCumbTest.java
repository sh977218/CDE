package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchBreadCumbTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchBreadcrumb() {
        mustBeLoggedOut();
        goToCdeSearch();

        clickElement(By.id("browseByTopic"));
        clickElement(By.xpath("//span[contains(normalize-space(text()),'Environment and Public Health')]"));
        textPresent("results for");
        int count = 0;
        int num = 0;
        while (count < 5 && num < 11) {
            num = Integer.parseInt(findElement(By.id("searchResultNum")).getText());
            System.out.println("searchResultNum: " + num + ".  refreshing page " + count + " times.");
            hangon(20);
            count++;
            num = Integer.parseInt(findElement(By.id("searchResultNum")).getText());
            driver.navigate().refresh();
        }
        Assert.assertTrue(num >= 11, "Not enough elements: " + num);
        findElement(By.id("classifications-text-NINDS"));

        findElement(By.id("ftsearch-input")).sendKeys("type");
        clickElement(By.id("search.submit"));
        clickElement(By.id("classifications-text-NINDS"));
        clickElement(By.partialLinkText("Domain"));
        clickElement(By.id("altClassificationFilterModeToggle"));
        clickElement(By.id("classifications-text-NINDS"));
        clickElement(By.partialLinkText("Disease"));
        clickElement(By.xpath("//*[@id='li-blank-Public Health']"));
        clickElement(By.id("status-text-Qualified"));
        clickElement(By.xpath("//*[@id='datatype-text-Value List']"));

        textPresent("type", By.id("term_crumb"));
        textPresent("NINDS > Domain", By.id("classif_filter"));
        textPresent("and", By.id("classif_filter"));
        textPresent("NINDS > Disease", By.id("classif_filter"));
        textPresent("Health Care > Environment and Public Health > Pub...", By.id("topic_crumb"));
        textPresent("Qualified", By.id("status_crumb"));
        textPresent("Value List", By.id("datatype_crumb"));

        clickElement(By.id("removeDatatypes"));
        clickElement(By.id("removeStatuses"));
        clickElement(By.id("removeTopics"));
        clickElement(By.id("removeClassifications"));
        clickElement(By.id("removeClassifications"));
        clickElement(By.id("removeTerm"));

        textPresent("Browse by Classification");
    }
}
