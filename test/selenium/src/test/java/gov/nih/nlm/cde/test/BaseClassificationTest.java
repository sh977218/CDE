package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.util.Arrays;
import java.util.List;

public class BaseClassificationTest extends NlmCdeBaseTest {
    public void addClassificationMethod(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        addClassificationMethodDo(categories);
    }

    private void addClassificationMethodDo(String[] categories) {
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        String classifyBtnId = "";
        for (int i = 1; i < categories.length - 1; i++) {
            clickElement(By.xpath("//*[@id='" + categories[i] + "-expander']//span"));
            classifyBtnId = classifyBtnId + categories[i] + ",";
        }
        classifyBtnId = classifyBtnId + categories[categories.length - 1];
        clickElement(By.xpath("//*[@id='" + classifyBtnId + "-classifyBtn']"));
        try {
            closeAlert();
        } catch (Exception ignored) {
        }
        Assert.assertTrue(findElement(By.xpath("//*[@id='" + classifyBtnId + "']")).getText().equals(categories[categories.length - 1]));
    }

    protected void fillOutBasicCreateFields(String name, String definition, String org, String classification, String subClassification) {
        clickElement(By.id("createEltLink"));
        clickElement(By.id("createCDELink"));
        textPresent("Create Data Element");
        findElement(By.name("eltName")).sendKeys(name);
        findElement(By.name("eltDefinition")).sendKeys(definition);
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(org);
        hangon(1);
        addClassificationMethod(new String[]{org, classification, subClassification});
    }
}
