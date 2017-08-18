package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MeshTopics extends NlmCdeBaseTest {

    @Test
    public void meshTopics() {

        // add NINDS Mesh term
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickElement(By.xpath("//div[a/span/span[.='Disease']]//i[contains(@class, 'fa-link')]"));
        findElement(By.id("mesh.search")).clear();
        findElement(By.id("mesh.search")).sendKeys("NINDS");
        textPresent("National Institute of Neurological Disorders and Stroke");
        clickElement(By.id("addMeshDescButton"));
        clickElement(By.id("closeModal"));
        textPresent("Saved");
        closeAlert();

        // now update index
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Server Statuses"));
        clickElement(By.id("syncWithMeshButton"));
        hangon(20);
        try {
            hangon(30);
            clickElement(By.id("menu_cdes_link"));
            clickElement(By.linkText("Browse by Topic"));
            textPresent("Health Care Economics and Organizations (11148)");
        } catch (Exception e) {
            System.out.println("Retry after one 30 seconds.");
            try {
                hangon(20);
                clickElement(By.id("menu_forms_link"));
                clickElement(By.id("menu_cdes_link"));
                clickElement(By.linkText("Browse by Topic"));
                textPresent("Health Care Economics and Organizations (11148)");
            } catch (Exception ex) {
                System.out.println("Retry after one 20 seconds.");
                try {
                    hangon(10);
                    clickElement(By.id("menu_forms_link"));
                    clickElement(By.id("menu_cdes_link"));
                    clickElement(By.linkText("Browse by Topic"));
                    textPresent("Health Care Economics and Organizations (11148)");
                } catch (Exception exc) {
                    System.out.println("Retry after one 10 seconds.");
                }
            }
        }
        clickElement(By.partialLinkText("Health Care Economics and Organizations"));
        clickElement(By.id("li-blank-Organizations"));
        clickElement(By.id("li-blank-Government"));
        clickElement(By.xpath("//*[@id='li-blank-Federal Government']"));
        clickElement(By.xpath("//*[@id='li-blank-United States Government Agencies']"));
        clickElement(By.xpath("//*[@id='li-blank-United States Dept. of Health and Human Services']"));
        clickElement(By.xpath("//*[@id='li-blank-National Institutes of Health (U.S.)']"));
        driver.navigate().refresh();
        scrollToViewByXpath("//*[@id='li-checked-National Institutes of Health (U.S.)']");
        hangon(5);
        textPresent("National Institute of Neurological Disorders and Stroke");
        textPresent("results for All Terms | All Classifications | Health Care > Health Care Economics and Organizat... | All St");
        clickElement(By.id("menu_forms_link"));
        clickElement(By.linkText("Browse by Topic"));
        clickElement(By.partialLinkText("Health Care Economics and Organizations"));
        clickElement(By.id("li-blank-Organizations"));
        clickElement(By.id("li-blank-Government"));
        clickElement(By.xpath("//*[@id='li-blank-Federal Government']"));
        clickElement(By.xpath("//*[@id='li-blank-United States Government Agencies']"));
        clickElement(By.xpath("//*[@id='li-blank-United States Dept. of Health and Human Services']"));
        clickElement(By.xpath("//*[@id='li-blank-National Institutes of Health (U.S.)']"));
        clickElement(By.xpath("//*[@id='li-blank-National Institute of Neurological Disorders and Stroke']"));
        scrollToViewById("status_filter");
    }

    @Test(dependsOnMethods = {"meshTopics"})
    public void cdeSearchBreadcrumb() {
        mustBeLoggedOut();;
        goToCdeSearch();

        clickElement(By.id("topicTab"));
        clickElement(By.partialLinkText("Environment and Public Health"));
        textPresent("results for");
        int count = 0;
        while (count < 5 && Integer.parseInt(findElement(By.id("searchResultNum")).getText()) < 11) {
            hangon(20);
            count++;
            driver.navigate().refresh();
        }
        Assert.assertTrue(Integer.parseInt(findElement(By.id("searchResultNum")).getText()) >= 11);
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
