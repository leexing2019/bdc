#!/bin/bash

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "错误：当前目录不是 Git 仓库"
    exit 1
fi

# 检查是否有远程仓库 origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "错误：没有配置远程仓库 'origin'"
    exit 1
fi

# 获取当前分支名
branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$branch" ]; then
    echo "错误：无法获取当前分支名"
    exit 1
fi

echo "当前分支：$branch"
echo "尝试直接推送..."

# 尝试普通推送
if git push origin "$branch"; then
    echo "推送成功！"
    exit 0
else
    echo "普通推送失败，可能远程有更新，尝试拉取并变基..."
fi

# 拉取远程变更并变基（避免产生合并提交）
if ! git pull --rebase origin "$branch"; then
    echo "拉取并变基失败，请手动解决冲突后重新运行脚本。"
    exit 1
fi

# 再次推送
echo "变基完成，再次尝试推送..."
if git push origin "$branch"; then
    echo "推送成功！"
else
    echo "推送仍然失败，请检查："
    echo "  1. 远程分支名称是否正确（例如远程可能是 main 而不是 master）"
    echo "  2. 是否有写入权限"
    echo "  3. 网络连接"
    exit 1
fi