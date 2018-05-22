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

    public void addQuestionToSectionByAutoComplete(String cdeNameString, int sectionNumber) {
        addQuestionDialog(sectionNumber);

        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys(cdeNameString);
        hangon(1);
        clickElement(By.xpath("//span[@class='mat-option-text' and contains(., '" + cdeNameString + "')]"));
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectQ"));
    }

    public void addCdeByNameBeforeId(String cdeName, String id, boolean isSuggested) {
        addCde(cdeName, "//*[@id='" + id + "']//tree-node-drop-slot[1]", isSuggested);
    }

    public void addCdesByNames(String[] cdeNames) {
        for (String cdeName : cdeNames) {
            new Actions(driver).sendKeys("q").build().perform();
            textPresent("Create Data Element");
            // wait for modal animation
            hangon(2);
            new Actions(driver).sendKeys(cdeName).build().perform();
            clickElement(By.id("createNewDataElement"));
        }
    }

    private void addCde(String cdeName, String dropXpath, boolean isSuggested) {
        WebElement sourceElt = findElement(By.xpath("//*[@id='startAddingQuestions']"));
        WebElement targetElt = findElement(By.xpath(dropXpath));
        (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
        dragAndDrop(sourceElt, targetElt);

        if (driver.findElements(By.id("addNewCdeBtn")).size() > 0) clickElement(By.id("addNewCdeBtn"));
        textPresent("Create Data Element");

        new Actions(driver).sendKeys(cdeName).build().perform();
        if (!isSuggested) clickElement(By.id("createNewDataElement"));
        else clickElement(By.xpath("(//*[@id='accordionList']//div[@class='card-header']//button)[1]"));
    }

    public void addCdeDesignationById(String questionId, String newDesignation, String[] newTags) {
        openQuestionEdit(questionId);
        String preXpath = "//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeDesignation')]//*[@class='newCdeDesignation']";
        if (newDesignation != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'newCdeDesignation')]")).sendKeys(newDesignation);
        if (newTags != null) {
            String tagsInputXpath = preXpath + "//*[contains(@class,'newCdeTags')]//input";
            for (String newTag : newTags) {
                clickElement(By.xpath(tagsInputXpath));
                selectNgSelectDropdownByText(newTag);
                textPresent(newTag, By.xpath(preXpath + "//*[contains(@class,'newCdeTags')]"));
            }
        }
        clickElement(By.xpath(preXpath + "//*[contains(@class,'fa fa-plus')]"));
    }

    public void addCdeIdentifierById(String questionId, String newSource, String newIdentifier, String newVersion) {
        openQuestionEdit(questionId);
        String preXpath = "//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeIdentifier')]//*[@class='newCdeIdentifier']";
        if (newSource != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'newCdeSource')]")).sendKeys(newSource);
        if (newIdentifier != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'newCdeId')]")).sendKeys(newIdentifier);
        if (newVersion != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'newCdeVersion')]")).sendKeys(newVersion);
        clickElement(By.xpath(preXpath + "//*[contains(@class,'fa fa-plus')]"));
    }

    public void deleteCdeNameById(String questionId, int i) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeDesignation')]//table/tbody/tr[" + i + "]//i[contains(@class,'fa fa-trash')]"));
    }

    public void deleteCdeIdentifierById(String questionId, int i) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeIdentifier')]/table/tbody/tr[" + i + "]//i[contains(@class,'fa fa-trash')]"));
    }

    public void editCdeDataTypeById(String questionId, String dataType) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeDataType')]/ng-select//input"));
        clickElement(By.xpath("//ng-dropdown-panel//div[contains(@class,'ng-option') and contains(., '" + dataType + "')]"));
    }

    public void openQuestionEdit(String questionId) {
        boolean isQuestionOpen = driver.findElements(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdeDesignation')]")).size() > 0;
        if (!isQuestionOpen) startEditQuestionById(questionId);
    }

    public void addCdePvById(String questionId, String pv, String codeName, String code, String codeSystem, String codeDescription) {
        openQuestionEdit(questionId);
        String preXpath = "//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdePVs')]//*[@class='newCdePv']";
        if (pv != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'permissibleValue')]")).sendKeys(pv);
        if (codeName != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'pvName')]")).sendKeys(codeName);
        if (code != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'pvCode')]")).sendKeys(code);
        if (codeSystem != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'pvCodeSystem')]")).sendKeys(codeSystem);
        if (codeDescription != null)
            findElement(By.xpath(preXpath + "//*[contains(@class,'pvDefinition')]")).sendKeys(codeDescription);
        clickElement(By.xpath(preXpath + "//*[contains(@class,'fa fa-plus')]"));
    }

    public void deleteCdePvById(String questionId, int i) {
        openQuestionEdit(questionId);;
        clickElement(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'cdePVs')]/table/tbody/tr[" + i + "]//i[contains(@class,'fa fa-trash')]"));
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
                textPresent("Search Data Elements");
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
