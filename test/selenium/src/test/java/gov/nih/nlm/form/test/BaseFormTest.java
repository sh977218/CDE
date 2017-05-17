package gov.nih.nlm.form.test;

import org.openqa.selenium.*;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.io.*;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

public class BaseFormTest extends FormCommentTest {

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
        String searchString;
        try {
            findElement(By.xpath("//tree-viewport/div/div/tree-node-drop-slot"));
            searchString = "//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        } catch (TimeoutException e) {
            searchString = "//tree-viewport/div/div/tree-node-collection/div/tree-node/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        }
        int nbOfSections = driver.findElements(By.xpath(searchString)).size();
        Assert.assertTrue(nbOfSections > 0);
        addSection(title, repeat, nbOfSections - 1);
    }

    public void addSection(String title, String repeat, Integer sectionNumber) {
        String sectionId = "section_" + sectionNumber;

        String searchString;
        try {
            findElement(By.xpath("//tree-viewport/div/div/tree-node-drop-slot"));
            searchString = "//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        } catch (TimeoutException e) {
            searchString = "//tree-viewport/div/div/tree-node-collection/div/tree-node/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        }
        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                WebElement sourceElt = findElement(By.xpath("//button[@id='addSectionTop']"));
                WebElement targetElt = findElement(By.xpath("(" + searchString + ")[" + (sectionNumber + 1) + "]"));

                (new Actions(driver)).moveToElement(targetElt).perform(); // scroll into view
                dragAndDrop(sourceElt, targetElt);
                textPresent("N/A", By.id(sectionId));
                i = 10;
            } catch (TimeoutException e) {
                if (i == 4) {
                    throw e;
                }
            }
        }

        scrollToViewById(sectionId);
        startEditQuestionSectionById(sectionId);
        clickElement(By.xpath("//div[@id='" + sectionId + "']//*[contains(@class,'section_title')]//i[contains(@class,'fa-edit')]"));
        String sectionInput = "//div[@id='" + sectionId + "']//*[contains(@class,'section_title')]//input";
        findElement(By.xpath(sectionInput)).clear();
        findElement(By.xpath(sectionInput)).sendKeys(title);
        clickElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_title')]//button[contains(text(),'Confirm')]"));
        setRepeat(sectionId, repeat);
    }

    public void dragAndDrop(WebElement source, WebElement target) {
        String basePath = new File("").getAbsolutePath();

        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            try {
                Assert.assertTrue(source.isDisplayed());
                Assert.assertTrue(target.isDisplayed());

                String JS_DRAG_DROP = readFile(basePath + "/src/test/resources/drag-drop.js");
                ((JavascriptExecutor) driver).executeScript(JS_DRAG_DROP, source, target, null, null, 100);
                i = 10;
            } catch (WebDriverException e) {
                if (i == 4) {
                    throw e;
                }
            }
        }
    }

    private String readFile(String file) {
        Charset cs = Charset.forName("UTF-8");
        StringBuilder builder = new StringBuilder();
        try {
            FileInputStream stream = new FileInputStream(file);
            Reader reader = new BufferedReader(new InputStreamReader(stream, cs));
            char[] buffer = new char[8192];
            int read;
            while ((read = reader.read(buffer, 0, buffer.length)) > 0) {
                builder.append(buffer, 0, read);
            }
            stream.close();
        } catch (IOException e) {
            textPresent("IOException");
        }
        return builder.toString();
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
        return "//*[@id='" + questionId + "']//*[contains(@class,'skipLogicEditTextarea')]//input";
    }


    public void editSkipLogic(String inputXpath, String textToBePresent, int expectedNumSuggested, int clickNth,
                              boolean displayError, String errorMessage) {
        findElement(By.xpath(inputXpath)).sendKeys(Keys.SPACE);
        findElement(By.xpath("(//*[contains(@id,'typeahead-0-')])[" + clickNth + "]/*[contains(.,'" + textToBePresent + "')]"));
        int actualNumSuggested = findElements(By.xpath("(//*[contains(@id,'typeahead-0-')])")).size();
        Assert.assertEquals(actualNumSuggested, expectedNumSuggested);
        clickElement(By.xpath("(//*[contains(@id,'typeahead-0-')])[" + clickNth + "]"));
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
