package gov.nih.nlm.form.test;

import gov.nih.nlm.form.test.displayProfile.DisplayProfile;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import java.io.*;
import java.nio.charset.Charset;
import java.util.List;
import java.util.ListIterator;

public class BaseFormTest extends NlmCdeBaseTest {

    public void searchForm(String query) {
        findElement(By.name("q")).sendKeys("\"" + query + "\"");
        hangon(1);
        clickElement(By.id("search.submit"));
        showSearchFilters();
    }

    protected void addSectionTop(String title) {
        addSection(title, null, 0);
    }

    protected void addSectionBottom(String title, String repeat) {
        hangon(1);
        String searchString;
        if (driver.findElements(By.xpath("//tree-viewport/div/div/tree-node-drop-slot")).size() > 0)
            searchString = "//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        else
            searchString = "//tree-viewport/div/div/tree-node-collection/div/tree-node/div/tree-node-drop-slot/*[@class='node-drop-slot']";
        int nbOfSections = driver.findElements(By.xpath(searchString)).size();
        Assert.assertTrue(nbOfSections > 0);
        addSection(title, repeat, nbOfSections - 1);
    }

    protected void addSection(String title, String repeat, Integer sectionNumber) {
        String sectionId = "section_" + sectionNumber;
        hangon(1);

        // drag and drop selenium is buggy, try 5 times.
        for (int i = 0; i < 5; i++) {
            String searchString;
            if (driver.findElements(By.xpath("//tree-viewport/div/div/tree-node-drop-slot")).size() > 0)
                searchString = "//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']";
            else
                searchString = "//tree-viewport/div/div/tree-node-collection/div/tree-node/div/tree-node-drop-slot/*[@class='node-drop-slot']";

            try {
                WebElement sourceElt = findElement(By.xpath("//*[@id='addSectionTop']"));
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
        startEditSectionById(sectionId);
        if (title != null) {
            editSectionTitle(sectionId, title);
        }
        if (repeat != null) {
            hangon(1); // allow time for id to be processed
            setRepeat(sectionId, repeat);
        }
        saveEditSectionById(sectionId);
        textPresent(title, By.id(sectionId));
    }

    protected String byValueListValueXPath(String value) {
        return "label[contains(.,'" + value + "')]";
    }

    private void editSectionTitle(String sectionId, String title) {
        clickElement(By.xpath("//div[@id='" + sectionId + "']//*[contains(@class,'section_label')]//mat-icon[normalize-space() = 'edit']"));
        String sectionInput = "//div[@id='" + sectionId + "']//*[contains(@class,'section_label')]//input";
        findElement(By.xpath(sectionInput)).clear();
        findElement(By.xpath(sectionInput)).sendKeys(title);
        clickElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_label')]//button/mat-icon[normalize-space() = 'check']"));
    }

    void questionEditAddUom(String id, String type, String text) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionUom')]//input"));
        new Select(findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionUom')]//select"))).selectByVisibleText(type);
        textPresent(type, By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionUom')]//select"));
        findElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionUom')]//input")).sendKeys(text);

        if ("UCUM".equals(type)) {
            clickElement(By.name("searchUomInput"));
            findElement(By.name("searchUomInput")).clear();
            findElement(By.name("searchUomInput")).sendKeys(text);
            clickElement(By.xpath("//*[contains(@id,'mat-autocomplete-')]//mat-option[contains(.,'" + text + "')]"));
        } else {
            clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionUom')]//mat-icon[normalize-space() = 'add']"));
        }
    }

    protected void setRepeat(String sectionId, String repeat) {
        if (repeat == null || repeat == "") {
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("");
        } else if (repeat.charAt(0) == 'F') {
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("Over first question");
        } else if (repeat.charAt(0) == '=') {
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("Over answer of specified question");
        } else {
            new Select(findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/select"))).selectByVisibleText("Set Number of Times");
            findElement(By.xpath("//*[@id='" + sectionId + "']//*[contains(@class,'section_cardinality')]/input")).sendKeys(repeat);
        }
    }

    public void togglePrintableLogic() {
        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("printableLogicCb"));
    }

    public void toggleDisplayProfile(int index) {
        clickElement(By.xpath("//*[@id='profile_" + index + "']//mat-panel-title"));
    }

    protected void dragAndDrop(WebElement source, WebElement target) {
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

    protected void createDisplayProfile(DisplayProfile displayProfile) {
        int index = displayProfile.displayProfileIndex;
        String name = displayProfile.displayProfileName;
        boolean matrix = displayProfile.displayAsMatrix;
        boolean displayValues = displayProfile.displayAnswerValue;
        boolean instructions = displayProfile.displayInstruction;

        boolean numbering = displayProfile.displayQuestionNumber;
        String displayType = displayProfile.displayProfileType;
        int numberOfColumns = displayProfile.numberOfColumn;
        boolean displayInvisible = displayProfile.displayInvisible;
        int answerDropdownLimit = displayProfile.answerDropdownLimit;
        boolean displayMetadataDevice = displayProfile.displayMetadataDevice;

        createDisplayProfile(index, name, matrix, displayValues, instructions,
                numbering, displayType, numberOfColumns, displayInvisible, answerDropdownLimit,
                displayMetadataDevice);

    }

    protected void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues, boolean instructions,
                                        boolean numbering, String displayType, int numberOfColumns, boolean displayInvisible,
                                        int answerDropdownLimit) {
        createDisplayProfile(index, name, matrix, displayValues, instructions,
                numbering, displayType, numberOfColumns, displayInvisible, answerDropdownLimit, false);
    }

    protected void createDisplayProfile(int index, String name, boolean matrix, boolean displayValues, boolean instructions,
                                        boolean numbering, String displayType, int numberOfColumns, boolean displayInvisible,
                                        int answerDropdownLimit, boolean displayMetadataDevice) {
        textPresent("Add Profile");
        clickElement(By.id("addDisplayProfile"));
        clickElement(By.cssSelector("#profile_" + index + " mat-panel-title h3"));
        clickElement(By.xpath("//*[@id='profileNameEdit_" + index + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='profileNameEdit_" + index + "']//input[@type='text']")).clear();
        findElement(By.xpath("//*[@id='profileNameEdit_" + index + "']//input[@type='text']")).sendKeys(name);
        clickElement(By.xpath("//*[@id='profileNameEdit_" + index + "']//button/mat-icon[normalize-space() = 'check']"));
        if (!matrix) clickElement(By.id("displayAsMatrix_" + index));
        if (displayValues) clickElement(By.id("displayValues_" + index));
        if (!instructions) clickElement(By.id("displayInstructions_" + index));
        if (!numbering) clickElement(By.id("displayNumbering_" + index));
        if (displayMetadataDevice) clickElement(By.id("displayMetadataDevice_" + index));

        clickElement(By.id("displayType_" + index));
        clickElement(By.xpath("//mat-option[contains(.,'" + displayType + "')]"));

        WebElement slider = findElement(By.cssSelector("#profile_" + index + " .mat-slider-wrapper"));
        Actions slide = new Actions(driver);
        int width = slider.getSize().getWidth() / 6;
        slide.moveToElement(slider, width * (numberOfColumns - 1) + width / 2, slider.getSize().getHeight() / 2).click().build().perform();

        if (displayInvisible) clickElement(By.id("displayInvisible_" + index));

        if (answerDropdownLimit > 0) {
            findElement(By.id("displayAnswerDropdownLimit_" + index)).clear();
            findElement(By.id("displayAnswerDropdownLimit_" + index)).sendKeys(String.valueOf(answerDropdownLimit));
        }
        clickElement(By.xpath("//*[@id='profile_" + index + "']//h4[text()='View Specific Settings']"));

    }

    protected void deleteDisplayProfile(int index) {
        deleteWithConfirm("//*[@id = 'profile_" + index + "']");
    }

    protected void deleteSkipLogicById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'skipLogicEditTextarea')]//mat-icon[.='edit']"));
        List<WebElement> deleteButtons = findElements(By.xpath("//*[contains(@id,'skipLogicDelete_')]"));
        for (WebElement deleteButton : deleteButtons) {
            deleteButton.click();
        }
        clickElement(By.id("saveNewSkipLogicButton"));
    }

    protected void addSkipLogicById(String id, String label, String operator, String answer, String answerType) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'skipLogicEditTextarea')]//mat-icon[.='edit']"));
        clickElement(By.id("addNewSkipLogicButton"));
        if (label != null && label.length() > 0) {
            new Select(findElement(By.id("skipLogicLabelSelection_0"))).selectByVisibleText(label);
        }
        if (operator != null && operator.length() > 0) {
            new Select(findElement(By.id("skipLogicOperatorSelection_0"))).selectByVisibleText(operator);
        }
        if (answer != null && answer.length() > 0) {
            if (answerType.equals("date") || answerType.equals("number") || answerType.equals("text")) {
                findElement(By.id("skipLogicAnswer_0")).sendKeys(answer);
            }
            if (answerType.equals("value list")) {
                new Select(findElement(By.id("skipLogicAnswerSelection_0"))).selectByVisibleText(answer);

            }
        }
        clickElement(By.id("saveNewSkipLogicButton"));
    }

    protected void checkAnswerValue(List<WebElement> list, boolean displayAnswerValue) {
        ListIterator<WebElement> iterator = list.listIterator();
        while (iterator.hasNext()) {
            WebElement next = iterator.next();
            String nextText = next.getText().trim();
            if (displayAnswerValue) {
                Assert.assertNotEquals(nextText, "");
            } else {
                Assert.assertEquals(nextText, "");
            }
        }
    }

}
