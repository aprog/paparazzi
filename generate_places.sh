#!/bin/bash

PLACES_COUNT=500
MAX_FILES_PER_RECORD=3

for (( i=0; i<$PLACES_COUNT; i++ ))
do
    random_uid=$(curl -s -X GET localhost:3000/user/list | grep '"_id"' | cut -d '"' -f 4 | sort -R | head -n 1)
    random_celeb=$(curl -s -X GET localhost:3000/celeb/list | grep '"_id"' | cut -d '"' -f 4 | sort -R | head -n 1)
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

    files=""
    files_random_count=$(shuf -i 0-$MAX_FILES_PER_RECORD -n 1)

    for (( j=0; j<$files_random_count; j++ ))
    do
        if [ -z "$files" ]; then
            files="-F photos=@"$(ls -pA | grep -v "/$" | sort -R | head -n 1)
        else
            files=$files" -F photos=@"$(ls -pA | grep -v "/$" | sort -R | head -n 1)
        fi
    done

#    echo -e "$files"
#    echo -e "\n\n\n\n\n"
#    continue

    curl -X POST \
        -F userId=$random_uid \
        -F celebId=$random_celeb \
        -F message="$message" \
        -F loc[latitude]=$lat \
        -F loc[longtitude]=$long \
        $files \
        localhost:3000/place

    if [ $? -eq 0 ]; then
        printf "\nAdded [%3d] place with location: %9.5f %10.5f\n" $i $lat $long
    else
        echo "\nCan not run curl command"
    fi

done
