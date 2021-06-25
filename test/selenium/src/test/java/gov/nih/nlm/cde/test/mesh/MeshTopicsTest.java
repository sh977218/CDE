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
        gotoClassificationMgt();
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
    }
}
