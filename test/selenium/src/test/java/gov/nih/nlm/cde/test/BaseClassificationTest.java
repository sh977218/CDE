package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.openqa.selenium.support.ui.Select;

public class BaseClassificationTest extends NlmCdeBaseTest {
   public void addClassificationMethod(String[] categories) {     
        findElement(By.id("addClassification")).click();

        try {
            new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        } catch(Exception e) {

        }

        textPresent(categories[1]);

        for (int i = 1; i < categories.length - 1; i++) {
            findElement(By.cssSelector("[id='addClassification-" + categories[i] + "'] span.fake-link")).click();
        }
        findElement(By.cssSelector("[id='addClassification-" + categories[categories.length - 1] + "'] button")).click();
        try {
            closeAlert();
        } catch(Exception e) {
        
        }
        findElement(By.cssSelector("#addClassificationModalFooter .done")).click();
        hangon(3);        
        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + selector + "'] .name")).getText().equals(categories[categories.length - 1]));
    }    
   
    public void checkRecentlyUsedClassifications(String[] categories) {
        findElement(By.id("addClassification")).click();
        findElement(By.id("addClass.byRecentlyAdded")).click();
        for (int i = 0; i < categories.length; i++) {
            textPresent(categories[i], By.id("viewType.byRecentlyAdded"));
        }        
        findElement(By.cssSelector("#addClassificationModalFooter .done")).click();
        modalGone();   
    }
    

    protected void createClassificationName(String org, String[] categories) {
        scrollToTop();
        
        String addSelector = "";
        for (int i = 0; i < categories.length-1; i++) {
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
        
        if(categories.length==1) {
            findElement(By.xpath("//h4[@id='org-" + org + "']/a")).click();
        } else if(categories.length==2){
            findElement(By.xpath("//span[@id='classification-" + addSelector + "']/../../span/a[@title='Add Child Classification']")).click();
        } else {
            findElement(By.xpath("//*[@id='classification-" + addSelector + "']/div/div/span/a[@title='Add Child Classification']")).click();
        }
        findElement(By.id("addNewCatName")).sendKeys(categories[categories.length - 1]);
        findElement(By.id("addNewCatButton")).click();
        closeAlert();
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + compareSelector + "'] .name")).getText().equals(categories[categories.length - 1]));
    }    
    
    protected void fillOutBasicCreateFields(String name, String definition, String org, String classification, String subClassification) {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
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
        findElement(By.id("submit")).click();
        hangon(6);
    }
}