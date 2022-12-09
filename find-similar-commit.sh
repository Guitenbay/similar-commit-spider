#!/bin/bash

usage="\nError: use args, such as start, stop and restart \n"

start=0
end=50
step=5

block=10

for ((i = start; i < end; i += step)); do
  touch out-c/file_$i.txt && npm run commit $i $block > out-c/file_$i.txt 2>&1
done
