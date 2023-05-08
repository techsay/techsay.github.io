#!/bin/bash

bak_dir="docs.bak"
dest_dir="docs"
src_dir="projects/docs/.vuepress/dist"
src_gitee_dir="../techsay.gitee.io/techsay"
 # /Users/v-niexiaobo/Downloads/sites/

if [ -d ${bak_dir} ]; then
  rm -R ${bak_dir}
  echo "删除bak旧文件夹"
fi


if [ ! -d ${dest_dir} ]; then
  mkdir -p ${dest_dir}
  echo "新增文件夹"
else
  mv docs ${bak_dir}
  echo "覆盖备份文件"
fi 

if [ -d ${src_dir} ]&&[ -e ${src_dir} ]; then
  cp -R ${src_dir}/. ${dest_dir}/
  echo "复制文件成功"
fi
 

if [ -d ${src_dir} ]&&[ -e ${src_dir} ]; then
  cp -R ${src_dir}/. ${src_gitee_dir}/
  echo "复制文件成功"
fi