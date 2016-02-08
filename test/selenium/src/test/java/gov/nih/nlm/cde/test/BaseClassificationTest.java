package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public class BaseClassificationTest extends NlmCdeBaseTest {
    public void addClassificationMethod(String[] categories) {
        clickElement(By.cssSelector("[id^=addClassification]"));
        addClassificationMethodDo(categories);
    }

    public void addClassificationToNewCdeMethod(String[] categories) {
        clickElement(By.id("addClassification-createCde"));
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
        clickElement(By.id("addClassification"));
        clickElement(By.id("addClass.byRecentlyAdded"));
        for (String category : categories) {
            textPresent(category, By.id("addClassificationModalBody"));
        }
        clickElement(By.cssSelector("#addClassificationModalFooter .done"));
        modalGone();
    }

    public void checkRecentlyUsedClassificationsForNewCde(String[] categories) {
        clickElement(By.id("addClassification-createCde"));
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


    public void createBasicCde(String name, String definition, String org, String classification, String subclassification) {
        goToCdeSearch();
        fillOutBasicCreateFields(name, definition, org, classification, subclassification);
        clickElement(By.id("submit"));
        hangon(6);
    }

    public void openClassificationAudit(String name) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Classification Audit Log"));
        clickElement(By.xpath("(//span[text()=\"" + name + "\" and contains(@class,\"text-info\")])[1]"));
    }
}