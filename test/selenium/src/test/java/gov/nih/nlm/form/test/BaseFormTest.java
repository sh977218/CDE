package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

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

    public void addSection(String title, String card) {
        int nbOfSections = driver.findElements(By.xpath("//div[contains(@class, 'section_view')]")).size();
        scrollToTop();
        clickElement(By.id("description_tab"));
        clickElement(By.id("addSectionBottom"));

        String sectionId = "section_" + nbOfSections;
        startEditQuestionSectionById(sectionId);
        clickElement(By.id("//div[@id='" + sectionId + "']//div[contains(@class,'section_title')]//i"));
        String sectionInput = "//div[@id='" + sectionId + "']//div[contains(@class,'section_title')]//input";
        findElement(By.xpath(sectionInput)).clear();
        findElement(By.xpath(sectionInput)).sendKeys(title);
        clickElement(By.xpath("//*[@id=" + sectionId + "]/div/div[1]/div[1]/div[2]/span/form/button[1]"));

        if (card != null) {
            clickElement(By.xpath("//i[@id='edit_section_card_" + nbOfSections + "']"));
            new Select(findElement(By.xpath("//*[@id=" + sectionId + "]/div/div[1]/div[2]/div[5]/div[2]/select"))).selectByVisibleText(card);
        }

        saveEditQuestionSectionById(sectionId);
        //  for some reason, the click to save sometimes does not open save. Maybe the click is being swallowed by the closing select above.
        hangon(1);
    }

    public void startEditQuestionSectionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-pencil')]"));
    }

    public void saveEditQuestionSectionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//div[contains(@class,'editIconDiv')]//i[contains(@class,'fa-check')]"));
    }

    public String locateSkipLogicEditTextareaXpathByQuestionId(String questionId) {
        return "//*[@id='" + questionId + "']//*[contains(@class,'skipLogicEditTextarea')]//textarea[2]";
    }

}
