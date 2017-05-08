package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.util.Arrays;

public class BaseClassificationTest extends NlmCdeBaseTest {
    public void addClassificationMethod(String[] categories) {
        clickElement(By.cssSelector("[id^=addClassification]"));
        addClassificationMethodDo(categories);
    }

    public void addClassificationToNewCdeMethod(String[] categories) {
        clickElement(By.id("addClassification-createElt"));
        addClassificationMethodDo(categories);
    }

    private void addClassificationMethodDo(String[] categories) {
        try {
            new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        } catch (Exception ignored) {
        }

        textPresent(categories[1]);

        for (int i = 1; i < categories.length - 1; i++) {
            clickElement(By.cssSelector("[id='addClassification-" + categories[i] + "'] span.fake-link"));
        }
        clickElement(By.cssSelector("[id='addClassification-" + categories[categories.length - 1] + "'] button"));
        try {
            closeAlert();
        } catch (Exception ignored) {
        }

        clickElement(By.cssSelector("#addClassificationModalFooter .done"));
        hangon(3);
        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }
        Assert.assertTrue(findElement(By.cssSelector("[id='classification-" + selector + "'] .name"))
                .getText().equals(categories[categories.length - 1]));
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
        clickElement(By.id("addClassification-createElt"));
        clickElement(By.id("addClass.byRecentlyAdded"));
        for (String category : categories) {
            textPresent(category, By.id("addClassificationModalBody"));
        }
        clickElement(By.cssSelector("#addClassificationModalFooter .done"));
        modalGone();
    }


    protected void createClassificationName(String org, String[] categories) {
        scrollToTop();

        String addSelector = "";
        for (int i = 0; i < categories.length - 1; i++) {
            addSelector += categories[i];
            if (i < categories.length - 2) {
                addSelector += ",";
            }
        }

        String compareSelector = "";
        for (int i = 0; i < categories.length; i++) {
            compareSelector += categories[i];
            if (i < categories.length - 1) {
                compareSelector += ",";
            }
        }

        if (categories.length == 1) {
            clickElement(By.xpath("//h4[@id='org-" + org + "']/a"));
        } else if (categories.length == 2) {
            clickElement(By.xpath("//span[@id='classification-" + addSelector + "']/../../span/a[@title='Add Child Classification']"));
        } else {
            clickElement(By.xpath("//*[@id='classification-" + addSelector + "']/div/div/span/a[@title='Add Child Classification']"));
        }
        findElement(By.id("addNewCatName")).sendKeys(categories[categories.length - 1]);
        hangon(1);
        clickElement(By.id("addNewCatButton"));
        closeAlert();
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + compareSelector + "'] .name")).getText().equals(categories[categories.length - 1]));
    }

    protected void fillOutBasicCreateFields(String name, String definition, String org, String classification, String subClassification) {
        clickElement(By.id("createEltLink"));
        clickElement(By.id("createCDELink"));
        textPresent("Create Data Element");
        findElement(By.name("elt.designation")).sendKeys(name);
        findElement(By.name("elt.definition")).sendKeys(definition);
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(org);
        hangon(1);
        addClassificationMethod(new String[]{org, classification, subClassification});
    }

    public void openClassificationAudit(String name) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Classification Audit Log"));
        clickElement(By.xpath("(//span[text()=\"" + name + "\" and contains(@class,\"text-info\")])[1]"));
    }

    public void _classifyCdesMethod(String[] categories) {
        clickElement(By.id("openClassifyCdesModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        String expanderStr = "";
        for (int i = 1; i < categories.length - 1; i++) {
            expanderStr = expanderStr + categories[i];
            clickElement(By.id(expanderStr + "-expander"));
            expanderStr += ",";
        }
        clickElement(By.id(expanderStr + categories[categories.length - 1] + "-classifyBtn"));
        closeAlert();
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
            clickElement(By.id(expanderStr + "-expander"));
            expanderStr += ",";
        }
        clickElement(By.id(expanderStr + categories[categories.length - 1] + "-classifyBtn"));

        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }
        hangon(1);
        Assert.assertEquals(findElement(By.id(selector)).getText(), categories[categories.length - 1]);

        textPresent("Classification added");
        closeAlert();
    }
    private void _addExistClassificationMethodDo(String[] categories) {
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        textPresent(categories[1]);
        String expanderStr = "";
        for (int i = 1; i < categories.length - 1; i++) {
            expanderStr = expanderStr + categories[i];
            clickElement(By.id(expanderStr + "-expander"));
            expanderStr += ",";
        }
        clickElement(By.id(expanderStr + categories[categories.length - 1] + "-classifyBtn"));
        textPresent("Classification Already Exists");
        closeAlert();
    }
}
