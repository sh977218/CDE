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

        clickElement(By.id("referenceDocument_tab"));
        clickElement(By.id("addReferenceDocument"));
        textPresent("Add New Reference Document");

        findElement(By.id("nrd_id")).sendKeys(id);
        findElement(By.id("nrd_title")).sendKeys(title);
        findElement(By.id("nrd_uri")).sendKeys(uri);
        findElement(By.id("nrd_providerOrg")).sendKeys(providerOrg);
        findElement(By.id("nrd_languageCode")).sendKeys(languageCode);
        findElement(By.id("nrd_document")).sendKeys(document);
        clickElement(By.id("createReferenceDocument"));
        textPresent("Reference document Added");

        clickElement(By.id("referenceDocument_tab"));
        textPresent(id);
        textPresent(title);
        textPresent(uri);
        textPresent(languageCode);
        textPresent(providerOrg);
        textPresent(document);

        clickElement(By.id("removeReferenceDocument-0"));
        textPresent("Confirm Delete");
        clickElement(By.id("confirmRemoveReferenceDocument-0"));
        textPresent("Reference document Removed");
    }

    public void reorderReferenceDocumentTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "referenceDocumentsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";

        clickElement(By.id("referenceDocument_tab"));
        textPresent("Language Code:");
        reorderIconTest(tabName);
        clickElement(By.xpath(prefix + "moveDown-0" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "id_1" + postfix)).getText().contains("rd1"));
        clickElement(By.xpath(prefix + "moveUp-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "id_1" + postfix)).getText().contains("rd3"));
        clickElement(By.xpath(prefix + "moveTop-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "id_0" + postfix)).getText().contains("rd1"));

    }
}
