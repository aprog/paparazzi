#!/bin/bash

PLACES_COUNT=100
MAX_FILES_PER_RECORD=10

for (( i=0; i<$PLACES_COUNT; i++))
do
    random_uid=$(curl -s -X GET localhost:3000/users | grep '"_id"' | cut -d '"' -f 4 | sort -R | head -n 1)
    random_celeb=$(curl -s -X GET localhost:3000/celebs | grep '"_id"' | cut -d '"' -f 4 | sort -R | head -n 1)
    message="Etiam ultricies nisi vel augue."

    lat=$(shuf -i 0-90 -n 1).$(shuf -i 0-10000 -n 1)
    lat_sign=$(shuf -i 0-1 -n 1)
    if [ $lat_sign != 0 ]; then
	lat=-$lat
    fi

    long=$(shuf -i 0-180 -n 1).$(shuf -i 0-10000 -n 1)
    long_sign=$(shuf -i 0-1 -n 1)
    if [ $long_sign != 0 ]; then
	long=-$long
    fi

    file=$(ls | sort -R | head -n 1)

    curl -X POST \
       -F userId=$random_uid \
       -F celebId=$random_celeb \
       -F message="$message" \
       -F loc[lat]=$lat \
       -F loc[long]=$long \
       -F photos=@/home/alex/.bashrc \
       -F photos=@/home/alex/.bash_profile \
       localhost:3000/place
    echo ""
done
