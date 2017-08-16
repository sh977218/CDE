package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSearchBreadcrumb extends NlmCdeBaseTest {

    @Test
    public void cdeSearchBreadcrumb() {
        mustBeLoggedOut();;
        goToCdeSearch();

        clickElement(By.id("topicTab"));
        clickElement(By.partialLinkText("Environment and Public Health"));
        hangon(1);
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
        clickElement(By.id("datatype-text-Text"));

        textPresent("type", By.id("term_crumb"));
        textPresent("NINDS > Domain", By.id("classif_filter"));
        textPresent("and", By.id("classif_filter"));
        textPresent("NINDS > Disease", By.id("classif_filter"));
        textPresent("Health Care > Environment and Public Health > Pub...", By.id("topic_crumb"));
        textPresent("Qualified", By.id("status_crumb"));
        textPresent("Value List, Text", By.id("datatype_crumb"));

        clickElement(By.id("removeDatatypes"));
        clickElement(By.id("removeStatuses"));
        clickElement(By.id("removeTopics"));
        clickElement(By.id("removeClassifications"));
        clickElement(By.id("removeClassifications"));
        clickElement(By.id("removeTerm"));

        textPresent("Browse by Classification");
    }

}