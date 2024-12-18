package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BrowseUsers extends NlmCdeBaseTest {

    @Test
    public void browseUsers() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToUsers();
        searchUsername("cabig", "cabigeditor");
        clickElement(By.xpath("//button[text()='Search']"));

        Assert.assertEquals(findElement(By.id("user_username")).getText(), "cabigEditor");
        Assert.assertEquals(findElement(By.xpath("//*[@itemprop='user_editor_0']")).getText(), "caBIG");
        Assert.assertEquals(findElement(By.xpath("//*[@itemprop='user_siteadmin_0']")).getText(), "No");

        searchUsername("nlm");
        clickElement(By.xpath("//button[text()='Search']"));

        textPresent("nlm", By.id("user_username"));
        Assert.assertEquals("nlm", findElement(By.id("user_username")).getText());
        String orgText = findElement(By.xpath("//*[@itemprop='user_orgadmin_0']")).getText();
        Assert.assertTrue(orgText.contains("caBIG,CTEP,NINDS,ACRIN,PS&CC,org / or Org,TEST,PhenX,NLM,NIDA,NHLBI"),
                " but found: " + orgText);
        Assert.assertEquals(findElement(By.xpath("//*[@itemprop='user_siteadmin_0']")).getText(), "Yes");

        // make sure same tab is in 2 places.
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
    }
}
