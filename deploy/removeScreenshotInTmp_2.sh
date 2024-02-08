find /tmp/*.png -user bambooadm  | xargs rm -f
find /tmp/*.jpg -user bambooadm  | xargs rm -f
find /tmp/*.bin -user bambooadm  | xargs rm -f

echo 'Try last step by calling script from repo (temp)'
