package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MeshTopics extends NlmCdeBaseTest {

    @Test
    public void meshTopics() {
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickElement(By.xpath("//div[a/span/span[.='Disease']]//i[contains(@class, 'fa-link')]"));
        findElement(By.id("mesh.search")).clear();
        findElement(By.id("mesh.search")).sendKeys("NINDS");

    }

}
