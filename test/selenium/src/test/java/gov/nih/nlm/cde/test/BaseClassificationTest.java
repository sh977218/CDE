package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;

import java.util.Arrays;
import java.util.List;

public class BaseClassificationTest extends NlmCdeBaseTest {
    public void addClassificationMethod(String[] categories) {
        findElement(By.id("openClassificationModalBtn")).click();
        textPresent("Please select at least one classification");
        addClassificationMethodDo(categories);
    }

    private void addClassificationMethodDo(String[] categories) {
    	System.out.println("-------------------------FAILING TEST START-------------------------");
    	System.out.println(Arrays.asList(categories)); // [TEST, Classify Board, Classif_Board_Sub]
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        String classifyBtnId = "";
        for (int i = 1; i < categories.length - 1; i++) {
            clickElement(By.xpath("//*[@id='" + categories[i] + "-expander']//span"));
            classifyBtnId = classifyBtnId + categories[i] + ",";
            System.out.println("classifyBtnId=" + classifyBtnId);
        }
        classifyBtnId = classifyBtnId + categories[categories.length - 1];
        System.out.println("classifyBtnId=" + classifyBtnId);
        clickElement(By.xpath("//*[@id='" + classifyBtnId + "-classifyBtn']"));
        try {
            closeAlert();
        } catch (Exception ignored) {
        }
        try {
        	Assert.assertTrue(findElement(By.xpath("//*[@id='" + classifyBtnId + "']")).getText().equals(categories[categories.length - 1]));
	    } catch (org.openqa.selenium.TimeoutException e) {
	    	Object output = ((JavascriptExecutor)driver).executeScript("return document.body.innerHTML;");
	    	System.out.println("-----------------------DOM DUMP START---------------------------");
	    	System.out.println(output);
	    	System.out.println("-----------------------DOM DUMP END---------------------------");
	    	/*try {
				Thread.sleep(600000);
			} catch (InterruptedException ee) {}*/
	    	throw e;
	    }
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
