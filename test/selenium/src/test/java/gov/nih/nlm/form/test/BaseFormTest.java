package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class BaseFormTest extends NlmCdeBaseTest {

    protected void startAddingQuestions() {
        scrollToTop();
        try {
            textPresent("Show Question Search", By.id("startAddingQuestions"));
            findElement(By.id("startAddingQuestions")).click();
        } catch (Exception e) {
            // if button does not say show, then don't click it.
        }
    }

    protected void saveForm() {
        scrollToViewById("openSaveBottom");
        clickElement(By.id("openSaveBottom"));
        findElement(By.name("version")).sendKeys("1");
        hangon(1);
        clickElement(By.id("confirmNewVersion"));
        textPresent("Saved.");
        closeAlert();
        waitForESUpdate();
        scrollToTop();
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
        clickElement(By.linkText("Form Description"));

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
    }

}
