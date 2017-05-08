package gov.nih.nlm.form.test;

import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.util.concurrent.TimeUnit;

public class BaseFormTest extends FormCommentTest {

    protected void startAddingQuestions() {
        scrollToTop();
        try {
            textPresent("Show Question Search", By.id("startAddingQuestions"));
            clickElement(By.id("startAddingQuestions"));
        } catch (Exception e) {
            // if button does not say show, then don't click it.
        }
    }

    protected void startAddingForms() {
        scrollToTop();
        try {
            textPresent("Show Form Search", By.id("startAddingForms"));
            clickElement(By.id("startAddingForms"));
        } catch (Exception e) {
            // if button does not say show, then don't click it.
        }
    }

    protected void saveForm() {
        try {
            clickElement(By.id("openSaveBottom"));
            textPresent("has already been used");
        } catch (Exception e) {
            // known error spot. Seems the button does not always get clicked.
            clickElement(By.id("openSaveBottom"));
            textPresent("has already been used");
        }
        hangon(2);
        findElement(By.name("version")).sendKeys("1");
        textNotPresent("This version number has already been used.");
        clickElement(By.id("confirmNewVersion"));
        textPresent("Saved.");
        closeAlert();
    }

    public void searchForm(String query) {
        findElement(By.name("q")).sendKeys("\"" + query + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        showSearchFilters();
    }

    public void addSectionTop(String title, String repeat) {
        addSection(title, repeat, 0);
    }

    public void addSectionBottom(String title, String repeat) {
        int nbOfSections = driver.findElements(By.xpath("//*[@class='node-drop-slot']")).size();
        addSection(title, repeat, nbOfSections);
    }

    public void addSection(String title, String repeat, Integer sectionNumber) {
        hangon(5);

        WebElement sourceElt = findElement(By.xpath("//button[@id='addSectionTop']"));
        WebElement targetElt = findElement(By.xpath("//div[contains(@class,'node-content-wrapper')]"));
//        WebElement targetElt = findElement(By.xpath("(//*[@class='node-drop-slot'])[" + (sectionNumber + 1) + "]"));
        Assert.assertTrue(sourceElt.isDisplayed());
        Assert.assertTrue(targetElt.isDisplayed());

        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).build().perform();

//        (new Actions(driver)).clickAndHold(sourceElt)
//                .moveToElement(targetElt)
//                .release(targetElt)
//                .build().perform();

        textPresent("New Section");
        String sectionId = "section_" + sectionNumber;
        scrollToViewById(sectionId);
        startEditQuestionSectionById(sectionId);
        clickElement(By.xpath("//div[@id='" + sectionId + "']//*[contains(@class,'section_title')]//i[contains(@class,'fa-edit')]"));
        String sectionInput = "//div[@id='" + sectionId + "']//*[contains(@class,'section_title')]//input";
        findElement(By.xpath(sectionInput)).clear();
        findElement(By.xpath(sectionInput)).sendKeys(title);
        clickElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_title')]//button[contains(text(),'Confirm')]"));
        setRepeat(sectionId, repeat);
    }

    public void setRepeat(String sectionId, String repeat) {
        if (repeat != null) {
            if (repeat.charAt(0) == 'F')
                new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("Over first question");
            else {
                new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("Set Number of Times");
                findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/input")).sendKeys(repeat);
            }
        }
    }

    public void startEditQuestionSectionById(String id) {
        try {
            scrollToViewById(id);
            clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-pencil')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-check"));
        } catch (Exception e) {
            scrollDownBy(50);
            clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-pencil')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-check"));
        }
    }

    public void saveEditQuestionSectionById(String id) {
        try {
            clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-check')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-pencil"));
        } catch (Exception e) {
            clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-check')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-pencil"));
        }
    }

    public String locateSkipLogicEditTextareaXpathByQuestionId(String questionId) {
        return "//*[@id='" + questionId + "']//*[contains(@class,'skipLogicEditTextarea')]//textarea[2]";
    }


    public void editSkipLogic(String inputXpath, String textToBePresent, int expectedNumSuggested, int clickNth,
                              boolean displayError, String errorMessage) {
        findElement(By.xpath(inputXpath)).sendKeys(Keys.SPACE);
        textPresent(textToBePresent, By.xpath("(//*[contains(@id,'typeahead-')]/a)[" + clickNth + "]"));
        int actualNumSuggested = findElements(By.xpath("(//*[contains(@id,'typeahead-')]/a)")).size();
        Assert.assertEquals(actualNumSuggested, expectedNumSuggested);
        clickElement(By.xpath("(//*[contains(@id,'typeahead-')]/a)[" + clickNth + "]"));
        if (displayError) textPresent(errorMessage);
        else textNotPresent(errorMessage);
    }

    protected void scrollToInfiniteById(String id) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        for (int i = 0; i < 100; i++) {
            try {
                driver.manage().timeouts().implicitlyWait(0, TimeUnit.SECONDS);
                driver.findElement(By.id(id));
                driver.manage().timeouts().implicitlyWait(Integer.parseInt(System.getProperty("timeout")), TimeUnit.SECONDS);
                break;
            } catch (org.openqa.selenium.NoSuchElementException e) {
            }
            try {
                driver.findElement(By.id("scrollMore"));
                je.executeScript("document.getElementById('scrollMore').scrollIntoView(true);");
            } catch (org.openqa.selenium.NoSuchElementException e) {
                break;
            }
        }
        scrollToViewById(id);
    }


}
