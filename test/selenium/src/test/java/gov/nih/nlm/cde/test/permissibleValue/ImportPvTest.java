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
        textPresent("There are validation errors. Duplicate Permissible Value");
        checkElementDoesNotExistByLocator(By.id("openSave"));
        clickElement(By.id("deleteDraftBtn"));

        importPvByTinyId("CK8F0tHZ5wp");
        textNotPresent("There are validation errors. Duplicate Permissible Value");
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("American Indian or Alaska Native", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("Asian", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("White", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("Black or African American", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("Not Reported", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("Unknown", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
        textPresent("Native Hawaiian or other Pacific Islander", By.xpath("//*[@id='Value List']//*[contains(@class,'arrayObjAdd')]"));
    }

    private void importPvByTinyId(String tinyId) {
        findElement(By.id("ftsearch-input")).sendKeys(tinyId);
        hangon(1);
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
    }


}
