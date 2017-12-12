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
        try {
            new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        } catch (Exception ignored) {
            System.out.println("Ingnored exception: " + ignored);
        }
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

    public void checkRecentlyUsedClassifications(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        clickElement(By.id("recentlyAddViewTab"));
        for (String category : categories) {
            textPresent(category, By.id("newClassifyItemModalBody"));
        }
        clickElement(By.id("cancelNewClassifyItemBtn"));
        modalGone();
    }

    public void checkRecentlyUsedClassificationsForNewCde(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        clickElement(By.id("recentlyAddViewTab"));
        for (String category : categories) {
            textPresent(category, By.id("recentlyAddViewTab-panel"));
        }
        clickElement(By.id("cancelNewClassifyItemBtn"));
        modalGone();
    }


    protected void createClassificationName(String org, String[] categories) {
        new Select(driver.findElement(By.id("orgToManage"))).deselectByVisibleText(org);
        String id;

        // create root classification if it doesn't exist
        List<WebElement> rootClassifications = findElements(By.xpath("//*[@id='" + categories[0] + "']"));
        if (rootClassifications.size() == 0) {
            clickElement(By.xpath("addClassification"));
            findElement(By.id("addChildClassifInput")).sendKeys(categories[0]);
            hangon(2);
            clickElement(By.id("confirmAddChildClassificationBtn"));
        }

        for (int i = 0; i < categories.length; i++) {
            String[] c = Arrays.copyOfRange(categories, 0, i);
            id = String.join(",", c);
            String xpath = "//*[@id='" + id + "']";
            List<WebElement> list = findElements(By.xpath(xpath));
            if (list.size() == 0)
                clickElement(By.xpath(getOrgClassificationIconXpath("addChildClassification", c)));
            else System.out.println("find " + list.size() + " " + c.toString());
            findElement(By.id("addChildClassifInput")).sendKeys(categories[0]);
            hangon(2);
            clickElement(By.id("confirmAddChildClassificationBtn"));
        }
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

    public void _addExistsClassificationMethod(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        _addExistClassificationMethodDo(categories);
    }

    public void _addClassificationMethod(String[] categories) {
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        _addClassificationMethodDo(categories);
    }

    private void _addClassificationMethodDo(String[] categories) {
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        System.out.println("categories: " + Arrays.toString(categories));
        String expanderStr = "";
        for (int i = 1; i < categories.length - 1; i++) {
            expanderStr = expanderStr + categories[i];
            clickElement(By.xpath("//*[@id='" + expanderStr + "-expander']"));
            expanderStr += ",";
        }
        clickElement(By.xpath("//*[@id='" + expanderStr + categories[categories.length - 1] + "-classifyBtn']"));

        closeAlert();

        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }

        Assert.assertEquals(findElement(By.xpath("//div[@id='classificationBody']//*[@id ='" + categories[0] + "']//*[@id='" + selector + "']")).getText(),
                categories[categories.length - 1]);
        checkAlert("Classification added.");
    }

    private void _addExistClassificationMethodDo(String[] categories) {
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        String expanderStr = "";
        for (int i = 1; i < categories.length - 1; i++) {
            expanderStr = expanderStr + categories[i];
            clickElement(By.xpath("//*[@id='" + expanderStr + "-expander']"));
            expanderStr += ",";
        }
        clickElement(By.xpath("//*[@id='" + expanderStr + categories[categories.length - 1] + "-classifyBtn']"));
        checkAlert("Classification Already Exists");
    }
}
