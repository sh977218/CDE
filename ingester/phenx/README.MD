loadPhenxFromWebsite grabs from the legacy website https://original-phenxtoolkit.rti.org/
Next time we update the loader, we will need to grab from the current site at: https://www.phenxtoolkit.org/protocols

## Steps
* Run node ingester/phenx/website/loadPhenxFromWebsite.js to grab the raw data from site.
* Run node ingester/phenx/loader/loadPhenx.js to update CDEs and Froms.


The loadPhenx script retires PhenX Forms, but does not retire CDEs


If previous PhenX forms, even with LOINC id, do not present in the current load, the forms will be retired.


LOINC CDE/Form loaded through PhenX steward Org is LOINC, classification is empty;

PhenX form 030502 does have LOINC id 62551-7 in version 23, does not have LOINC id. For the load, remove LOINC id from Measure collection of 030502.
