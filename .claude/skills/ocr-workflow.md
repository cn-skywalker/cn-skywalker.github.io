---
name: ocr-workflow
description: 使用 GLM-OCR 对 PDF 指定页码进行 OCR，输出 Markdown + LaTeX 公式
---

# OCR Workflow

## 用法

```powershell
# 使用 PowerShell 执行（Windows 环境）
cd E:\work_space\ocr-book-reader
conda activate sci

# 从 _posts/paper/ 读取 PDF，指定页码范围
python ocr.py --pdf <文件名> <页码范围>

# 示例
python ocr.py --pdf Torquato.pdf 22-25        # 第 22-25 页
python ocr.py --pdf paper.pdf 1-10 50-55       # 多个范围
python ocr.py --pdf /path/to/book.pdf 100       # 绝对路径
```

## 输出

- 目录：与 PDF 同目录（`_posts/paper/`）
- 文件名：`{书名}_p{起始页}-{结束页}.md`
- 格式：Markdown，公式为 `$...$` / `$$...$$`

## 依赖

- conda 环境：`sci`
- 包：`zai-sdk`、`PyMuPDF`
- API Key：`ANTHROPIC_AUTH_TOKEN` 或 `ZHIPU_API_KEY` 环境变量
- 计费：走智谱 OCR 资源包，约 2000 tokens/页

## 典型流程

1. 用户将 PDF 放入 `_posts/paper/`
2. 告诉 Claude Code 书名和页码范围
3. Claude Code 调用 `ocr.py` 执行识别
4. 结果保存在 `_posts/paper/` 下
5. 用户后续手动整理成博客文章

## 注意事项

- 每次 API 请求最多 100 页，脚本会自动分批
- PDF 通过 base64 编码传给 `layout_parsing` API（不是 `file_parser`）
- `--pdf` 支持文件名（自动从 `_posts/paper/` 查找）、相对路径、绝对路径