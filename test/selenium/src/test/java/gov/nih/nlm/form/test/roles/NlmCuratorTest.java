package gov.nih.nlm.form.test.roles;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class NlmCuratorTest extends BaseClassificationTest {
    @Test
    public void nlmCuratorTest() {
        mustBeLoggedInAs(nlmCuratorUser_username, password);

        goToCdeSearch();
        clickElement(By.id("search_by_classification_ACRIN"));
        textPresent("Candidate (", By.id("registrationStatusListHolder"));
        textPresent("Incomplete (", By.id("registrationStatusListHolder"));

        goToFormSearch();
        clickElement(By.id("search_by_classification_TEST"));
        textPresent("Incomplete (", By.id("registrationStatusListHolder"));


        // Create Data Element
        String cdeName = "nlm curated data element";
        String cdeDef = "create by NLM Curator";
        String cdeOrg = "SeleniumOrg";

        scrollToTop();
        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createCDELink"));
        textPresent("Please enter a name for the new CDE");

        findElement(By.id("eltName")).sendKeys(cdeName);
        findElement(By.id("eltDefinition")).sendKeys(cdeDef);

        textPresent("Please select a steward for the new CDE");
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(cdeOrg);
        addClassificationMethod(new String[]{"SeleniumOrg", "Test Classif"});
        modalGone();
        clickElement(By.id("submit"));
        goToCdeSummary();
        textPresent(cdeName);
        textPresent(cdeDef);
        findElement(By.xpath("//button[contains(.,'Edit')]"));


        // Create Form
        String formName = "nlm curated form";
        String formDef = "create by NLM Curator";
        String formV = "0";
        String formOrg = "SeleniumOrg";

        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createFormLink"));
        textPresent("Please enter a name for the new Form");

        findElement(By.id("eltName")).sendKeys(formName);
        findElement(By.id("eltDefinition")).sendKeys(formDef);
        fillInput("Version", formV);

        textPresent("Please select a steward for the new Form");
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(formOrg);
        addClassificationMethod(new String[]{"SeleniumOrg", "Test Classif"});
        modalGone();
        clickElement(By.id("submit"));
        goToGeneralDetail();
        textPresent(formName);
        textPresent(formDef);
        findElement(By.xpath("//button[contains(.,'Edit')]"));
    }
}
