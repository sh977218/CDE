rm -rf screenshots
rm -rf reports
rm report.html
rm selenium-debug.log

rm nwTests/simpleTest*.js

for f in {1..50}; do cp nwTests/quickTest.js nwTests/simpleTest$f.js; done

nightwatch

junit-viewer --results=reports --save=report.html



