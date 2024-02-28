package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PvValidatorTest extends NlmCdeBaseTest {

    public void addPv(String pv, String name, String code, String codeSystem) {
        clickElement(By.id("openAddPermissibleValueModelBtn"));
        hangon(1);
        findElement(By.name("permissibleValueInput")).sendKeys(pv);
        findElement(By.name("valueMeaningDescInput")).sendKeys(name.length() > 0 ? name : "permissible value without a name");

        if (name != null) {
            findElement(By.name("valueMeaningNameInput")).sendKeys(name);
        }

        if (code != null) {
            findElement(By.name("valueMeaningCodeInput")).sendKeys(code);
        }

        if (codeSystem != null) {
            findElement(By.name("codeSystemInput")).sendKeys(codeSystem);
        }

        clickElement(By.id("createNewPermissibleValueBtn"));
    }

    private void changeField(int index, String to) {
        clickElement(By.xpath("//*[@id='pvValue_" + index + "']//mat-icon"));
        findElement(By.xpath("//*[@id='pvValue_" + index + "']//input")).clear();
        findElement(By.xpath("//*[@id='pvValue_" + index + "']//input")).sendKeys(to);
        clickElement(By.xpath("//*[@id='pvValue_" + index + "']//button/mat-icon[normalize-space() = 'check']"));
    }

    @Test
    public void pvValidation() {
        String cdeName = "PvValidatorCde";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        textNotPresent("There are validation errors");

        changeField(0, "pv2");
        textPresent("The following errors need to be corrected in order to Publish");
        textPresent("Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        clickElement(By.id("openSave"));
        textPresent("Please fix all errors before publishing");

        changeField(1, "pv1");
        textNotPresent("Duplicate Permissible Value");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code5", "LOINC");
        textPresent("Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        clickElement(By.id("openSave"));
        checkAlert("Please fix all errors before publishing");
        clickElement(By.id("pvRemove_4"));
        textNotPresent("The following errors need to be corrected in order to Publish");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name5", "code2", "NCI");
        textPresent("The following errors need to be corrected in order to Publish");
        textPresent("Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        clickElement(By.id("openSave"));
        textPresent("Please fix all errors before publishing");
        clickElement(By.id("pvRemove_4"));
        textNotPresent("Duplicate Code");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        clickElement(By.id("openAddPermissibleValueModelBtn"));
        findElement(By.name("permissibleValueInput")).sendKeys("pv6");
        findElement(By.name("valueMeaningDescInput")).sendKeys("pv6");
        findElement(By.name("valueMeaningCodeInput")).sendKeys("code6");
        Assert.assertFalse(findElement(By.id("createNewPermissibleValueBtn")).isEnabled());
        findElement(By.name("codeSystemInput")).sendKeys("MESH");
        Assert.assertTrue(findElement(By.id("createNewPermissibleValueBtn")).isEnabled());
    }

}
