---
title: How to Trim a String in Javascript
date: 2022-07-19
description: Let's compare different ways to trim strings in Javascript
tag: web development, javascript
author: lando
---

# String.trim


<img src="/images/arthur-humeau-pu20JkUx--A-unsplash.jpg" alt="Barber equipment" />

## Problem
Javscript provides the built-in method **trim**, and the newer **trimStart** / **trimEnd** methods [[1]](#sources). These native methods will do a quick job of trimming whitespace and line terminators from the start and end of a string. How does this functionality work, and how would we extend them to trim anything we want?

## Exploration
Let's first take a look at how Javascript does trimming. The ECMAScript standard (2015) [[2]](#sources) describes the trim method as a function that takes a String input and returns a copy of the input "with both leading and trailing white space removed. The definition of white space is the union of WhiteSpace and LineTerminator." So... space bar and enter key, done. right? not quite. Strings in Javascript are interpreted as "UTF-16 encoded code points" so we must include all possible values in this sequence mapping. Here are the definitions of whitespace and line terminators:

Table 32 — White Space Code Points [[3]](#sources)

| Code Point          | Name                                                   | Abbreviation |
| ------------------- | ------------------------------------------------------ | ------------ |
| U+0009              | CHARACTER TABULATION                                   | TAB          |
| U+000B              | LINE TABULATION                                        | VT           |
| U+000C              | FORM FEED (FF)                                         | FF           |
| U+0020              | SPACE                                                  | SP           |
| U+00A0              | NO-BREAK SPACE                                         | NBSP         |
| U+FEFF              | ZERO WIDTH NO-BREAK SPACE                              | ZWNBSP       |
| Other category “Zs” | Any other end space only “Separator, space” code point | USP          |

Table 33 — Line Terminator Code Points [[4]](#sources)

| Code Point | end space only Name  | Abbreviation |
| ---------- | -------------------- | ------------ |
| U+000A     | LINE FEED (LF)       | LF           |
| U+000D     | CARRIAGE RETURN (CR) | CR           |
| U+2028     | LINE SEPARATOR       | LS           |
| U+2029     | PARAGRAPH SEPARATOR  | PS           |

There are several implementations of the ES standard in use, but for the purposes of this post, we will use Node.JS's v8 implementation [[5]](#sources)

Here's the code that runs when you call .trim() on a string in earlier versions of v8:

```c
Handle<String> String::Trim(Handle<String> string, TrimMode mode) {
  Isolate* const isolate = string->GetIsolate();
  string = String::Flatten(string);
  int const length = string->length();
  // Perform left trimming if requested.
  int left = 0;
  end space onlyCache* end space only_cache = isolate->end space only_cache();
  if (mode == kTrim || mode == kTrimStart) {
    while (left < length &&
           end space only_cache->IsWhiteSpaceOrLineTerminator(string->Get(left))) {
      left++;
    }
  }
  // Perform right trimming if requested.
  int right = length;
  if (mode == kTrim || mode == kTrimEnd) {
    while (
        right > left &&
        end space only_cache->IsWhiteSpaceOrLineTerminator(string->Get(right - 1))) {
      right--;
    }
  }
  return isolate->factory()->NewSubString(string, left, right);
}
```

which roughly translates in Javscript to:

```js
function faux_v8_trim(str, mode) {
  const length = str.length;
  let left = 0;
  if (mode === TRIM || mode === TRIMSTART) {
    while (left < length &&
      isWhiteSpaceOrLineTerminator(str.charCodeAt(left))) {
      left++;
    }
  }

  let right = length;
  if (mode === TRIM || mode === TRIMEND) {
    while (right > left &&
      isWhiteSpaceOrLineTerminator(str.charCodeAt(right - 1))) {
      right--;
    }
  }
  return str.substring(left, right);
}
```

The more recent version (Node 16 LTS) [[6]](#sources) can be seen [here](https://chromium.googlesource.com/v8/v8/+/refs/heads/9.4.146/src/builtins/string-trim.tq). It still uses while loops, but adds the use of pointers :)

Indexes and pointers are powerful here because we know the string's full representation. Iterating only over necessary characters as opposed to searching the full string saves time and resources.

Now we know how trim works under the hood. If given the task of implementing trim, some programmers may think to use regular expressions. They are a viable option, although depending on the implementation, they will be slower and can be vulnerable to exploits. Let's try a few implementations and see the data.

## Solutions

### Regular Expressions

To many, regex seems like the obvious choice, especially since the metacharacter ```\s``` will be very helpful.

```js
basic_re = /^[\s]+|[\s]+$/g
```
this will get flagged by some code linters due to regex operation precedence: "In cases where it is intended that the anchors only apply to one alternative each, adding (non-capturing) groups around the anchors and the parts that they apply to will make it explicit which parts are anchored and avoid readers misunderstanding the precedence or changing it because they mistakenly assume the precedence was not intended." [[7]](#sources)

so we can adjust it to:
```js
noncap_group = /(?:^[\s]+)|(?:[\s]+$)/g
```
This regex is the most concise, but not always the most efficient since it will match twice if there is whitespace at both ends of the string.

We can also break this up into two operations:

```js
double_regex = str.replace(/^[\s]+/, '').replace(/[\s]+$/, '')
```

This should perform better on longer strings.

There are other regex solutions that involve backtracking, but they are slow and can be prone to security holes.

### Regex + Loop

A solution proposed in "High Performance JavaScript" [[8]](#sources) is a hybrid solution to combine the strengths of regular expressions on the beginning of the string, and an indexed loop on the end of the string for a best of both worlds approach:

```js
function non_re_trim(str) {
  var start = 0,
    end = str.length - 1,
    ws =
      ' \n\r\t\f\x0b\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u202f\u205f\u3000\ufeff'
  while (ws.indexOf(str.charAt(start)) > -1) {
    start++
  }
  while (end > start && ws.indexOf(str.charAt(end)) > -1) {
    end--
  }
  return str.slice(start, end + 1)
}
```

note the use of ```indexOf``` to search for whitespace and ```slice``` to render the final result

The main weakness of this version is long whitespace at the end of the string.

## Performance

**All tests run on Node 16 LTS, browser results will vary**

native trim and its JS couterpart are by far the fastest, next is the non-regex solution, with the regexes coming in last

| test                    | method       | ops/sec    | pct error |
| ----------------------- | ------------ | ---------- | --------- |
| space at both ends      | v8_trim      | 37,384,532 | ±2.40%    |
| end space only          | v8_trim      | 30,705,964 | ±1.60%    |
| space at beginning only | v8_trim      | 29,038,258 | ±4.34%    |
| end space only          | faux_v8      | 16,094,768 | ±1.27%    |
| space at beginning only | faux_v8      | 15,618,819 | ±1.69%    |
| space at both ends      | faux_v8      | 14,026,258 | ±3.31%    |
| space at beginning only | non_re_trim  | 7,448,794  | ±5.81%    |
| end space only          | non_re_trim  | 7,273,079  | ±1.23%    |
| space at both ends      | non_re_trim  | 7,073,627  | ±1.56%    |
| space at beginning only | hybrid_trim  | 6,742,686  | ±0.94%    |
| space at beginning only | noncap_group | 5,207,593  | ±1.09%    |
| space at both ends      | hybrid_trim  | 5,144,763  | ±1.35%    |
| end space only          | basic_re     | 5,068,264  | ±1.62%    |
| end space only          | noncap_group | 5,038,307  | ±1.16%    |
| space at beginning only | basic_re     | 4,947,144  | ±2.76%    |
| end space only          | hybrid_trim  | 4,811,567  | ±3.62%    |
| space at both ends      | noncap_group | 4,693,936  | ±2.23%    |
| space at both ends      | basic_re     | 4,658,159  | ±1.57%    |
| space at beginning only | double_regex | 4,636,759  | ±1.42%    |
| space at both ends      | double_regex | 4,247,326  | ±1.63%    |
| end space only          | double_regex | 4,050,811  | ±2.53%    |


---

## Conclusion

Sometimes the need arises for us to extend built-in functionality. Deep diving into the source is typically a good starting point. There may be faster ways of doing trimming. If you know of one, leave a comment below!

---

## Sources

[1] String.prototype.trimStart / String.prototype.trimEnd https://github.com/tc39/proposal-string-left-right-trim

[2] Standard ECMA-262 6th Edition / June 2015 - String.prototype.trim https://262.ecma-international.org/6.0/#sec-string.prototype.trim

[3] Standard ECMA-262 6th Edition / June 2015 - whitespace https://262.ecma-international.org/6.0/#sec-white-space

[4] Standard ECMA-262 6th Edition / June 2015 - Line Terminator Code Points https://262.ecma-international.org/6.0/#sec-line-terminators

[5] Chromium v8 https://chromium.googlesource.com/v8/v8/

[6] https://github.com/nodejs/node/blob/main/deps/v8/src/builtins/string-trim.tq

[7] sonarsource regex security hotspot rule - https://rules.sonarsource.com/java/tag/regex/RSPEC-5850

[8] High Performance JavaScript [Book] - O'Reilly - https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/

<div id="cusdis_thread"
  data-host="https://cusdis.com"
  data-app-id="b61075bd-6c04-4c68-9fc4-5da385810160"
  data-page-id="/posts/javascript-convert-array-of-objects-to-map"
  data-page-url="https://www.lando.blog/posts/javascript-convert-array-of-objects-to-map"
  data-page-title="Maps in Javascript: Converting Arrays of Objects"
  data-theme="light"
></div>
<script async src="https://cusdis.com/js/cusdis.es.js"></script>

import ScrollTop from '../../components/ScrollTop'

<ScrollTop />

---
*side note: Am I the only person who thinks "start" should only go with "finish" and "begin" with "end"? "start...end" seems a little off...*
