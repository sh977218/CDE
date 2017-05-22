package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PvValidatorTest extends NlmCdeBaseTest {

    public void addPv(String pv, String name, String code, String codeSystem) {
        clickElement(By.id("openAddPermissibleValueModelBtn"));
        findElement(By.id("permissibleValueInput")).sendKeys(pv);

        if (name != null) {
            findElement(By.id("valueMeaningNameInput")).sendKeys(name);
        }

        if (code != null) {
            findElement(By.id("valueMeaningCodeInput")).sendKeys(code);
        }

        if (codeSystem != null) {
            findElement(By.id("codeSystemInput")).sendKeys(codeSystem);
        }

        clickElement(By.id("createNewPermissibleValueBtn"));
    }

    public void changeField(String which, String to) {
        clickElement(By.xpath("//tr[@id='" + which + "']//td[contains(@class,'pvValue')]//i"));
        findElement(By.xpath("//tr[@id='" + which + "']//td[contains(@class,'pvValue')]//input")).clear();
        findElement(By.xpath("//tr[@id='" + which + "']//td[contains(@class,'pvValue')]//input")).sendKeys(to);
        clickElement(By.xpath("//tr[@id='" + which + "']//td[contains(@class,'pvValue')]//button[contains(@class,'fa fa-check')]"));
    }

    @Test
    public void pvValidation() {
        mustBeLoggedInAs("selenium", password);
        goToCdeByName("PvValidatorCde");
        clickElement(By.id("pvs_tab"));
        textNotPresent("There are validation errors");

        changeField("pv_0", "pv2");
        textPresent("There are validation errors. Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pv_1", "pv1");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code5", "LOINC");
        textPresent("There are validation errors. Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name5", "code2", "NCI");
        textPresent("There are validation errors. Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        clickElement(By.id("openAddPermissibleValueModelBtn"));
        findElement(By.id("permissibleValueInput")).sendKeys("pv6");
        findElement(By.id("valueMeaningCodeInput")).sendKeys("code6");
        Assert.assertFalse(findElement(By.id("createNewPermissibleValueBtn")).isEnabled());
        findElement(By.id("codeSystemInput")).sendKeys("MESH");
        Assert.assertTrue(findElement(By.id("createNewPermissibleValueBtn")).isEnabled());
    }

}
