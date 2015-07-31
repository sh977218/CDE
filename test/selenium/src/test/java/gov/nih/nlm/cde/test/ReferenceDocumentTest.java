package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReferenceDocumentTest extends NlmCdeBaseTest {

    @Test
    void referenceDocumentTest() {
        String cde_name = "Person Gender Text Type";
        String id = "test id";
        String title = "test title";
        String uri = "www.nih.gov";
        String providerOrg = "test provider org";
        String languageCode = "test language code";
        String document = "very very very long test document";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cde_name);
        findElement(By.linkText("Reference Document")).click();
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
}
