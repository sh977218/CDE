export host_name=`hostname`

if [ "$host_name" == "dvlb7cde01" ]
then
sh ./deploy/runSeleniumCI1.sh
fi
if [ "$host_name" == "dvlb7cde02" ]
then
sh ./deploy/runSeleniumCI2.sh
fi

cd test/selenium;
node ../verifyConsoleLogs.js
