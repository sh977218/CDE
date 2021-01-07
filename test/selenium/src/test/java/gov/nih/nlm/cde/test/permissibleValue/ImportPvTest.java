package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ImportPvTest extends NlmCdeBaseTest {

    @Test
    public void importPv() {
        String cdeName = "Non-Pathology Findings";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        clickElement(By.id("openImportPVModalBtn"));
        importPvByTinyId("mJQiShWEW");
        textPresent("The following errors need to be corrected in order to Publish");
        textPresent("Duplicate Permissible Value");
        clickElement(By.id("openSave"));
        checkAlert("Please fix all errors before publishing");
        deleteDraft();

        clickElement(By.id("openImportPVModalBtn"));
        importPvByTinyId("CK8F0tHZ5wp");
        textNotPresent("Duplicate Permissible Value");
        goToHistory();
        selectHistoryAndCompare(1, 2);

        String[] ethnicity = {"American Indian or Alaska Native", "Asian", "White",
                "Black or African American", "Not Reported", "Unknown",
                "Native Hawaiian or other Pacific Islander"};
        for (int i = 0; i < ethnicity.length; i++) {
            textPresent(ethnicity[i], By.xpath("(//*[@id='Value List']//*[contains(@class,'arrayObjAdd')])[" + ++i + "]"));
        }
    }

    private void importPvByTinyId(String tinyId) {
        findElement(By.id("ftsearch-input")).sendKeys(tinyId);
        hangon(1);
        clickElement(By.id("search.submit"));
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
    }


}
