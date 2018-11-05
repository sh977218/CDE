1. run node ingester/phenx/website/loadPhenxFromWeb.js to grab the raw data from site.
2. run node ingester/phenx/loader/loadPhenx.js to update CDE and From.


loadPhenx script only retires PhenX Forms


If previous PhenX forms, even with LOINC id, do not present in the current load, the forms will be retired.

