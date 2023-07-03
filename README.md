#### vuepress-theme-vdoing

My site is live at https://techsay.github.io/

```scss

安装参考介绍：
https://blog.csdn.net/weixin_42875245/article/details/108559224

先参考官网安装环境，需要用到命令 yarn 或者 npm：

// 创建项目文件夹
mkdir vuepress-starter && cd vuepress-starter
// 进行初始化设置
yarn init  
或者使用
npm init

// 安装theme
npm install vuepress-theme-vdoing -D

```



在package.json中添加



```scss
 "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
```



创建docs文件夹

```scss
├── docs
│   ├── .vuepress (可选的)
│   │   ├── components (可选的)
│   │   ├── theme (可选的)
│   │   │   └── Layout.vue
│   │   ├── public (可选的)
│   │   ├── styles (可选的)
│   │   │   ├── index.styl
│   │   │   └── palette.styl
│   │   ├── templates (可选的, 谨慎配置)
│   │   │   ├── dev.html
│   │   │   └── ssr.html
│   │   ├── config.js (可选的)
│   │   └── enhanceApp.js (可选的)
│   │ 
│   ├── README.md
│   ├── guide
│   │   └── README.md
│   └── config.md
│ 
└── package.json
```



调试和编译：

```scss
// 启动测试服务：
npm run dev


// 编译文件命令（html 文件生成到docs/.vuepress/dist中）
npm run build


```



上传平台

```scss
平台： GitHub Pages、Coding Pages、 gitee Pages ，设置分支根目录在 docs路径

复制 docs/.vuepress/dist 中文件到 git 跟路径下 docs 文件中

推送文件到 git
```

语法

```
// 常用语法高亮
Objective-C - objectivec, objc

Markup - markup, html, xml, svg, mathml, ssml, atom, rss
CSS - css
C++ - cpp
C - c
Swift - swift

```


```
Markup - markup, html, xml, svg, mathml, ssml, atom, rss
CSS - css
C-like - clike
JavaScript - javascript, js
ABAP - abap
ABNF - abnf
ActionScript - actionscript
Ada - ada
Agda - agda
AL - al
ANTLR4 - antlr4, g4
Apache Configuration - apacheconf
Apex - apex
APL - apl
AppleScript - applescript
AQL - aql
Arduino - arduino
ARFF - arff
AsciiDoc - asciidoc, adoc
ASP.NET (C#) - aspnet
6502 Assembly - asm6502
AutoHotkey - autohotkey
AutoIt - autoit
Bash - bash, shell
BASIC - basic
Batch - batch
BBcode - bbcode, shortcode
Birb - birb
Bison - bison
BNF - bnf, rbnf
Brainfuck - brainfuck
BrightScript - brightscript
Bro - bro
BSL (1C:Enterprise) - bsl, oscript
C - c
C# - csharp, cs, dotnet
C++ - cpp
CFScript - cfscript, cfc
ChaiScript - chaiscript
CIL - cil
Clojure - clojure
CMake - cmake
COBOL - cobol
CoffeeScript - coffeescript, coffee
Concurnas - concurnas, conc
Content-Security-Policy - csp
Coq - coq
Crystal - crystal
CSS Extras - css-extras
CSV - csv
Cypher - cypher
D - d
Dart - dart
DataWeave - dataweave
DAX - dax
Dhall - dhall
Diff - diff
Django/Jinja2 - django, jinja2
DNS zone file - dns-zone-file, dns-zone
Docker - docker, dockerfile
DOT (Graphviz) - dot, gv
EBNF - ebnf
EditorConfig - editorconfig
Eiffel - eiffel
EJS - ejs, eta
Elixir - elixir
Elm - elm
Embedded Lua templating - etlua
ERB - erb
Erlang - erlang
Excel Formula - excel-formula, xlsx, xls
F# - fsharp
Factor - factor
False - false
Firestore security rules - firestore-security-rules
Flow - flow
Fortran - fortran
FreeMarker Template Language - ftl
GameMaker Language - gml, gamemakerlanguage
G-code - gcode
GDScript - gdscript
GEDCOM - gedcom
Gherkin - gherkin
Git - git
GLSL - glsl
Go - go
GraphQL - graphql
Groovy - groovy
Haml - haml
Handlebars - handlebars, hbs
Haskell - haskell, hs
Haxe - haxe
HCL - hcl
HLSL - hlsl
Hoon - hoon
HTTP - http
HTTP Public-Key-Pins - hpkp
HTTP Strict-Transport-Security - hsts
IchigoJam - ichigojam
Icon - icon
ICU Message Format - icu-message-format
Idris - idris, idr
.ignore - ignore, gitignore, hgignore, npmignore
Inform 7 - inform7
Ini - ini
Io - io
J - j
Java - java
JavaDoc - javadoc
JavaDoc-like - javadoclike
Java stack trace - javastacktrace
Jexl - jexl
Jolie - jolie
JQ - jq
JSDoc - jsdoc
JS Extras - js-extras
JSON - json, webmanifest
JSON5 - json5
JSONP - jsonp
JS stack trace - jsstacktrace
JS Templates - js-templates
Julia - julia
Keyman - keyman
Kotlin - kotlin, kt, kts
KuMir (КуМир) - kumir, kum
LaTeX - latex, tex, context
Latte - latte
Less - less
LilyPond - lilypond, ly
Liquid - liquid
Lisp - lisp, emacs, elisp, emacs-lisp
LiveScript - livescript
LLVM IR - llvm
Log file - log
LOLCODE - lolcode
Lua - lua
Makefile - makefile
Markdown - markdown, md
Markup templating - markup-templating
MATLAB - matlab
MEL - mel
Mizar - mizar
MongoDB - mongodb
Monkey - monkey
MoonScript - moonscript, moon
N1QL - n1ql
N4JS - n4js, n4jsd
Nand To Tetris HDL - nand2tetris-hdl
Naninovel Script - naniscript, nani
NASM - nasm
NEON - neon
Nevod - nevod
nginx - nginx
Nim - nim
Nix - nix
NSIS - nsis
Objective-C - objectivec, objc
OCaml - ocaml
OpenCL - opencl
OpenQasm - openqasm, qasm
Oz - oz
PARI/GP - parigp
Parser - parser
Pascal - pascal, objectpascal
Pascaligo - pascaligo
PATROL Scripting Language - psl
PC-Axis - pcaxis, px
PeopleCode - peoplecode, pcode
Perl - perl
PHP - php
PHPDoc - phpdoc
PHP Extras - php-extras
PL/SQL - plsql
PowerQuery - powerquery, pq, mscript
PowerShell - powershell
Processing - processing
Prolog - prolog
PromQL - promql
.properties - properties
Protocol Buffers - protobuf
Pug - pug
Puppet - puppet
Pure - pure
PureBasic - purebasic, pbfasm
PureScript - purescript, purs
Python - python, py
Q# - qsharp, qs
Q (kdb+ database) - q
QML - qml
Qore - qore
R - r
Racket - racket, rkt
React JSX - jsx
React TSX - tsx
Reason - reason
Regex - regex
Rego - rego
Ren'py - renpy, rpy
reST (reStructuredText) - rest
Rip - rip
Roboconf - roboconf
Robot Framework - robotframework, robot
Ruby - ruby, rb
Rust - rust
SAS - sas
Sass (Sass) - sass
Sass (Scss) - scss
Scala - scala
Scheme - scheme
Shell session - shell-session, sh-session, shellsession
Smali - smali
Smalltalk - smalltalk
Smarty - smarty
SML - sml, smlnj
Solidity (Ethereum) - solidity, sol
Solution file - solution-file, sln
Soy (Closure Template) - soy
SPARQL - sparql, rq
Splunk SPL - splunk-spl
SQF: Status Quo Function (Arma 3) - sqf
SQL - sql
Squirrel - squirrel
Stan - stan
Structured Text (IEC 61131-3) - iecst
Stylus - stylus
Swift - swift
T4 templating - t4-templating
T4 Text Templates (C#) - t4-cs, t4
T4 Text Templates (VB) - t4-vb
TAP - tap
Tcl - tcl
Template Toolkit 2 - tt2
Textile - textile
TOML - toml
Turtle - turtle, trig
Twig - twig
TypeScript - typescript, ts
TypoScript - typoscript, tsconfig
UnrealScript - unrealscript, uscript, uc
URI - uri, url
V - v
Vala - vala
VB.Net - vbnet
Velocity - velocity
Verilog - verilog
VHDL - vhdl
vim - vim
Visual Basic - visual-basic, vb, vba
WarpScript - warpscript
WebAssembly - wasm
Wiki markup - wiki
Wolfram language - wolfram, mathematica, nb, wl
Xeora - xeora, xeoracube
XML doc (.net) - xml-doc
Xojo (REALbasic) - xojo
XQuery - xquery
YAML - yaml, yml
YANG - yang
Zig - zig
```


