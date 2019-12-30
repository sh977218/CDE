package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class OdmExport extends BaseFormTest {
    @Test
    public void odmExport() {
        mustBeLoggedInAs(reguser_username, password);

        String response = get(baseUrl + "/api/form/Xy1kuxJqm?type=xml&subtype=odm").asString();
        String[] expectedResults =
                {
                        "<Study OID=\"Xy1kuxJqm\"><GlobalVariables><StudyName>ODM Export Test Form</StudyName><StudyDescription>Test ODM Export</StudyDescription><ProtocolName>ODM Export Test Form</ProtocolName></GlobalVariables><BasicDefinitions/><MetaDataVersion Name=\"ODM Export Test Form\" OID=\"MDV_Xy1kuxJqm\"><Protocol><StudyEventRef Mandatory=\"Yes\" OrderNumber=\"1\" StudyEventOID=\"SE_Xy1kuxJqm\"/></Protocol><StudyEventDef Name=\"SE\" OID=\"SE_Xy1kuxJqm\" Repeating=\"No\" Type=\"Unscheduled\"><FormRef FormOID=\"Xy1kuxJqm\" Mandatory=\"Yes\" OrderNumber=\"1\"/></StudyEventDef><FormDef Name=\"ODM Export Test Form\" OID=\"Xy1kuxJqm\" Repeating=\"No\"><ItemGroupRef ItemGroupOID=\"85d792fb1cefbc95abe7382689803374\" Mandatory=\"Yes\" OrderNumber=\"1\"/></FormDef><ItemGroupDef Name=\"Top Section\" OID=\"85d792fb1cefbc95abe7382689803374\" Repeating=\"No\"><Description><TranslatedText xml:lang=\"en\">Top Section</TranslatedText></Description><ItemRef ItemOID=\"c15vK97pK5X_s0_q0\" Mandatory=\"Yes\" OrderNumber=\"0\"/><ItemRef ItemOID=\"OtsN78xANu1_s0_q1\" Mandatory=\"Yes\" OrderNumber=\"1\"/><ItemRef ItemOID=\"UYcsJsfRmMb_s0_q2\" Mandatory=\"Yes\" OrderNumber=\"2\"/></ItemGroupDef><ItemDef DataType=\"text\" Name=\"Gender type\" OID=\"c15vK97pK5X_s0_q0\"><Question><TranslatedText xml:lang=\"en\">Gender type</TranslatedText></Question><CodeListRef CodeListOID=\"CL_c15vK97pK5X_s0_q0\"/></ItemDef><ItemDef DataType=\"date\" Name=\"Birth date\" OID=\"OtsN78xANu1_s0_q1\"><Question><TranslatedText xml:lang=\"en\">Birth date</TranslatedText></Question><CodeListRef CodeListOID=\"CL_OtsN78xANu1_s0_q1\"/></ItemDef><ItemDef DataType=\"float\" Name=\"Walking speed value\" OID=\"UYcsJsfRmMb_s0_q2\"><Question><TranslatedText xml:lang=\"en\">Walking speed value</TranslatedText></Question><CodeListRef CodeListOID=\"CL_OtsN78xANu1_s0_q1\"/></ItemDef><CodeList DataType=\"text\" OID=\"CL_c15vK97pK5X_s0_q0\" Name=\"Gender type\"><CodeListItem CodedValue=\"Female\"><Decode><TranslatedText xml:lang=\"en\">Female</TranslatedText></Decode></CodeListItem><CodeListItem CodedValue=\"Male\"><Decode><TranslatedText xml:lang=\"en\">Male</TranslatedText></Decode></CodeListItem><CodeListItem CodedValue=\"Unknown\"><Decode><TranslatedText xml:lang=\"en\">Unknown</TranslatedText></Decode></CodeListItem><CodeListItem CodedValue=\"Unspecified\"><Decode><TranslatedText xml:lang=\"en\">Undifferentiated/Indeterminant/Intersex</TranslatedText></Decode></CodeListItem><CodeListItem CodedValue=\"Not reported\"><Decode><TranslatedText xml:lang=\"en\">Not reported</TranslatedText></Decode></CodeListItem></CodeList><CodeList DataType=\"date\" OID=\"CL_OtsN78xANu1_s0_q1\" Name=\"Birth date\"/></MetaDataVersion></Study></element>"
                };

        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }

        for (int i = 0; i < expectedResults.length - 2; i++) {
            String twoLines = expectedResults[i] + "\n" + expectedResults[i + 1];
            Assert.assertTrue(response.replaceAll("\\s+", "").contains(twoLines.replaceAll("\\s+", "")),
                    "missing: " + twoLines);
        }

        response = get(baseUrl + "/server/form/byId/590cc0da5b9fd620f835b547?type=xml&subtype=odm").asString();
        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }
    }


}
