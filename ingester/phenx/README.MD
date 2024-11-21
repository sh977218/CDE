loadPhenxFromWebsite grabs from the current site at: https://www.phenxtoolkit.org/protocols

## Steps

* get PhenX Forms(pdf, csv,etc).
    * go to S:\MLB\CDE\PhenX
    * wget -r -k --no-check-certificate  https://www.phenxtoolkit.org/protocols
* Run node ingester/phenx/website/loadPhenxFromWebsite.js to grab the raw data from site.
* PhenX form 030502 has LOINC id 62551-7 in version 23, but does not show LOINC id in version 24. Before loading,
  manually remove this LOINC id from Measures collection.
* PhenX form 190401 has LOINC id 62959-2. LOINC CDE 67183-4 has duplicated Code 12. Before loading, manually fix the
  Measures collection.
* All CDEs in PhenX form 710601 have duplicated PV. Before loading, manually fix the CSV and rezip (it should say 4,
  Strongly agree).
* Run node ingester/phenx/loader/loadPhenx.js to update CDEs and Froms.

## Notes

* The loadPhenx script retires PhenX Forms, but does not retire CDEs
* If a previous PhenX form is not present in the current load, the form will be retired, even if it has a LOINC ID.
* LOINC subPanels are not classified with PhenX. These subPanels may have 0 classification.
* Most of the time, redCap CSV is in the root of the zip. In form 240301, for some reason, it's under a folder by the
  same name.
* Most of the time, attachments are images under a folder. The name of the image matches the variable name. In one form,
  the full form is an image and the names don't match. 

