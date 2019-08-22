package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

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

    private void addCde(String cdeName, String dropXpath, boolean isSuggested) {
        WebElement sourceElt = findElement(By.xpath("//*[@id='startAddingQuestions']"));
        WebElement targetElt = findElement(By.xpath(dropXpath));
        (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
        dragAndDrop(sourceElt, targetElt);

        if (driver.findElements(By.id("addNewCdeBtn")).size() > 0) clickElement(By.id("addNewCdeBtn"));
        textPresent("Create Data Element");

        hangon(1);

        // test autofocus in create mode
        new Actions(driver).sendKeys(cdeName).build().perform();
        if (!isSuggested) clickElement(By.id("createNewDataElement"));
        else clickElement(By.xpath("(//*[@id='accordionList']//div[@class='card-header']//button)[1]"));
    }

    public void addCdeDesignationById(String questionId, String newDesignation) {
        openQuestionEdit(questionId);
        String xpath = "//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdeDesignations')]//input";
        findElement(By.xpath(xpath)).sendKeys(newDesignation + Keys.ENTER);
    }

    public void addCdeIdentifierById(String questionId, String newSource, String newIdentifier) {
        openQuestionEdit(questionId);
        String xpath = "//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdeIdentifiers')]//input";
        findElement(By.xpath(xpath)).sendKeys(newSource + ";" + newIdentifier + Keys.ENTER);
    }

    public void deleteCdeNameById(String questionId, String designation) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdeDesignations')]//mat-chip-list//mat-chip[normalize-space(text())='" + designation + "']//mat-icon"));
    }

    public void deleteCdeIdentifierById(String questionId, String source, String id) {
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdeIdentifiers')]//mat-chip-list//mat-chip[contains(normalize-space(.),'" + source + "') and contains(normalize-space(.),'" + id + "')]"));
    }

    public void editCdeDataTypeById(String questionId, String dataType) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'newCdeDataType')]//mat-select"));
        selectMatSelectDropdownByText(dataType);
    }

    public void openQuestionEdit(String questionId) {
        boolean isQuestionOpen = driver.findElements(By.xpath("//*[@id='" + questionId + "']//div[@class='card-body']//*[contains(@class,'changeQuestionLabelIcon')]")).size() > 0;
        if (!isQuestionOpen) startEditQuestionById(questionId);
    }

    public void addCdePvById(String questionId, String pv) {
        openQuestionEdit(questionId);
        String xpath = "//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdePvs')]//input";
        findElement(By.xpath(xpath)).sendKeys(pv + Keys.ENTER);
    }

    public void deleteCdePvById(String questionId, String pv) {
        openQuestionEdit(questionId);
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-card//*[contains(@class,'newCdePvs')]//mat-chip-list//mat-chip[normalize-space(text())='" + pv + "']//mat-icon"));
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
        scrollToViewById("section_" + sectionNumber);
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
