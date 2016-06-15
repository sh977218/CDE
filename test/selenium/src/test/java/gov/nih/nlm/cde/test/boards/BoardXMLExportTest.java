package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardXMLExportTest  extends BoardTest {

//    @Test
    public void boardXMLExport() {
            mustBeLoggedInAs(classifyBoardUser_username, password);
            goToBoard("Classify Board");
            textPresent("Export Board");
            clickElement(By.id(("export")));
            findElement(By.id("xmlExport")).click();
            switchTab(1);


            String[] expected = {
                    "<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>",
                    "</elements>\n<name>Domain</name>",
                    "<primaryDefinitionCopy>\nDate (and time, if applicable and known) the Manual Muscle Testing (MMT) was performed\n</primaryDefinitionCopy>",
                    "<source>NINDS Variable Name</source>",
                    "<primaryDefinitionCopy>\nIndicator how often the subject feels irritable or has angry outbursts as part of PTSD Checklist Military (PCLM).\n</primaryDefinitionCopy>",
                    "<changeNote>Bulk update from source</changeNote>"
            };
            for (String s : expected) {
                    textPresent(s);
            }

            switchTabAndClose(0);
    }
}
