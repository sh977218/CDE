package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class ReferenceDocumentTest extends CommonTest {

    protected abstract void goToElt(String name);

    protected void referenceDocumentTest(String eltName) {
        String id = "test id";
        String title = "test title";
        String uri = "www.nih.gov";
        String providerOrg = "test provider org";
        String languageCode = "test language code";
        String document = "very very very long test document";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToElt(eltName);
        findElement(By.linkText("Reference Documents")).click();
        findElement(By.id("addReferenceDocument")).click();
        textPresent("Add New Reference Document");

        findElement(By.id("nrd_id")).sendKeys(id);
        findElement(By.id("nrd_title")).sendKeys(title);
        findElement(By.id("nrd_uri")).sendKeys(uri);
        findElement(By.id("nrd_providerOrg")).sendKeys(providerOrg);
        findElement(By.id("nrd_languageCode")).sendKeys(languageCode);
        findElement(By.id("nrd_document")).sendKeys(document);
        findElement(By.id("createReferenceDocument")).click();
        textPresent("Reference document Added");

        textPresent(id);
        textPresent(title);
        textPresent(uri);
        textPresent(languageCode);
        textPresent(providerOrg);
        textPresent(document);

        findElement(By.id("removeReferenceDocument-0")).click();
        textPresent("Confirm Delete");
        findElement(By.id("confirmRemoveReferenceDocument-0")).click();
        textPresent("Reference document Removed");
    }

    public void reorderReferenceDocumentTest(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        String tabName = "referrenceDocumentsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Reference Documents")).click();
        textPresent("Language Code:");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_2" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_0" + postfix)).getText().contains("rd3"));

    }
}
