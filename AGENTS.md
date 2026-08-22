# AGENTS.md — cn-skywalker.github.io 强制规则

## 发帖格式
- 文件名 `_posts/YYYY-MM-DD-中文标题.md`；front matter 不写 layout，必须带 `permalink: /posts/<年>/<日>/<英文slug>/`，`tags:`/`categories:` 用 YAML 列表。
- 论文/成果页放 `_publications/`（`collection: publications`，正文为英文摘要）。

## 数学公式（kramdown + MathJax v3，违反必坏）
- 行内公式一律 `$$...$$`，禁止 `$...$`（kramdown 会吃掉 `\{` `\}` `\|` 的反斜杠，并把 `}` 后的 `_` 配对成 `<em>`）。
- 行内公式内禁止裸竖线 `|`（会触发表格解析），用 `\lvert/\rvert/\lVert/\rVert`；行间块公式内 `|` 不受限。
- 数学环境内禁止中文；翻译/整理时公式 LaTeX 逐字符保留，`\tag{n}` 原样，禁止重推编号。
- 推送后抽查线上正文：`<em>`、`<table>` 应为 0（无 JS 抓取看到原始 LaTeX 属正常，不是故障）。

## 提交与推送
- 提交信息：`博客:新增…`、`博客:更新…`、`学术报告:新增…`、`论文成果:新增…`、`配置:…`（中文冒号，无空格）。
- 推送前先 `git pull --rebase`（多机推送被拒属常态）。

## Python 与 OCR
- 本仓库 Python 脚本用 conda sci 环境：`D:/miniconda3/envs/sci/python.exe`。
- 含反斜杠字面量的 Python 代码必须先用 Write 写成 .py 文件再执行，禁止 bash heredoc 内联（会吃一层反斜杠，`\r` 变回车符）。
- 论文/图片 OCR 一律用 glm-ocr skill（`~/.zcode/skills/glm-ocr`，纯标准库，key 读环境变量 `ZHIPU_API_KEY`）。
