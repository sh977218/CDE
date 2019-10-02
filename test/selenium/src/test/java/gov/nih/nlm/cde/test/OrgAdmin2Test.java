package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdmin2Test extends BaseClassificationTest {

    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToProfile();
        Assert.assertEquals("cabigAdmin", findElement(By.id("username")).getText());
        textPresent("1,024.00", By.id("quota"));
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        textPresent("caBIG", By.id("adminFor"));
    }

    @Test
    public void cdesTransferSteward() {
        mustBeLoggedInAs(transferStewardUser_username, password);

        String org1 = "PS&CC";

        goToStewardTransfer();

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        clickElement(By.id("transferStewardButton"));
        textPresent("4 forms transferred.");
        textPresent("10 CDEs transferred.");
        closeAlert();

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        clickElement(By.id("transferStewardButton"));
        textPresent("0 forms transferred.");
        textPresent("0 CDEs transferred.");
        closeAlert();

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText("LCC");
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText(org1);
        clickElement(By.id("transferStewardButton"));
        textPresent("4 forms transferred.");
        textPresent("10 CDEs transferred.");
        closeAlert();
    }

    @Test
    public void noTabIfSingleOrg() {
        mustBeLoggedInAs(cabigAdmin_username, password);

        goToSettings();
        textPresent("Admins");
        textNotPresent("Steward Transfer");

    }

}
