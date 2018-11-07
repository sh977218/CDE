loadPhenxFromWebsite grabs from the legacy website https://original-phenxtoolkit.rti.org/

Next time we update the loader, we will need to grab from the current site at: https://www.phenxtoolkit.org/protocols

## Steps
* Run node ingester/phenx/website/loadPhenxFromWebsite.js to grab the raw data from site.
* Run node ingester/phenx/loader/loadPhenx.js to update CDEs and Froms.

The loadPhenx script retires PhenX Forms, but does not retire CDEs

If a previous PhenX form is not present in the current load, the form will be retired, even if it has a LOINC ID.

LOINC subPanels are not classified with PhenX. These subPanels may have 0 classification. 

PhenX form 030502 has LOINC id 62551-7 in version 23, but does not show LOINC id in version 24. Before loading, we manually removed this LOINC id.
PhenX form 190401 has LOINC id 62959-2. LOINC CDE 67183-4 has duplicated Code 12. Before loading, we manually fix this LOINC.
All CDEs in PhenX form 710601 has duplicated PV 12. Before loading, we manually fix this LOINC.
1, Strongly disagree | 2, Disagree | 3, Agree | 4, Strongly disagree


Most of the time, redCap CSV is in the root of the zip. In form 240301, for some reason, it's under a folder by the same name. 

Most of the time, attachments are images under a folder. The name of the image matches the variable name. 
In one form, the full form is an image and the names don't match. 


