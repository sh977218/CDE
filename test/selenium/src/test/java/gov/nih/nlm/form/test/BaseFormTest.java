package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

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
        findElement(By.name("version")).sendKeys("1");
        hangon(2);
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
        if (position.equalsIgnoreCase("buttom")) {
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
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//select[contains(@class,'section_cardinality')]"))).selectByVisibleText(card);
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

}
