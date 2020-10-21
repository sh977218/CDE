package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;

import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormAddCdeTest extends QuestionTest {
    @Test
    public void formAddCde() {
        String form = "formAddCdeTest";
        String cdeName1 = "newCde1";
        String[] cdeNames = new String[]{"newCde2", "newCde3", "newCde4", "newCde5"};
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();
        addCdeByNameBeforeId(cdeName1, "question_0-0", false);
        addCdesByNames(cdeNames);
        startEditQuestionById("question_0-1");
        Assert.assertEquals(
                driver.findElements(By.xpath("//*[@id='question_0-1']//mat-card//mat-chip-list//mat-chip/mat-icon")).size(),
                0
        );
        addCdeDesignationById("question_0-1", "newCde2 second name");
        Assert.assertEquals(
                driver.findElements(By.xpath("//*[@id='question_0-1']//mat-card//mat-chip-list//mat-chip/mat-icon")).size(),
                2
        );
        addCdeIdentifierById("question_0-1", "newCde2Source", "newCde2Id");
        editCdeDataTypeById("question_0-1", "Date");

        addCdeDesignationById("question_0-2", "newCde3 second name");
        addCdeDesignationById("question_0-2", "newCde3 third name");
        deleteCdeNameById("question_0-2", "newCde3 third name");
        addCdeIdentifierById("question_0-2", "newCde3Source", "newCde3Id");
        addCdeIdentifierById("question_0-2", "newCde3Source3", "newCde3Id3");
        deleteCdeIdentifierById("question_0-2", "newCde3Source", "newCde3Id");
        editCdeDataTypeById("question_0-2", "Number");

        editCdeDataTypeById("question_0-3", "Value List");
        addCdePvById("question_0-3", "1");
        addCdePvById("question_0-3", "2");
        addCdePvById("question_0-3", "3");
        deleteCdePvById("question_0-3", "3");
        saveFormEdit();
        newFormVersion();
        checkNewCde1();
        checkNewCde2();
        checkNewCde3();
        checkNewCde4();
        checkNewCde5();
    }

    private void checkNewCde1() {
        String cdeName1 = "newCde1";
        goToCdeByName(cdeName1);
        goToPermissibleValues();
        textPresent("Text", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName1, By.id("designation_0"));
        textPresent("Question Text", By.id("designationTags_0"));
    }

    private void checkNewCde2() {
        String cdeName2 = "newCde2";
        goToCdeByName(cdeName2);
        goToPermissibleValues();
        textPresent("Date", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName2, By.id("designation_0"));
        textPresent("Question Text", By.id("designationTags_0"));

        textPresent("newCde2 second name", By.id("designation_1"));

        goToIdentifiers();
        textPresent("newCde2Source", By.id("source_0"));
        textPresent("newCde2Id", By.id("id_0"));
    }

    private void checkNewCde3() {
        String cdeName3 = "newCde3";
        goToCdeByName(cdeName3);
        goToPermissibleValues();
        textPresent("Number", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName3, By.id("designation_0"));
        textPresent("Question Text", By.id("designationTags_0"));
        textPresent("newCde3 second name", By.id("designation_1"));
        textNotPresent("newCde3 third name");

        goToIdentifiers();
        textPresent("newCde3Source", By.id("source_0"));
        textPresent("newCde3Id", By.id("id_0"));
    }

    private void checkNewCde4() {
        String cdeName4 = "newCde4";
        goToCdeByName(cdeName4);
        goToPermissibleValues();
        textPresent("Value List", By.id("datatypeSelect"));
        textPresent("1", By.id("pvValue_0"));

        goToNaming();
        textPresent(cdeName4, By.id("designation_0"));
        textPresent("Question Text", By.id("designationTags_0"));
    }

    private void checkNewCde5() {
        String cdeName5 = "newCde5";
        goToCdeByName(cdeName5);
        goToPermissibleValues();
        textPresent("Text", By.id("datatypeSelect"));

        goToNaming();
        textPresent(cdeName5, By.id("designation_0"));
        textPresent("Question Text", By.id("designationTags_0"));
    }

    private void addCdesByNames(String[] cdeNames) {
        for (String cdeName : cdeNames) {
            new Actions(driver).sendKeys("q").build().perform();
            textPresent("Create Data Element");
            // wait for modal animation
            hangon(2);
            new Actions(driver).sendKeys(cdeName).build().perform();
            clickElement(By.id("createNewDataElement"));
        }
    }


}
