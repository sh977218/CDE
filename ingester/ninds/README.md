## Steps
* run `node ingester/ninds/web/loadNindsFromWeb.js`
* Apply manual fixes in following section to Ninds collection in migration DB.
* run `node ingester/ninds/loader/loadNinds.js'`

## Notes
The data is grabbed from this link: https://www.commondataelements.ninds.nih.gov/#page=Default, under dropdown 'CDEs'.
* Form definitions are kept from previous load, since this load doesn't have form description.
* form id is come from the id attribute in th element of DOM. 'form1234' became '1234';
* The link on the form name is reference document.
* If CDE has column 'Permissible Values', data type will be 'Value List'. Else column 'Data Type' is the CDE's data type.
* Column 'Input Restrictions' is the question mutiselect.
* Column 'Min Value' is the CDE data type 'Number' min.
* Column 'Max Value' is the CDE data type 'Number' max.
* Column 'CDE Id', 'Variable Name', 'LOINC ID', 'SNOMED','caDSR ID', 'CDISC ID' will be in CDE's ids.
* Copy 'Domain' under 'Disease'.

## Fixes
https://www.commondataelements.ninds.nih.gov/ReportViewer.aspx?/nindscdereports/rptAllCDE&rs:Command=Render&rc:Parameters=false&CDEName=&DiseaseName=Neuromuscular%20Diseases&SubDiseaseName=Neuromuscular%20Diseases%20(NMD)&DomainName=+&SubDomainName=Imaging%20Diagnostics&Classification=+&IsCopyright=&Population=+&CdeId=+&keyword=&CrfId=F1053&CrfName=Diffusion%20Tensor%20Imaging%20(DTI)
https://www.commondataelements.ninds.nih.gov/ReportViewer.aspx?/nindscdereports/rptAllCDE&rs:Command=Render&rc:Parameters=false&CDEName=&DiseaseName=&SubDiseaseName=&DomainName=+&SubDomainName=Imaging%20Diagnostics&Classification=+&IsCopyright=&Population=+&CdeId=+&keyword=&CrfId=F1053&CrfName=Diffusion%20Tensor%20Imaging%20(DTI)
have different question list, C02495, C10567 and C02496 are in different order in those two form.
This is only one of the example.

CDE C21408, C21409, C21410, C21411, C21412, C21413, and so on have
Description: Minor;Minor;Moderate;Moderate;Severe;Severe;Not experiencing this symptom;
Permissible Value: 1;2;3;4;5;6;0;
change Description to Minor;Minor+;Moderate;Moderate+;Severe;Severe+;Not experiencing this symptom;
run this command in mongo shell multiple times until see `Updated 0 record(s) in XXms`
`
db.getCollection('ninds').update({'cdes.Description':'Minor;Minor;Moderate;Moderate;Severe;Severe;Not experiencing this symptom;'},{$set:{'cdes.$.Description':'Minor;Minor+;Moderate;Moderate+;Severe;Severe+;Not experiencing this symptom;'}},{multi:true});
`

CDE C07070 has
Description: No intervention;No intervention;No intervention;No intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;More intensive treatment;More intensive treatment;More intensive treatment;More intensive treatment;More intensive treatment;
Permissible Value: 0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;
change Description to No intervention;No intervention+;No intervention++;No intervention+++;Receive brief intervention;Receive brief intervention+;Receive brief intervention++;Receive brief intervention+++;Receive brief intervention++++;Receive brief intervention+++++;Receive brief intervention++++++;Receive brief intervention+++++++;Receive brief intervention++++++++;Receive brief intervention+++++++++;Receive brief intervention++++++++++;Receive brief intervention+++++++++++;Receive brief intervention++++++++++++;Receive brief intervention+++++++++++++;Receive brief intervention++++++++++++++;Receive brief intervention+++++++++++++++;Receive brief intervention++++++++++++++++;Receive brief intervention+++++++++++++++++;Receive brief intervention++++++++++++++++++;Receive brief intervention+++++++++++++++++++;Receive brief intervention++++++++++++++++++++;Receive brief intervention+++++++++++++++++++++;Receive brief intervention++++++++++++++++++++++;More intensive treatment;More intensive treatment+;More intensive treatment++;More intensive treatment+++;More intensive treatment++++;
run this command in mongo shell multiple times until see `Updated 0 record(s) in XXms`
`
db.getCollection('ninds').update({'cdes.Description':'No intervention;No intervention;No intervention;No intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;Receive brief intervention;More intensive treatment;More intensive treatment;More intensive treatment;More intensive treatment;More intensive treatment;'},{$set:{'cdes.$.Description':'No intervention;No intervention+;No intervention++;No intervention+++;Receive brief intervention;Receive brief intervention+;Receive brief intervention++;Receive brief intervention+++;Receive brief intervention++++;Receive brief intervention+++++;Receive brief intervention++++++;Receive brief intervention+++++++;Receive brief intervention++++++++;Receive brief intervention+++++++++;Receive brief intervention++++++++++;Receive brief intervention+++++++++++;Receive brief intervention++++++++++++;Receive brief intervention+++++++++++++;Receive brief intervention++++++++++++++;Receive brief intervention+++++++++++++++;Receive brief intervention++++++++++++++++;Receive brief intervention+++++++++++++++++;Receive brief intervention++++++++++++++++++;Receive brief intervention+++++++++++++++++++;Receive brief intervention++++++++++++++++++++;Receive brief intervention+++++++++++++++++++++;Receive brief intervention++++++++++++++++++++++;More intensive treatment;More intensive treatment+;More intensive treatment++;More intensive treatment+++;More intensive treatment++++;'}},{multi:true});
`

CDE C52453 has
Description: None;Mild;mild;Moderate;Moderate;Severe;Severe;
Permissible Value: 0;1;2;3;4;5;6;
change Description to None;Mild;mild+;Moderate;Moderate+;Severe;Severe+;
run this command in mongo shell multiple times until see `Updated 0 record(s) in XXms`
`
db.getCollection('ninds').update({'cdes.Description':'None;Mild;mild;Moderate;Moderate;Severe;Severe;'},{$set:{'cdes.$.Description':'None;Mild;mild+;Moderate;Moderate+;Severe;Severe+;'}},{multi:true});
`


# Why not load data from exports
export files are under S:\MLB\CDE\NINDS\export\
* Load CDE from DataElement.xlsx as the following problem:
    * CDE ID is missing. 
* Load Form from Forms.xml has the following information.
    * Data Type is missing.
    * Data Type property is missing, i.e. Min Value, Max Value, Size.
    * Question Text is missing.
    * Multiple Select (based on Input Restrictions) is missing, 
    * Instructions is missing.