package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;

public class MeshTopics extends NlmCdeBaseTest {

    @Test
    @RecordVideo
    public void meshTopics() {

        // add NINDS Mesh term
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickElement(By.xpath("//div[a/span/span[.='Disease']]//i[contains(@class, 'fa-link')]"));
        findElement(By.id("mesh.search")).clear();
        findElement(By.id("mesh.search")).sendKeys("NINDS");
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


        // try multiple times to give it time to re-index
        for (int i = 0; i < 2; i++) {
            try {
                clickElement(By.id("menu_cdes_link"));
                clickElement(By.linkText("Browse by Topic"));
                clickElement(By.partialLinkText("Health Care Economics and Organizations"));
                clickElement(By.id("li-blank-Government"));
                clickElement(By.id("li-blank-National Institute of Neurological Disorders and Stroke"));
                i = 2;
            } catch (TimeoutException e) {}
        }
        textPresent("results for All Terms | All Classifications | Health Care > Health Care Economics and Organizat... | All St");

    }

}
