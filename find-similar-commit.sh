#!/bin/bash

usage="\nError: use args, such as start, stop and restart \n"

owner=redis
repo=jedis
start=400
end=500
step=5

block=10

time=$(date "+%Y-%m-%d %H:%M:%S")
echo "> [${time}] RUNNING SPIDER for ${owner}/${repo} <"
if [ ! -d "out-c" ]; then
  mkdir out-c
fi
if [ ! -d "out-c/$owner" ]; then
  mkdir out-c/$owner
fi
if [ ! -d "out-c/$owner/$repo" ]; then
  mkdir out-c/$owner/$repo
fi
for ((i = start; i < end; i += step)); do
  time=$(date "+%Y-%m-%d %H:%M:%S")
  index=$(expr $i + 1)
  echo "> [${time}] (${index}) START getting similar commit range (${i}, ${block})..."
  touch out-c/$owner/$repo/file_$i.txt && npm run commit $owner $repo $i $block > out-c/$owner/$repo/file_$i.txt 2>&1
done
time=$(date "+%Y-%m-%d %H:%M:%S")
echo "> [${time}] DONE! <"
