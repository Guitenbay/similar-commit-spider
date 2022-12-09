#!/bin/bash

usage="\nError: use args, such as start, stop and restart \n"

start=100
end=150
step=5

block=10

for ((i = start; i < end; i += step)); do
  time=$(date "+%Y-%m-%d %H:%M:%S")
  index=$(expr $i + 1)
  echo "> [${time}] (${index}) START getting similar commit range (${i}, ${block})..."
  touch out-c/file_$i.txt && npm run commit $i $block > out-c/file_$i.txt 2>&1
done
time=$(date "+%Y-%m-%d %H:%M:%S")
echo "> [${time}] DONE! <"
