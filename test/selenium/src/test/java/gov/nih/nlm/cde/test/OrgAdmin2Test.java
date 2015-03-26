package gov.nih.nlm.cde.test;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdmin2Test extends BaseClassificationTest {

    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
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

        // create 2 cdes
        String cde1 = "Transfer Steward Test CDE 1";
        String definition1 = "Definition for Transfer Steward Test CDE 1";
        String org1 = "PS&CC";
        String class1 = "caSEER";
        String subclass1 = "com.imsweb.caseer";
        fillOutBasicCreateFields(cde1, definition1, org1, class1, subclass1);
        Assert.assertTrue(textPresent(class1));
        Assert.assertTrue(textPresent(subclass1));
        findElement(By.id("submit")).click();
        modalGone();

        String cde2 = "Transfer Steward Test CDE 2";
        String definition2 = "Definition for Transfer Steward Test CDE 2";
        String class2 = class1;
        String subclass2 = subclass1;
        fillOutBasicCreateFields(cde2, definition2, org1, class2, subclass2);
        Assert.assertTrue(textPresent(class2));
        Assert.assertTrue(textPresent(subclass2));
        findElement(By.id("submit")).click();
        modalGone();

        // create 2 forms
        String formName1 = "Transfer Steward Test Form 1";
        String formDef1 = "Definition for Transfer Steward Test CDE 1";
        String formV1 = "3.0";
        new BaseFormTest().createForm(formName1, formDef1, formV1, org1);
        Assert.assertTrue(textPresent(formName1));
        Assert.assertTrue(textPresent(formDef1));

        String formName2 = "Transfer Steward Test Form 2";
        String formDef2 = "Definition for Transfer Steward Test CDE 2";
        String formV2 = "4.0";
        new BaseFormTest().createForm(formName2, formDef2, formV2, org1);
        Assert.assertTrue(textPresent(formName2));
        Assert.assertTrue(textPresent(formDef2));

        //
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.linkText("CDE & Form Management")).click();
        scrollToTop();

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        findElement(By.id("transferStewardButton")).click();
        textPresent("8 CDEs transferred.");
        textPresent("2 forms transferred.");

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        findElement(By.id("transferStewardButton")).click();
        textPresent("There are no CDEs to transfer.");
        textPresent("There are no forms to transfer.");

        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText("LCC");
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText(org1);
        findElement(By.id("transferStewardButton")).click();
        textPresent("8 CDEs transferred.");
        textPresent("2 forms transferred.");
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }
}
