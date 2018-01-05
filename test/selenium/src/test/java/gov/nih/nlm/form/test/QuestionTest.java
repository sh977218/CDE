package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.awt.*;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.awt.event.KeyEvent;

public class QuestionTest extends BaseFormTest {

    public void addQuestionToSection(String cdeName, int sectionNumber) {
        addQuestionToSectionUnsafe(cdeName, sectionNumber);
    }

    public void addCdeBeforeId(String cdeName, String id) {
        String dropXpath = "//*[@id='" + id + "']//tree-node-drop-slot[1]";
        addCde(cdeName, dropXpath);
        textPresent(cdeName, By.id(id));
    }

    public void addCdes(String[] cdeNames) {
        for (String cdeName : cdeNames) {
            try {
                hangon(2);
                new Actions(driver).sendKeys("q").build().perform();
                textPresent("New Data Element");
                hangon(2);
                new Actions(driver).sendKeys(cdeName).build().perform();
                hangon(2);
                clickElement(By.id("createNewDataElement"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    private void addCde(String cdeName, String dropXpath) {
        WebElement sourceElt = findElement(By.xpath("//*[@id='startAddingQuestions']"));
        WebElement targetElt = findElement(By.xpath(dropXpath));
        (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
        dragAndDrop(sourceElt, targetElt);
        if (driver.findElements(By.id("addNewCdeBtn")).size() > 0)
            clickElement(By.id("addNewCdeBtn"));
        try {
            hangon(2);
            new Actions(driver).sendKeys("q").build().perform();
            textPresent("New Data Element");
            hangon(2);
            new Actions(driver).sendKeys(cdeName).build().perform();
            hangon(2);
            clickElement(By.id("createNewDataElement"));
        } catch (Exception e) {
        }
    }


    public void addQuestionToSectionUnsafe(String cdeName, int sectionNumber) {
        addQuestionDialog(sectionNumber);

        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys("\"" + cdeName + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        textPresent("1 results");
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectQ"));
    }

    public void addQuestionDialog(int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                WebElement sourceElt = findElement(By.xpath("//*[@id='startAddingQuestions']"));
                WebElement targetElt = findElement(By.xpath("//*[@id='section_" + sectionNumber + "']//*[contains(@class,'node-content-wrapper')]"));
                (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
                dragAndDrop(sourceElt, targetElt);
                textPresent("Search Questions");
                i = 10;
            } catch (TimeoutException e) {
                if (i == 4) {
                    throw e;
                }
            }
        }
    }

    public void addFormToSection(String formName, int sectionNumber) {
        addFormDialog(sectionNumber);

        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys("\"" + formName + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        textPresent("1 results");
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectF"));
    }

    public void addFormDialog(int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                WebElement sourceElt = findElement(By.xpath("//*[@id='startAddingForms']"));
                WebElement targetElt = findElement(By.xpath("//*[@id='section_" + sectionNumber + "']//*[contains(@class,'node-content-wrapper')]"));
                (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
                dragAndDrop(sourceElt, targetElt);
                textPresent("Search Forms");
                i = 10;
            } catch (TimeoutException e) {
                if (i == 4) {
                    throw e;
                }
            }
        }
    }

}
