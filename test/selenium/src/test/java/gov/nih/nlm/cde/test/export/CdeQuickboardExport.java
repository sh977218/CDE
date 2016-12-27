package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class CdeQuickboardExport extends NlmCdeBaseTest {

    @Test
    public void cdeQuickBoardExport() {
        mustBeLoggedOut();
        loadDefaultSettings();

        addCdeToQuickBoard("Intravesical Protocol Agent Administered Specify");
        addCdeToQuickBoard("Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing scale");
        addCdeToQuickBoard("User Login Name java.lang.String");

        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        textPresent("Export Quick Board");

        clickElement(By.id("qb_cde_export"));
        textPresent("Export downloaded.");
        closeAlert();
        findElement(By.id("qb_cde_empty")).click();

        String[] expected = {
                "Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"Intravesical Protocol Agent Administered Specify\",\"No explain\",\"CHARACTER\",\"\",\"0\",\"CTEP\",\"CTEP\",\"Qualified\",\"caDSR: 2399243 v1; MyOrigin1: MyId1 vMyVersion1; MyOrigin3: MyId3 vMyVersion3\"",
                "\"Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing  scale\",\"Like voices commenting, voices conversing are considered a Schneiderian first-rank symptom. They involve hearing two or more voices talking with one another, usually discussing something about the subject. As in the case of voices commenting, they should be scored independently of other auditory hallucinations.  Have you heard two or more voices talking with each other?  What did they say?\",\"Value List\",\"0; 1; 2; 3; 4; 5\",\"6\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09512 v3; NINDS Variable Name: SAPSVocConvrsngScale\"",
                "\"User Login Name java.lang.String\",\"\",\"java.lang.String\",\"\",\"0\",\"caCORE\",\"caBIG; caCORE\",\"Qualified\",\"caDSR: 2223533 v3\""
        };

        waitForDownload("QuickBoardExport.csv");

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/QuickBoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/QuickBoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "-----\nActual Export: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading QuickBoardExport.csv " + e);
        }

    }

}
