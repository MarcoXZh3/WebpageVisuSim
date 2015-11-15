#!/bin/bash

# https://github.com/DavyLandman/ncd
#./ncds.py databases/Subset01/*.png > databases/re.txt

max=10
output=databases/ncd-result.txt;

for ((i = 1; i <= $max; i++)); do
    path=$(printf "databases/Subset%02d/*.png" "$i")
    output=$(printf "databases/ncd-results%02d.txt" "$i")
    echo Subset -- $i
    ./ncds.py $path > $output
    echo
done

