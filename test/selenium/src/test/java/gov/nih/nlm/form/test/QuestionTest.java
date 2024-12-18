package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.interactions.Actions;

public class QuestionTest extends BaseFormTest {

    public void addQuestionToSection(String cdeName, int sectionNumber) {
        addQuestionToSectionUnsafe(cdeName, sectionNumber);
    }

    public void addQuestionToSectionByAutoComplete(int sectionNumber, String cdeNameSearchString, String cdeNameString) {
        scrollToViewById("section_" + sectionNumber);
        addQuestionDialog(sectionNumber);

        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys(cdeNameSearchString);
        hangon(1);
        selectMatDropdownByText(cdeNameString);
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectQ"));
    }

    private void addCde(String cdeName, String dropXpath, boolean isSuggested) {
        By sourceBy = By.xpath("//*[@id='startAddingQuestions']");
        By targetBy = By.xpath(dropXpath);
        dragAndDrop(sourceBy, targetBy);

        clickElement(By.id("addNewCdeBtn"));
        // test autofocus in create mode
        hangon(1);
        new Actions(driver).sendKeys(cdeName).build().perform();
        if (!isSuggested) {
            clickElement(By.id("createNewDataElement"));
        } else {
            clickElement(By.xpath("(//*[@id='accordionList']//div[@class='card-header']//button)[1]"));
        }
    }

    public void addQuestionToSectionUnsafe(String cdeName, int sectionNumber) {
        addQuestionDialog(sectionNumber);

        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys("\"" + cdeName + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        textPresent("1 results. Sorted by relevance.");
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectQ"));
    }

    public void addQuestionDialog(int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                By sourceBy = By.xpath("//*[@id='startAddingQuestions']");
                By targetBy = By.xpath("//*[@id='section_" + sectionNumber + "']//*[contains(@class,'node-content-wrapper')]");
                dragAndDrop(sourceBy, targetBy);
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
        textPresent("1 results. Sorted by relevance.");
        clickElement(By.xpath("//*[@id='acc_link_0']/preceding-sibling::button"));
        clickElement(By.id("cancelSelectF"));
    }

    public void addFormDialog(int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                By sourceBy = By.xpath("//*[@id='startAddingForms']");
                By targetBy = By.xpath("//*[@id='section_" + sectionNumber + "']//*[contains(@class,'node-content-wrapper')]");
                dragAndDrop(sourceBy, targetBy);
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
