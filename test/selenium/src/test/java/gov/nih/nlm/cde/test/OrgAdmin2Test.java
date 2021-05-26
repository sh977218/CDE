package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdmin2Test extends BaseClassificationTest {

    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigEditor_username, password);
        goToProfile();
        Assert.assertEquals("cabigEditor", findElement(By.id("username")).getText());
        textPresent("1,024.00", By.id("quota"));
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        textPresent("caBIG", By.id("editorFor"));
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
        mustBeLoggedInAs(cabigEditor_username, password);

        goToSettings();
        textNotPresent("Admins");
        textNotPresent("Curators");
        textNotPresent("Editors");
        textNotPresent("Steward Transfer");

    }

}
