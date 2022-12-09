#!/bin/bash

usage="\nError: use args, such as start, stop and restart \n"

limit=90
block=10

for ((i = 0; i <= limit; i += 5)); do
  touch out-c/file_$i.txt && npm run commit $i $block > out-c/file_$i.txt 2>&1
done
