## Steps

* run `node ingester/ninds/web/loadNindsFromWeb.js`
* Apply manual fixes in following section to Ninds collection in migration DB.
* run `node ingester/ninds/loader/loadNinds.js'`

## Notes

The data is grabbed from this link: https://www.commondataelements.ninds.nih.gov/#page=Default, under dropdown 'CDEs'.

* Form definitions are kept from previous load, since this load doesn't have form description.
* form id is come from the id attribute in th element of DOM. 'form1234' became '1234';
* The link on the form name is reference document.
* If CDE has column 'Permissible Values', data type will be 'Value List'. Else column 'Data Type' is the CDE's data
  type.
* Column 'Input Restrictions' is the question mutiselect.
* Column 'Min Value' is the CDE data type 'Number' min.
* Column 'Max Value' is the CDE data type 'Number' max.
* Column 'CDE Id', 'Variable Name', 'LOINC ID', 'SNOMED','caDSR ID', 'CDISC ID' will be in CDE's ids.
* Copy 'Domain' under 'Disease'.

## Fixes

* F0807 and F1006 is merged on CDE production, but F0807 on NINDS is
  empty. https://www.commondataelements.ninds.nih.gov/Parkinson%27s%20Disease \
  run `db.getCollection('NINDS').find({formId:{$in:['F0807', 'F1006']}})` and copy cdes from F1006 to F0807.

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
