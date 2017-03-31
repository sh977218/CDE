package gov.nih.nlm.form.test.properties.test;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class QuestionTest extends BaseFormTest {

    public void addQuestionToSection(String cdeName, int sectionNumber) {
        addQuestionToSectionUnsafe(cdeName, sectionNumber);
    }

    public void addQuestionToSectionUnsafe(String cdeName, int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                findElement(By.id("ftsearch-input")).clear();
                textPresent("", By.id("ftsearch-input"));
                findElement(By.id("ftsearch-input")).sendKeys("\"" + cdeName + "\"");
                hangon(1);
                clickElement(By.id("search.submit"));
                textPresent("1 results");
                textPresent(cdeName, By.id("acc_link_0"));

                WebElement sourceElt = findElement(By.xpath("//*[@id='accordionList']//*[contains(@class,'question-move-handle')]"));
                WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumber));

                Assert.assertTrue(sourceElt.isDisplayed());
                (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
                textPresent(cdeName, By.id("section_drop_area_" + sectionNumber));
                i = 10;
            } catch (TimeoutException e) {
                if (i == 4) {
                    throw e;
                }
            }

        }
    }

    public void addSectionToSection(int sectionNumFrom, int sectionNumTo) {

        WebElement sourceElt = findElement(By.xpath("//*[@id='section_" + sectionNumFrom + "']//*[contains(@class,'section_view')]//i[contains(@class,'fa fa-arrows')]"));
        String sourceStr = findElement(By.xpath("//*[@id='section_" + sectionNumFrom + "']//*[contains(@class,'section_view')]//i[contains(@class,'fa fa-arrows')]")).getText();

        WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumTo));

        Assert.assertTrue(sourceElt.isDisplayed());
        String jsScroll = "var y = $(\"#section_drop_area_" + sectionNumTo + "\").position().top;\n" +
                "$(window).scrollTop(y);";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");

        scrollTo(targetElt.getLocation().getY());

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
        WebElement targetElt = findElement(By.xpath("//*[@id='section_" + sectionNumber + "']/div/div[contains(@class,'panel-body')]/div[@id='section_drop_area_child']"));

        Assert.assertTrue(sourceElt.isDisplayed());

        String jsScroll = "var y = $(\"#section_drop_area_" + sectionNumber + "\").position().top;\n" +
                "$(window).scrollTop(y);";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");

        scrollTo(targetElt.getLocation().getY());

        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        textNotPresent(cdeName, By.id("sectionsDiv"));
    }

    public void addFormToSection(String formName, int sectionNumber) {
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                findElement(By.id("ftsearch-input")).clear();
                textPresent("", By.id("ftsearch-input"));
                findElement(By.id("ftsearch-input")).sendKeys("\"" + formName + "\"");
                hangon(1);
                clickElement(By.id("search.submit"));
                textPresent("1 results");
                textPresent(formName, By.id("acc_link_0"));

                WebElement sourceElt = findElement(By.xpath("//*[@id='accordionList']//*[contains(@class,'question-move-handle')]"));
                WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumber));

                Assert.assertTrue(sourceElt.isDisplayed());

                (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
                textPresent(formName, By.id("section_drop_area_" + sectionNumber));
                i = 10;
            } catch (TimeoutException e) {
                if (i == 4) {
                    throw e;
                }
            }

        }
    }

}
