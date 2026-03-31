# Community UI Plugin Spec / 社区 UI 插件规范

本文档描述 `SD-reScripts` 当前已经实现并对外开放的插件标准。

注意：这里的“插件”当前特指“社区 UI / UI profile 包”。
它用于切换前端界面，不等于通用后端插件系统。

## 1. 当前范围

目前我们支持的操作：

- 识别、安装、一键切换以及卸载社区提供的 UI。
- 直接从 GitHub 仓库把 UI 包拉取到 `plugin/` 目录
- 把下载好的 UI 设为 Mikazuki / SD-reScripts 的前端入口。

暂时还没支持（也请大家先不要往这方面折腾）：

- 自动加载第三方 Python 后端逻辑
- 自动注册新的训练路由、API 或脚本执行器。
- 自动注入新的参数页面、后端节点或 Schema。
- 运行任意的 JS 插件脚本。

简而言之：如果你是写了一个“新主题”或“独立前端”，这份规范就是为你准备的；如果你想搞的是“后端功能增强”，目前我们还没放开统一标准，还得再等等。

## 2. 插件根目录

社区 UI 插件统一放在仓库根目录下的 `plugin/` 目录中：

```text
X:\lora-rescripts\
├─ frontend\
├─ mikazuki\
├─ plugin\
│  ├─ some-ui-plugin\
│  └─ another-ui-plugin\
└─ ...
```

内置 UI 不在 `plugin/` 里，来自：

```text
frontend/dist/
```

## 3. 插件需求

一个标准的社区 UI 插件，至少需要：

1. 一个独立目录，位于 `plugin/<plugin-name>/`
2. 一个可直接访问的前端入口页面 `index.html`
3. 一份已经构建好的静态前端产物

当前插件系统只负责“识别静态 UI 入口并切换”，不会自动在本地执行构建命令。

## 4. 入口识别规则

系统会按以下顺序寻找插件入口：

1. 如果存在 `manifest.json` 且包含 `entry`
   - 若 `entry` 指向一个目录，且该目录下存在 `index.html`，则使用该目录
   - 若 `entry` 直接指向一个 `index.html` 文件，则使用该文件所在目录
2. 如果没有可用的 `manifest.entry`，则按以下候选目录自动探测
   - `ui/dist/`
   - `dist/`
   - `frontend/dist/`

默认入口文件名是：

```text
index.html
```

如果翻遍了这些地方都没找到，系统会判定这个插件“安装失败”或“不可用”。

## 5. 推荐目录结构

推荐插件仓库结构如下：

```text
my-community-ui/
├─ manifest.json
├─ README.md
└─ ui/
   ├─ dist/
   │  ├─ index.html
   │  └─ assets/
   ├─ src/
   ├─ package.json
   └─ vite.config.js
```

也支持更简单的结构：

```text
my-community-ui/
├─ manifest.json
└─ dist/
   ├─ index.html
   └─ assets/
```

## 6. manifest.json 规范

虽然不是强制要求`manifest.json` ，但为了让你的插件在 UI 列表里显得更专业，建议给一份。模板可以参考：

```text
templates/community-ui-manifest.template.json
```

当前已支持并实际使用的字段如下：

| 字段 | 类型 | 是否必需 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 否 | 插件唯一 ID。未提供时默认生成为 `community:<目录名>` |
| `name` | string | 否 | 显示名称。未提供时会回退到 `README` 一级标题、`package.json.name` 或目录名 |
| `version` | string | 否 | 版本号。未提供时会尝试读取 `package.json.version` |
| `entry` | string | 否 | 插件入口目录或入口文件路径，路径相对于插件根目录 |
| `entry_file` | string | 否 | 入口文件名，默认是 `index.html` |
| `source` | string | 否 | 插件来源地址，通常填 GitHub 仓库地址 |
| `source_url` | string | 否 | `source` 的兼容别名 |
| `installed_via` | string | 否 | 安装来源标记。当前安装器可能自动写入 `github-download` |

推荐最小示例：

```json
{
  "id": "community:lora-scripts-ui-main",
  "name": "LoRA ReScripts UI",
  "version": "2.0.0",
  "entry": "ui/dist",
  "entry_file": "index.html",
  "source": "https://github.com/example/example-ui"
}
```

## 7. 缺省回退行为

如果插件没有提供完整元数据，系统会按以下回退规则补足：

注意： 如果解压完发现里头根本没有前端入口（即第 4 条提到的那些目录），安装流程会直接报错。

- `name`
  - `manifest.name`
  - `README.md` 第一行 `# 标题`
  - `ui/package.json` 或 `package.json` 中的 `name`
  - 目录名
- `version`
  - `manifest.version`
  - `ui/package.json` 或 `package.json` 中的 `version`
- `id`
  - `manifest.id`
  - `community:<目录名>`

## 8. GitHub 安装规则

设置页当前支持直接输入 GitHub 仓库地址安装社区 UI。

当前支持的格式：

- `https://github.com/<owner>/<repo>`
- `https://www.github.com/<owner>/<repo>`
- 带 `.git` 后缀也可以


安装逻辑如下：

1. 解析仓库地址
2. 读取 GitHub 仓库默认分支
3. 下载默认分支 ZIP
4. 解压到 `plugin/<repo-name>/`
5. 如果仓库内没有 `manifest.json`，系统会自动生成一份最小 manifest
6. 再次检查是否存在可用前端入口

如果已经下载完成，但找不到可用入口，安装会失败。

## 9. 卸载规则

只有“社区 UI”且“允许删除”的插件，才可以在设置页里直接卸载。

以下情况通常不可在设置页中卸载：

- 内置 UI
- 插件目录包含 `.git`
- 由 git submodule 或手动 git clone 管理的插件目录

这是为了避免误删你仓库里受 Git 管理的内容。

## 10. 激活与回退规则

当前激活 UI 的来源优先级如下：

1. 环境变量 `MIKAZUKI_UI_PROFILE`
2. 配置文件中的 `active_ui_profile`
3. 内置 UI

如果指定的插件不存在，或入口文件缺失，系统会自动回退到内置 UI。

前端静态文件会从当前激活插件的入口目录中按路径解析。
如果请求路径不存在，会自动回退到插件入口文件，方便单页应用路由工作。

## 11. 当前可用 API

当前与社区 UI 插件相关的后端接口如下：

| 方法 | 路由 | 说明 |
| --- | --- | --- |
| `GET` | `/api/ui_profiles` | 获取所有可用 UI profile |
| `POST` | `/api/ui_profiles/activate` | 切换当前活动 UI |
| `POST` | `/api/ui_profiles/install` | 从 GitHub 下载并安装社区 UI |
| `POST` | `/api/ui_profiles/uninstall` | 卸载社区 UI |

这组接口面向“UI profile 管理”，不是通用插件执行接口。

## 12. 社区插件建议

为了提高兼容性，建议遵循以下约定：

- 将构建产物固定输出到 `ui/dist/`
- 提供 `manifest.json`
- 提供 `README.md`
- 使用相对静态资源路径
- 保证 `index.html` 可独立加载
- 不依赖额外本地守护进程或独占端口
- 不假设后端会自动加载插件内的 Python 代码

## 13. 未来可能会变化的部分

以下内容当前不建议插件作者依赖：

- 未来所有 manifest 字段都永久不变
- 后端可能会开放通用 Python 插件入口
- 社区 UI 可以自动注册新的训练页面后端能力
- 插件目录中的任意脚本会被自动执行

目前这套规范还在演进。后端 Python 插件、动态路由注册 等高级功能目前都还没定死，所以现阶段请大家专注于“前端 UI”的开发。如果未来有大改动，我会再同步给大家。