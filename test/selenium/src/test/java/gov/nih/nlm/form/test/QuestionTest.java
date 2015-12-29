package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class QuestionTest extends BaseFormTest {

    public void addQuestionToSection(String cdeName, int sectionNumber) {
        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys("\"" + cdeName + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        textPresent("1 results");
        textPresent(cdeName, By.id("acc_link_0"));

        WebElement sourceElt = findElement(By.cssSelector("#accordionList .question-move-handle"));
        WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumber));

        Assert.assertTrue(sourceElt.isDisplayed());

        String jsScroll = "var y = $(\"#section_view_" + sectionNumber + "\").position().top;\n" +
                "$(window).scrollTop(y);";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");

        scrollTo(targetElt.getLocation().getY());

        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        textPresent(cdeName, By.id("section_drop_area_" + sectionNumber));

    }

    public void addQuestionToSectionSafe(String cdeName) {
        addQuestionToSection(cdeName, 0);
    }

    public void addSectionToSection(int sectionNumFrom, int sectionNumTo) {
        WebElement sourceElt = findElement(By.xpath("//*[@id='section_view_" + sectionNumFrom + "']/div//i[contains(@class,'fa fa-arrows')]"));
        String sourceStr = findElement(By.xpath("//*[@id='section_view_" + sectionNumFrom + "']/div//div[contains(@id,'section_title')]")).getText();

        WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumTo));

        Assert.assertTrue(sourceElt.isDisplayed());
        String jsScroll = "var y = $(\"#section_drop_area_" + sectionNumTo + "\").position().top;\n" +
                "$(window).scrollTop(y);";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");

        scrollTo(targetElt.getLocation().getY());

        Actions action = new Actions(driver);
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("section_drop_area_" + sectionNumTo), sourceStr));
    }

    public void addQuestionToRootSection(String cdeName, int sectionNumber) {
        findElement(By.id("ftsearch-input")).clear();
        textPresent("", By.id("ftsearch-input"));
        findElement(By.id("ftsearch-input")).sendKeys("\"" + cdeName + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        textPresent("1 results");
        textPresent(cdeName, By.id("acc_link_0"));

        WebElement sourceElt = findElement(By.cssSelector("#accordionList .question-move-handle"));
        WebElement targetElt = findElement(By.xpath("//*[@id='section_view_" + sectionNumber + "']/div//i"));
        Assert.assertTrue(sourceElt.isDisplayed());

        String jsScroll = "var y = $(\"#section_drop_area_" + sectionNumber + "\").position().top;\n" +
                "$(window).scrollTop(y);";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");

        scrollTo(targetElt.getLocation().getY());

        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        textNotPresent(cdeName, By.id("sectionsDiv"));
    }

}
