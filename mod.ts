#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
// Copyright 2020 justjavac(迷渡). All rights reserved. MIT license.
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";

import type { Word } from "./types.ts";
import { createArchive, createReadme, mergeWords } from "./utils.ts";

const regexp =
  /<a href="(\/weibo\?q=[^"]+)".*?>(.+)<\/a>[\s\S]+?<td class="td-03">(?:<[^>]+>)?(.)?(?:<\/i>)?<\/td>/g;

const response = await fetch("https://s.weibo.com/top/summary", {
  headers: {
    "Cookie":
      "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
  },
});

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const result: string = await response.text();

const matches = result.matchAll(regexp);

const words: Word[] = Array.from(matches).map((x) => {
  return {
    url: x[1],
    title: x[2],
    mark: x[3] ? x[3] : "",
  };
});

const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
const fullPath = join("raw", `${yyyyMMdd}.json`);

let wordsAlreadyDownload: Word[] = [];
if (await exists(fullPath)) {
  const content = await Deno.readTextFile(fullPath);
  wordsAlreadyDownload = JSON.parse(content);
}

// 保存原始数据
const queswordsAll = mergeWords(words, wordsAlreadyDownload);
await Deno.writeTextFile(fullPath, JSON.stringify(queswordsAll));

// 更新 README.md
const readme = await createReadme(queswordsAll);
await Deno.writeTextFile("./README.md", readme);

// 更新 archives
const archiveText = createArchive(queswordsAll, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);
