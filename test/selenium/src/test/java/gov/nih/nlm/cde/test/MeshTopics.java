package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
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
        textPresent("Neurological Disorders");
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
            System.out.println("Fail after one 30 seconds.");
            try {
                hangon(20);
                clickElement(By.id("menu_cdes_link"));
                clickElement(By.linkText("Browse by Topic"));
                textPresent("Health Care Economics and Organizations (11148)");
            } catch (Exception ex) {
                System.out.println("Fail after one 20 seconds.");
                try {
                    hangon(10);
                    clickElement(By.id("menu_cdes_link"));
                    clickElement(By.linkText("Browse by Topic"));
                    textPresent("Health Care Economics and Organizations (11148)");
                } catch (Exception exc) {
                    System.out.println("Fail after one 10 seconds.");
                }
            }
        }
        clickElement(By.partialLinkText("Health Care Economics and Organizations"));
        clickElement(By.id("li-blank-Organizations"));
        clickElement(By.id("li-blank-Government"));
        clickElement(By.id("li-blank-Federal Government"));
        clickElement(By.id("li-blank-United States Government Agencies"));
        clickElement(By.id("li-blank-United States Dept. of Health and Human Services"));
        clickElement(By.id("li-blank-National Institutes of Health (U.S.)"));
        driver.navigate().refresh();
        scrollToViewById("li-checked-National Institutes of Health (U.S.)");
        hangon(5);
        textPresent("National Institute of Neurological Disorders and Stroke (11129)");
        textPresent("results for All Terms | All Classifications | Health Care > Health Care Economics and Organizat... | All St");
        clickElement(By.id("menu_forms_link"));
        clickElement(By.linkText("Browse by Topic"));
        clickElement(By.partialLinkText("Health Care Economics and Organizations"));
        clickElement(By.id("li-blank-Organizations"));
        clickElement(By.id("li-blank-Government"));
        clickElement(By.id("li-blank-Federal Government"));
        clickElement(By.id("li-blank-United States Government Agencies"));
        clickElement(By.id("li-blank-United States Dept. of Health and Human Services"));
        clickElement(By.id("li-blank-National Institute of Neurological Disorders and Stroke"));
        scrollToViewById("status_filter");
    }

}
