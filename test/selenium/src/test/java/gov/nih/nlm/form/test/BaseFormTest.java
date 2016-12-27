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
        int nbOfSections = driver.findElements(By.xpath("//div[starts-with(@id, 'section_view')]")).size();
        scrollToTop();
        clickElement(By.id("description_tab"));
        clickElement(By.id("addSection"));

        String section_title_path = "//div[@id='section_title_" + nbOfSections + "']";
        clickElement(By.xpath(section_title_path + "//i"));
        findElement(By.xpath(section_title_path + "//input")).clear();
        findElement(By.xpath(section_title_path + "//input")).sendKeys(title);
        clickElement(By.xpath(section_title_path + "//button[contains(text(),'Confirm')]"));

        if (card != null) {
            clickElement(By.xpath("//i[@id='edit_section_card_" + nbOfSections + "']"));
            new Select(findElement(By.xpath("//select[@id='select_section_card_" + nbOfSections + "']"))).selectByVisibleText(card);
            clickElement(By.xpath("//div[@id='dd_card_" + nbOfSections + "']//button[@id='confirmCard']"));
        }

        //  for some reason, the click to save sometimes does not open save. Maybe the click is being swallowed by the closing select above.
        hangon(1);
    }

}
