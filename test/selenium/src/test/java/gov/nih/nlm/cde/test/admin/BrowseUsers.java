package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BrowseUsers extends NlmCdeBaseTest {

    @Test
    public void browseUsers() {
        mustBeLoggedInAs("theOrgAuth", password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Users"));
        findElement(By.name("searchUsers")).sendKeys("cabig");
        clickElement(By.id("searchUsersSubmit"));

        Assert.assertEquals("cabigAdmin", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "No");

        findElement(By.name("searchUsers")).clear();
        findElement(By.name("searchUsers")).sendKeys("nlm");
        clickElement(By.id("searchUsersSubmit"));

        textPresent("nlm", By.id("user_username"));
        Assert.assertEquals("nlm", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\",\"CTEP\",\"NINDS\",\"ACRIN\",\"PS&CC\",\"org / or Org\",\"TEST\",\"PhenX\",\"NLM\",\"NIDA\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "Yes");

        // make sure same tab is in 2 places.
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Users"));

    }
}
