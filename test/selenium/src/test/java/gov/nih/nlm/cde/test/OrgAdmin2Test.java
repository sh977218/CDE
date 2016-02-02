package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdmin2Test extends BaseClassificationTest {

    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        Assert.assertEquals("cabigAdmin", findElement(By.id("username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("quota")).getText());
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        Assert.assertEquals("caBIG", findElement(By.id("adminFor")).getText());
    }

    @Test
    public void cdesTransferSteward() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);
        mustBeLoggedInAs(transferStewardUser_username, password);

        String org1 = "PS&CC";

        //
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Account Management"));
        clickElement(By.linkText("CDE & Form Management"));
        scrollToTop();

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        clickElement(By.id("transferStewardButton"));
        textPresent("10 CDEs transferred.");
        textPresent("4 forms transferred.");

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        clickElement(By.id("transferStewardButton"));
        textPresent("There are no CDEs to transfer.");
        textPresent("There are no forms to transfer.");

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText("LCC");
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText(org1);
        clickElement(By.id("transferStewardButton"));
        textPresent("10 CDEs transferred.");
        textPresent("4 forms transferred.");
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

    @Test
    public void noTabIfSingleOrg() {
        mustBeLoggedInAs(cabigAdmin_username, password);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Account Management"));

        textPresent("Organizations Admins");
        textNotPresent("CDE & Form Management");

    }

}
