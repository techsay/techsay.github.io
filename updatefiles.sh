#!/bin/bash

bak_dir="docs.bak"
dest_dir="docs"
src_dir="projects/docs/.vuepress/dist"
 # /Users/v-niexiaobo/Downloads/sites/

if [ -d ${bak_dir} ]; then
  rm -R ${bak_dir}
  echo "删除bak旧固件文件夹"
fi


if [ ! -d ${dest_dir} ]; then
  mkdir -p ${dest_dir}
  echo "文件不存在，新增文件夹 成功"
else
  mv docs ${bak_dir}
fi 

if [ -d ${src_dir} ]&&[ -e ${src_dir} ]; then
  cp -R ${src_dir}/. ${dest_dir}/
  echo "复制原文件夹的固件到新文件夹成功"
fi
 