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

    public void changeField(int index, String to) {
        clickElement(By.xpath("//*[@id='pvValue_" + index + "']//i"));
        findElement(By.xpath("//*[@id='pvValue_" + index + "']//input")).clear();
        findElement(By.xpath("//*[@id='pvValue_" + index + "']//input")).sendKeys(to);
        clickElement(By.xpath("//*[@id='pvValue_" + index + "']//button[contains(@class,'fa fa-check')]"));
    }

    @Test
    public void pvValidation() {
        String cdeName = "PvValidatorCde";
        mustBeLoggedInAs("selenium", password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        textNotPresent("There are validation errors");

        changeField(0, "pv2");
        textPresent("There are validation errors. Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        Assert.assertEquals(0, driver.findElements(By.id("openSave")).size());

        changeField(1, "pv1");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code5", "LOINC");
        textPresent("There are validation errors. Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        Assert.assertEquals(0, driver.findElements(By.id("openSave")).size());
        clickElement(By.id("pvRemove_4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name5", "code2", "NCI");
        textPresent("There are validation errors. Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        Assert.assertEquals(0, driver.findElements(By.id("openSave")).size());
        clickElement(By.id("pvRemove_4"));
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
