package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.util.concurrent.TimeUnit;

public class BaseFormTest extends NlmCdeBaseTest {

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

    public void addSection(String title, String card, String position) {
        clickElement(By.id("description_tab"));
        int nbOfSections = 0;
        if (position.equalsIgnoreCase("bottom")) {
            nbOfSections = driver.findElements(By.xpath("//div[contains(@class, 'section_view')]")).size();
            clickElement(By.id("addSectionBottom"));
        } else {
            clickElement(By.id("addSectionTop"));
        }

        String sectionId = "section_" + nbOfSections;
        scrollToViewById(sectionId);
        startEditQuestionSectionById(sectionId);
        clickElement(By.xpath("//div[@id='" + sectionId + "']//div[contains(@class,'section_title')]//i[contains(@class,'fa-edit')]"));
        String sectionInput = "//div[@id='" + sectionId + "']//div[contains(@class,'section_title')]//input";
        findElement(By.xpath(sectionInput)).clear();
        findElement(By.xpath(sectionInput)).sendKeys(title);
        clickElement(By.xpath("//*[@id='" + sectionId + "']//div[contains(@class,'section_title')]//button[contains(text(),'Confirm')]"));

        if (card != null) {
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText(card);
        }
    }

    public void startEditQuestionSectionById(String id) {
        try {
            scrollToViewById(id);
            clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-pencil')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-check"));
        } catch (Exception e) {
            clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-pencil')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-check"));
        }
    }

    public void saveEditQuestionSectionById(String id) {
        try {
            clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-check')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-pencil"));
        } catch (Exception e) {
            clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-check')]"));
            Assert.assertTrue(findElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[1]")).getAttribute("class").contains("fa-pencil"));
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
            } catch (org.openqa.selenium.NoSuchElementException e) {}
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
