package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MeshTopicsTest extends NlmCdeBaseTest {

    @Test
    public void meshTopics() {

        // add NINDS Mesh term
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickElement(By.xpath(getOrgClassificationIconXpath("meshMapping", new String[]{"Disease"})));
        findElement(By.id("mapClassificationMeshInput")).clear();
        findElement(By.id("mapClassificationMeshInput")).sendKeys("NINDS");
        textPresent("National Institute of Neurological Disorders and Stroke");
        clickElement(By.id("addMeshDescButton"));
        clickElement(By.id("cancelMapClassificationMeshBtn"));
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
}
