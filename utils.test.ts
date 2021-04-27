#!/usr/bin/env -S deno test --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";
import type { Word } from "./types.ts";

import {
  createArchive,
  createList,
  createReadme,
  getPreviousMark,
  mergeWords,
} from "./utils.ts";

Deno.test("mergeWords", function (): void {
  const words1: Word[] = [];
  const words2: Word[] = [{ title: "foo", url: "bar", mark: "" }];
  const words3: Word[] = [{ title: "foo", url: "hello", mark: "" }];
  const words4: Word[] = [{ title: "hello", url: "world", mark: "" }];
  const words5: Word[] = [
    { title: "foo", url: "bar", mark: "a" },
    { title: "hello", url: "world", mark: "b" },
  ];
  const words6: Word[] = [{ title: "hello", url: "world", mark: "c" }];

  assertEquals(mergeWords(words1, words2), words2);
  assertEquals(mergeWords(words1, words5), words5);
  assertEquals(mergeWords(words2, words2), words2);
  assertEquals(
    mergeWords(words2, words3),
    [
      { title: "foo", url: "hello", mark: "" },
      { title: "foo", url: "bar", mark: "" },
    ],
  );
  assertEquals(mergeWords(words4, words5), [
    { title: "foo", url: "bar", mark: "a" },
    { title: "hello", url: "world", mark: "b -> " },
  ]);
  assertEquals(
    mergeWords(words3, words5),
    [
      { title: "foo", url: "bar", mark: "a" },
      { title: "hello", url: "world", mark: "b" },
      { title: "foo", url: "hello", mark: "" },
    ],
  );
  assertEquals(mergeWords(words6, mergeWords(words4, words5)), [
    { title: "foo", url: "bar", mark: "a" },
    { title: "hello", url: "world", mark: "b ->  -> c" },
  ]);
});

Deno.test("createList", function (): void {
  const words: Word[] = [
    { title: "foo", url: "bar", mark: "" },
    { title: "hello", url: "world", mark: "" },
  ];

  assertStringIncludes(createList(words), "<!-- BEGIN -->");
  assertStringIncludes(createList(words), "<!-- END -->");
  assertStringIncludes(createList(words), "foo");
  assertStringIncludes(createList(words), "world");
  assertStringIncludes(createList(words), "hello");
});

Deno.test("createArchive", function (): void {
  const words: Word[] = [
    { title: "foo", url: "bar", mark: "" },
    { title: "hello", url: "world", mark: "" },
  ];

  assertStringIncludes(createArchive(words, "2020-02-02"), "# 2020-02-02");
  assertStringIncludes(createArchive(words, "2020-02-02"), "共 2 条");
});

Deno.test("createReadme", async function (): Promise<void> {
  const words: Word[] = [
    { title: "foo", url: "bar", mark: "" },
    { title: "hello", url: "world", mark: "" },
  ];

  assertStringIncludes(await createReadme(words), "微博");
  assertStringIncludes(
    await createReadme(words),
    "weibo-trending-hot-search",
  );
});

Deno.test("getPreviousMark", function (): void {
  assertEquals(getPreviousMark(""), "");
  assertEquals(getPreviousMark("a"), "a");
  assertEquals(getPreviousMark("a -> "), "");
  assertEquals(getPreviousMark("a -> b"), "b");
});
