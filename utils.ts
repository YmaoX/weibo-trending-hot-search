import type { Word } from "./types.ts";

const link = " -> ";
/** 合并两次热门话题并根据 id 去重 */
export function mergeWords(
  words: Word[],
  previous: Word[],
): Word[] {
  const obj: Record<string, [string, string]> = {};
  for (const w of previous.concat(words)) {
    let markF;
    if (w.url in obj) {
      markF = obj[w.url][1];
      let previousMark = getPreviousMark(obj[w.url][1]);
      if (previousMark !== w.mark) {
        markF += link + w.mark;
      }
    } else {
      markF = w.mark;
    }
    obj[w.url] = [w.title, markF];
  }
  return Object.entries(obj).map(([url, content]) => ({
    url: url,
    title: content[0],
    mark: content[1],
  }));
}

export async function createReadme(words: Word[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(/<!-- BEGIN -->[\W\w]*<!-- END -->/, createList(words));
}

export function createList(words: Word[]): string {
  return `<!-- BEGIN -->
<!-- 最后更新时间 ${Date()} -->
${
    words.map((x) => `1. [${x.title}](https://s.weibo.com/${x.url}) ${x.mark}`)
      .join("\n")
  }
<!-- END -->`;
}

export function createArchive(words: Word[], date: string): string {
  return `# ${date}\n
共 ${words.length} 条\n
${createList(words)}
`;
}

export function getPreviousMark(totalMark: string): string {
  var i = totalMark.lastIndexOf(link);
  return i == -1
    ? totalMark
    : totalMark.substr(i + link.length, totalMark.length);
}
