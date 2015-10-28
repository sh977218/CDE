package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;
import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.RestAssured.get;

public class CdeExport extends NlmCdeBaseTest {

    @Test
    public void exportJson() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        findElement(By.id("export")).click();
        findElement(By.id("jsonExport")).click();

        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        System.out.print(response);
        Assert.assertTrue(response.contains("derivationRules\":[],\"referenceDocuments\":[],\"attachments\":[],\"comments\":[],\"mappingSpecifications\":[],\"ids\":[{\"source\":\"NINDS\",\"id\":\"C06429\",\"version\":\"3\"},{\"source\":\"NINDS Variable Name\",\"id\":\"SpnlColmInjNum\"}],\"properties\":[{\"key\":\"NINDS Guidelines\",\"value\":\"SCI:\\nRecord the injury number if 2 or more injuries were experienced. Check against single/multiple variable to ensure only one record exists if Single was checked, and 2 or more records exist if Multiple was checked.\",\"valueFormat\":\"html\"},{\"key\":\"NINDS Notes\",\"value\":\"SCI:\\nSCI Variable: SPNINJNO\",\"valueFormat\":\"html\"},{\"key\":\"NINDS Suggested Question\",\"value\":\"SCI (F0831):\\nSpinal column injury number\",\"valueFormat\":\"html\"},{\"key\":\"NINDS References\",\"value\":\"SCI:\\nDvorak MF, Wing PC, Fehlings MG, Vaccaro AR, Itshayek E, Biering-Sorensen F, Noonan VK. International Spinal Cord Injury Spinal Column Injury Basic Data Set. Spinal Cord. 2012 Jun 5. [Epub ahead of print]\",\"valueFormat\":\"html\"}],\"classification\":[{\"elements\":[{\"name\":\"Population\",\"elements\":[{\"name\":\"Adult\"}]},{\"name\":\"Domain\",\"elements\":[{\"elements\":[{\"name\":\"The International SCI Data Sets\"}],\"name\":\"The International SCI Data Sets\"}]},{\"name\":\"Disease\",\"elements\":[{\"elements\":[{\"elements\":[{\"name\":\"Supplemental\"}],\"name\":\"Classification\"}],\"name\":\"Spinal Cord Injury\"}]}],\"stewardOrg\":{\"name\":\"NINDS\"}}],\"registrationState\":{\"registrationStatus\":\"Qualified\"},\"history\":[],\"valueDomain\":{\"datatype\":\"Integer\",\"permissibleValues\":[]},\"property\":{\"concepts\":[]},\"objectClass\":{\"concepts\":[]},\"dataElementConcept\":{\"concepts\":[]},\"stewardOrg\":{\"name\":\"NINDS\"},\"naming\":[{\"designation\":\"Spinal column injury number\",\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\",\"languageCode\":\"EN-US\",\"context\":{\"contextName\":\"Health\",\"acceptability\":\"preferred\"}}]}"));
        switchTabAndClose(0);
    }

    @Test
    public void exportXml() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        findElement(By.id("export")).click();
        findElement(By.id("xmlExport")).click();

        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.replaceAll("\\s+", "").contains((
                "</ids>\n" +
                        "<ids>\n" +
                        "<source>NINDS Variable Name</source>\n" +
                        "<id>SpnlColmInjNum</id>\n" +
                        "</ids>\n" +
                        "<properties>\n" +
                        "<key>NINDS Guidelines</key>\n" +
                        "<value>\n" +
                        "SCI: Record the injury number if 2 or more injuries were experienced. Check against single/multiple variable to ensure only one record exists if Single was checked, and 2 or more records exist if Multiple was checked.\n" +
                        "</value>\n" +
                        "<valueFormat>html</valueFormat>\n" +
                        "</properties>\n" +
                        "<properties>\n" +
                        "<key>NINDS Notes</key>\n" +
                        "<value>SCI: SCI Variable: SPNINJNO</value>\n" +
                        "<valueFormat>html</valueFormat>\n" +
                        "</properties>\n" +
                        "<properties>\n" +
                        "<key>NINDS Suggested Question</key>\n" +
                        "<value>SCI (F0831): Spinal column injury number</value>\n" +
                        "<valueFormat>html</valueFormat>\n" +
                        "</properties>\n" +
                        "<properties>\n" +
                        "<key>NINDS References</key>\n" +
                        "<value>\n" +
                        "SCI: Dvorak MF, Wing PC, Fehlings MG, Vaccaro AR, Itshayek E, Biering-Sorensen F, Noonan VK. International Spinal Cord Injury Spinal Column Injury Basic Data Set. Spinal Cord. 2012 Jun 5. [Epub ahead of print]\n" +
                        "</value>\n" +
                        "<valueFormat>html</valueFormat>\n" +
                        "</properties>\n" +
                        "<classification>\n" +
                        "<elements>\n" +
                        "<name>Population</name>\n" +
                        "<elements>\n" +
                        "<name>Adult</name>\n" +
                        "</elements>\n" +
                        "</elements>\n" +
                        "<elements>\n" +
                        "<name>Domain</name>\n" +
                        "<elements>\n" +
                        "<elements>\n" +
                        "<name>The International SCI Data Sets</name>\n" +
                        "</elements>\n" +
                        "<name>The International SCI Data Sets</name>\n" +
                        "</elements>\n" +
                        "</elements>\n" +
                        "<elements>\n" +
                        "<name>Disease</name>\n" +
                        "<elements>\n" +
                        "<elements>\n" +
                        "<elements>\n" +
                        "<name>Supplemental</name>\n" +
                        "</elements>\n" +
                        "<name>Classification</name>\n" +
                        "</elements>\n" +
                        "<name>Spinal Cord Injury</name>\n" +
                        "</elements>\n" +
                        "</elements>\n" +
                        "<stewardOrg>\n" +
                        "<name>NINDS</name>\n" +
                        "</stewardOrg>\n" +
                        "</classification>\n" +
                        "<registrationState>\n" +
                        "<registrationStatus>Qualified</registrationStatus>\n" +
                        "</registrationState>\n" +
                        "<valueDomain>\n" +
                        "<datatype>Integer</datatype>\n" +
                        "</valueDomain>\n" +
                        "<property></property>\n" +
                        "<objectClass></objectClass>\n" +
                        "<dataElementConcept></dataElementConcept>\n" +
                        "<stewardOrg>\n" +
                        "<name>NINDS</name>\n" +
                        "</stewardOrg>\n" +
                        "<naming>\n" +
                        "<designation>Spinal column injury number</designation>\n" +
                        "<definition>\n" +
                        "Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\n" +
                        "</definition>\n" +
                        "<languageCode>EN-US</languageCode>\n" +
                        "<context>\n" +
                        "<contextName>Health</contextName>\n" +
                        "<acceptability>preferred</acceptability>\n" +
                        "</context>\n" +
                        "</naming>\n").replaceAll("\\s+","")));
        switchTabAndClose(0);
    }
}
