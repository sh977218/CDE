package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;

import org.openqa.selenium.By;
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
        addCdeByNameBeforeId(cdeName1, "question_0_0", false);
        addCdesByNames(cdeNames);
        addCdeNameById("question_0_1", "newCde2 second name", "newCde2 second definition", new String[]{"TEST"});
        addCdeIdentifierById("question_0_1", "newCde2Source", "newCde2Id", "newCde2Version");
        editCdeDataTypeById("question_0_1", "Date");

        addCdeNameById("question_0_2", "newCde3 second name", "newCde3 second definition",
                new String[]{"TEST", "Preferred Question Text"});
        addCdeNameById("question_0_2", "newCde3 third name", "you should not see this definition",
                new String[]{"Preferred Question Text"});
        deleteCdeNameById("question_0_2", 3);
        addCdeIdentifierById("question_0_2", "newCde3Source", "newCde3Id", "newCde3Version");
        addCdeIdentifierById("question_0_2", "newCde3Source3", "newCde3Id3", "newCde3Version3");
        deleteCdeIdentifierById("question_0_2", 1);
        editCdeDataTypeById("question_0_2", "Number");

        editCdeDataTypeById("question_0_3", "Value List");
        addCdePvById("question_0_3", "1", "1", "1", "1", "1");
        addCdePvById("question_0_3", "2", "2", "2", "2", "2");
        addCdePvById("question_0_3", "3", "3", "3", "3", "3");
        deleteCdePvById("question_0_3", 2);
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
        textPresent("Question Text", By.id("tags_0"));
    }

    private void checkNewCde2() {
        String cdeName2 = "newCde2";
        goToCdeByName(cdeName2);
        goToPermissibleValues();
        textPresent("Date", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName2, By.id("designation_0"));
        textPresent("Question Text", By.id("tags_0"));

        textPresent("newCde2 second name", By.id("designation_1"));
        textPresent("newCde2 second definition", By.id("definition_1"));
        textPresent("TEST", By.id("tags_1"));

        goToIdentifiers();
        textPresent("newCde2Source", By.id("source_0"));
        textPresent("newCde2Id", By.id("id_0"));
        textPresent("newCde2Version", By.id("version_0"));
    }

    private void checkNewCde3() {
        String cdeName3 = "newCde3";
        goToCdeByName(cdeName3);
        goToPermissibleValues();
        textPresent("Number", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName3, By.id("designation_0"));
        textPresent("Question Text", By.id("tags_0"));
        textPresent("newCde3 second name", By.id("designation_1"));
        textPresent("newCde3 second definition", By.id("definition_1"));
        textPresent("TEST", By.id("tags_1"));
        textPresent("Preferred Question Text", By.id("tags_1"));
        textNotPresent("newCde3 third name");
        textNotPresent("you should not see this definition");

        goToIdentifiers();
        textPresent("newCde3Source", By.id("source_0"));
        textPresent("newCde3Id", By.id("id_0"));
        textPresent("newCde3Version", By.id("version_0"));


    }

    private void checkNewCde4() {
        String cdeName4 = "newCde4";
        goToCdeByName(cdeName4);
        goToPermissibleValues();
        textPresent("Value List", By.id("datatypeSelect"));
        textPresent("1", By.id("pvValue_0"));
        textPresent("1", By.id("pvMeaningName_0"));
        textPresent("1", By.id("pvMeaningCode_0"));
        textPresent("1", By.id("pvCodeSystem_0"));
        textPresent("1", By.id("pvMeaningDefinition_0"));
        textPresent("3", By.id("pvValue_1"));
        textPresent("3", By.id("pvMeaningName_1"));
        textPresent("3", By.id("pvMeaningCode_1"));
        textPresent("3", By.id("pvCodeSystem_1"));
        textPresent("3", By.id("pvMeaningDefinition_1"));


        goToNaming();
        textPresent(cdeName4, By.id("designation_0"));
        textPresent("Question Text", By.id("tags_0"));
    }

    private void checkNewCde5() {
        String cdeName5 = "newCde5";
        goToCdeByName(cdeName5);
        goToPermissibleValues();
        textPresent("Text", By.id("datatypeSelect"));

        goToNaming();
        textPresent(cdeName5, By.id("designation_0"));
        textPresent("Question Text", By.id("tags_0"));
    }

}