mkdir -p build/npmlog
grep /usr/nlm/apps/bamboo-agent/home/temp/log_spool/$bamboo_plan_storageTag-$bamboo_shortJobKey-$bamboo_buildNumber.log -oe "/home/bambooadm/\.npm/_logs/.*\.log" | xargs cp -t build/npmlog

pkill -TERM -P $(cat build/test.pid)
echo $?

cd build

node node_modules/nyc/bin/nyc check-coverage
