package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MeshTopicsTest extends NlmCdeBaseTest {

    @Test
    public void meshTopics() {

        String[] categories = new String[]{"Disease"};

        // add NINDS Mesh term
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickMoreVertIcon(categories);
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'link']"));
        findElement(By.id("mapClassificationMeshInput")).sendKeys("NINDS");
        int j = 20;
        while (j > 0) {
            if ("NINDS".equals(findElement(By.id("mapClassificationMeshInput")).getAttribute("value")))
                break;
            hangon(1);
            j--;
        }
        if (j == 0) System.out.println("NINDS not typed");
        findElement(By.id("addMeshDescButton"));
        textPresent("National Institute of Neurological Disorders and Stroke");
        clickElement(By.id("addMeshDescButton"));
        clickElement(By.id("cancelMapClassificationMeshBtn"));
        checkAlert("Saved");

        // now update index
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToServerStatus();
        clickElement(By.id("syncWithMeshButton"));

        for (int i = 0; i < 5; i++) {
            try {
                textPresent("Done syncing");
                i = 5;
            } catch (Exception e) {
                hangon(30);
                if (i == 4) Assert.fail("Waited too long for Mesh to Sync");
            }
        }
        closeAlert();

        clickElement(By.id("menu_cdes_link"));
        clickElement(By.xpath("//div[. = 'Browse by Topic']"));
        hangon(1);
        scrollToView(By.xpath("//span[contains(normalize-space(text()),'Health Care Economics and Organizations')]"));
        textPresent("Health Care Economics and Organizations (11");
        clickElement(By.xpath("//span[contains(normalize-space(text()),'Health Care Economics and Organizations')]"));
        clickElement(By.id("topic-Organizations"));
        clickElement(By.id("topic-Government"));
        clickElement(By.id("topic-Federal Government"));
        clickElement(By.id("topic-United States Government Agencies"));
        clickElement(By.id("topic-United States Dept. of Health and Human Services"));
        clickElement(By.id("topic-United States Public Health Service"));
        hangon(1);
        clickElement(By.id("topic-National Institutes of Health (U.S.)"));
        textPresent("National Institute of Neurological Disorders and Stroke");
        checkSearchResultInfo(null, null, null, "Health Care > Health Care Economics and Organizat...", null, null);
        clickElement(By.id("menu_forms_link"));
        clickElement(By.xpath("//div[. = 'Browse by Topic']"));
        clickElement(By.xpath("//span[contains(normalize-space(text()),'Health Care Economics and Organizations')]"));
        clickElement(By.id("topic-Organizations"));
        clickElement(By.id("topic-Government"));
        clickElement(By.id("topic-Federal Government"));
        clickElement(By.id("topic-United States Government Agencies"));
        clickElement(By.id("topic-United States Dept. of Health and Human Services"));
        clickElement(By.id("topic-United States Public Health Service"));
        clickElement(By.id("topic-National Institutes of Health (U.S.)"));
        textPresent("National Institute of Neurological Disorders and Stroke");
        scrollToViewById("registrationStatusListHolder");
    }
}
