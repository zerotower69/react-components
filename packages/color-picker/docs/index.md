# 导读

本文基于以下包和版本配置：

|              包名               | 版本号  |
| :-----------------------------: | :-----: |
|              next               | 14.2.15 |
|              react              | 18.2.0  |
|            react-dom            | 18.2.0  |
|           tailwindcss           |  3.4.1  |
|         @changesets/cli         | 2.27.9  |
|         @commitlint/cli         | 19.5.0  |
| @commitlint/config-conventional | 19.5.0  |
|              husky              |  9.1.6  |
|           typescript            |  5.4.4  |


本文介绍的开发环境是**Macbook Pro M1 MacOS 14.6.1**。

# 项目启动与打包验证

## 创建项目

创建项目，使用next 14.2.15

```bash
npx reate-next-app@14.2.15
```

使用app router的模式

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730273505427-734af418-c802-4849-afe2-4b5f3add147f.png)

## 本地运行

确保你使用了`pnpm`作为包管理工具，如果没有安装，请使用 `npm i -g pnpm`安装。

本地运行项目，使用 `pnpm dev`命令

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730274786095-ef51e230-8484-4305-9fe4-8d52d1b43084.png)



**到这里，一切都是正常的，说明我们的应用没有问题，一切都是纯粹的模样，接下来我们直接打包，保证我们的项目不会半途因为出现不知名的问题无法排查。（笔者在此之前已经用pages router模式搭建几乎完成了，但是打包部署始终无法成功，更要命的是开发模式也无法正常启动了。因此强烈建议每引入新的东西不仅开发模式引入就行了，打包部署尽可能都尝试一遍看看，如何出现发生了错误就能快速定位了。）**

## 本地打包

当前的next.config.js 文件的配置是

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

可以看到是空的，我们什么都不给尝试打包 `npm run build`

可以看到，打包是成功了的。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730275972965-8593fdf2-137f-4bc7-a7be-1e2769b20139.png)

由于我们的项目是一个monorepo的组件库和文档，我们需要pnpm 的workspace(工作空间)提供的能力，

可以在项目根目录中加入一个文件`pnpm-workspace.yaml`,内容如下：

```javascript
packages:
  - "packages/*"
```

这表示我们的子应用（有自己的package.json），也就是之后的每一个组件存放在根目录的`packages`子目录之下，如图所示：

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730276267419-fca06718-9346-4f0d-b403-fa7b8a891379.png)

需要注意的是，我们的根目录也是存在`tsconfig.json`文件，nextjs应用打包时，也会去检查packages下的typescript配置，这功能应该交给各个组件库包决定，因此我们需要排除`packages`目录：，在`tsconfig.json` 文件中的`exclude`中配置：

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730282791159-dd80c230-2559-4732-b225-63e06e9290de.png)

该项目最终目的是部署到githua pages，我们需要1）集成changesets 实现monorepo的包管理、2）commitlint实现git commit提交的规范验证和代码格式化检查，我们每上线一个功能都希望能够3）结合github pages的 工作流实现项目的一键部署。下面一节将介绍这些。

# 集成部署

## changesets

我们通过命令`pnpm add -Dw @changesets/cli` 安装`changesets`。

再通过 `pnpm changeset init` 初始化我们的 changeset

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730276467602-a9e5a62e-69ed-437c-9753-704d8e743f8c.png)

项目的根目录下多出一个`.changeset`目录。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730276527668-5f8c29de-c589-4877-b8ca-51deee7f02b4.png)

接着我们需要在项目根目录下的`packages.json`文件中的 `scripts`命令中增加几条

```json
{
  "compile": "pnpm --filter=@zerotower/* run build",
   "pub": "pnpm compile && pnpm --recursive --registry=https://registry.npmjs.org/ publish --access public",
}
```

第一条命令用来对`packages`下的组件执行编译打包命令，pub用来将我们的仓库发布到npm。

为了测试，我们先新增两个组件目录用来测试。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730276847691-f6495333-87e3-4ce3-be88-318746bb3fa9.png)

两个组件都是支持`typescript`的，我们需要同时安装 `5.4.4`版本。（更高的版本在笔者的使用中经常会导致奇怪的问题），在**项目的根目录**下执行以下命令

`pnpm add typescript@5.4.4 -r -D`

未来该版本可能不可用，如果`5.4.4`没用的话，可以通过执行 `pnpm view typescript versions`查看一个可用的版本。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730277268553-e549cfe6-222c-4fee-89f6-25b3113d42af.png)

分别查看`packages/image-gallery/packages.json` 和`packages/color-picker/packages.json`，发现都安装了指定的`typescript`。

改造一下![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730277596148-82493375-2301-4e7f-851a-737026b96d5a.png)

所有的组件库包都将拥有一个统一的前缀`@zerotower`，而我们也仅仅需要编译这些库包，**根目录的next.js不参与编译**。

接着，将这两个添加到根目录的`package.json`文件中，之后执行`pnpm install -w`重新安装依赖。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730277989423-060f38e5-67d7-4b6c-82dc-1082f6c6dbb1.png)

打开项目根目录的`node_modules`，`@zerotower`有两个字目录，它们都有红框框选的一个小图标，这表示两个目录都是软链接创建的，是将`packages/**`软链接到了`/node_modules/@zerotower/**`，底层其实就是 `ln packages/**  node_modules/@zerotower/**`，使用的`ln`命令。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730278118416-99218d4b-14da-4630-8c03-540313d69aa2.png)

## 添加commilint

一键安装三个库包，在项目的根目录下执行：

`pnpm add —D @commitlint/{config-conventional,cli} husky -w`

~~执行以下的~~`~~husky~~`~~命令，完成husky的初始化。()~~

```bash
npx husky-init
# 下面这一句通常执行成功，但是没什么吊用
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730278916368-56588e61-dcc4-49aa-9e1b-01401ab4a594.png)

我们需要手动在**项目根目录下的.husky目录下**新增一个`commit-msg`文件

文件内容为：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit
"$1"

```

为了避免执行错误，我们还需要赋予执行的权限

`chmod +x .husky/commit-msg`

之后，我们需要在项目的根目录添加一个`commitlint.config.cjs`的文件

```javascript
// @see: https://cz-git.qbenben.com/zh/guide
/** @type {import('cz-git').UserConfig} */
module.exports = {
  ignores: [commit => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
        'workflow',
        'types',
        'release'
      ]
    ]
  },
  prompt: {
    messages: {
      // 中文版
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixsSelect: '选择关联issue前缀（可选）:',
      customFooterPrefixs: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?'
    },
    types: [
      // 中文版
      { value: 'feat', name: '特性:  🚀  新增功能', emoji: '🚀' },
      { value: 'fix', name: '修复:  🧩  修复缺陷', emoji: '🧩' },
      { value: 'docs', name: '文档:  📚  文档变更', emoji: '📚' },
      { value: 'style', name: '格式:  🎨  代码格式（不影响功能，例如空格、分号等格式修正）', emoji: '🎨' },
      { value: 'refactor', name: '重构:  ♻️  代码重构（不包括 bug 修复、功能新增）', emoji: '♻️' },
      { value: 'perf', name: '性能:   ⚡️  性能优化', emoji: '⚡️' },
      { value: 'test', name: '测试:  ✅  添加疏漏测试或已有测试改动', emoji: '✅' },
      {
        value: 'build',
        name: '构建:  📦️  构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）',
        emoji: '📦️'
      },
      { value: 'ci', name: '集成:  🎡  修改 CI 配置、脚本', emoji: '🎡' },
      { value: 'chore', name: '回退:  ⏪️  回滚 commit', emoji: '⏪️' },
      {
        value: 'revert',
        name: '其他:  🔨  对构建过程或辅助工具和库的更改（不影响源文件、测试用例）',
        emoji: '🔨'
      },
      { value: 'wip', name: '开发:  🕔  正在开发中', emoji: '🕔' },
      { value: 'workflow', name: '工作流:  📋  工作流程改进', emoji: '📋' },
      { value: 'types', name: '类型:  🔰  类型定义文件修改', emoji: '🔰' }
    ],
    useEmoji: true,
    customScopesAlign: 'bottom',
    emptyScopesAlias: 'empty',
    customScopesAlias: 'custom',
    allowBreakingChanges: ['feat', 'fix']
  }
};

```

我们尝试一个错误的提交:

`git commit -m "apx: test commit"`

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730280110176-3838f6f7-eb29-48d2-85c6-801b2c6e7d18.png)

果真失败了，让我们尝试正确的提交

`git commit -m "ci: 项目初始化，完成基本构建配置"`

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730281220564-d828d476-f52d-483f-bfdb-a742ada466eb.png)

**<u>如果依然碰到</u>**`**<u>.husky/commit-msg</u>**`**<u>执行权限的问题，你可能需要重新删除并创建它。</u>**

## 添加github工作流

项目最终需要部署到github pages，我们需要搭建工作流环境。

首先，在github 创建一个仓，该仓库不可以是私有的。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730282136863-f0f0453b-00dd-4c8e-93d5-0e7b4d1b53de.png)

在本地项目的根目录下添加仓库

`git remote add github <仓库url>`

接着，我们需要进一步修改`next.config.js`打包配置文件，修改后如下：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    output:"export",
    images:{
        //github pages 无法对图像优化
        unoptimized:true
    },
    //都是对应仓库名<reposity-name>
    basePath:"/react-components",
    assetPrefix:"/react-components"
};

export default nextConfig;
```

再接着，我们再在项目根目录下创建一个github工作流文件，`.github/workflows/deploy.yml`

```yaml
# 1. 为工作流定义名字
name: Building React Components for github pages

# 2. 触发条件修改为: 当 指定的分支, 有 push 的时候, 执行任务
on:
  push:
    branches:
      - gh-pages
  # 这个选项可以使你手动在 Action tab 页面触发工作流
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages。
permissions:
  contents: read
  pages: write
  id-token: write

# 允许一个并发的部署
concurrency:
  group: 'pages'
  cancel-in-progress: true

# 3. 创建工作流
jobs:
  deploy:  #单次部署的工作描述
    # Deploy to the github-pages environment
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest    # 依赖环境

    steps:                    # 工作流步骤
      # step 1. 获取源码, 拉取仓库代码
      - name: Checkout 🛎️             # 步骤名
        uses: actions/checkout@v3 # 使用插件 => https://github.com/actions/checkout

      # step 2. 使用指定版本 node
      - name: Use Node  📦              # 步骤名
        uses: actions/setup-node@v3 # 使用插件 => https://github.com/actions/setup-node
        with: # 插件携带参数
          node-version: 18.19.0 # 指定 node 版本
      # step 3. 安装pnpm
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '8.10.0'
      # step 4. 安装依赖并打包
      - name: Install dependencies
        run: pnpm install
      - name: Build
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          # next 打包输出的文件夹
          path: './out'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2    #使用插件 => https://github.com/actions/deploy-pages

```

**注意事项：**

1. 需要指定触发的分支，只有指定的分支才可以触发工作流，本文指定了`gh-pages`分支，`main`作为开发分支不做部署，在需要部署时才把相关的commit 通过`cherry-pick`到`gh-pages`分支。因此，可以把工作流文件放置在`gh-pages`分支中，并从`main`分支中删除。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730285368409-101d34d2-381d-40e9-9f5c-2254f09bd4e5.png)

2. 在工作流步骤的第二步中，需要指定node的版本，有时我们的项目需要node版本大等于某个版本，如果不符合要求将会导致工作流执行失败。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730285580903-7a8c361f-45b8-4b51-89cd-cf3ed135231a.png)

3. 在工作流的第三步，需要指定`pnpm`的版本号符合package.json中的最低要求，和node版本的要求一致，如不符合也将导致工作流报错。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730285720946-10deb631-b97b-4802-aca4-abc2dca391bf.png)

4. 在工作流的第四步，需要指定真正的打包命令，一般都是`pnpm build`，但也有可能是其它的命令，特别是需要多种构建模式的项目中。如：`pnpm build:web`

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730285884798-d7ecfbd8-fc84-4abf-b2ea-ca64d202b312.png)

5. 最后，我们需要指定打包输出的文件夹，打包成功后，每次访问github pages 都将从这个目录下访问有关的静态资源。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730286001385-0ba2869e-7c5b-40a6-9446-7a4ec44545a1.png)

最后，将`gh-pages`分支推送到github，即可触发工作流，完成部署。可以在 仓库顶端的actions 里查看所有的构建情况：

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730286528381-c6c0bec7-3cfc-4784-a05b-940007155b3f.png)

绿色是成功，红色是失败，可以点击查看详情：

可以看到失败的原因：因为笔者是从别的项目拷贝过来的工作流配置，导致指定的打包命令并没有在本项目的`package.json`文件中配置。

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730286607618-5f7cf441-f586-4675-8c57-554c30eb0ecb.png)

完成的成功情况，可以看到每一个过程的执行时间和线上的build阶段的时间，可以后续针对性做一些优化配置

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730286754032-ba743651-3466-49ef-91b0-485122ceb7a8.png)

最终部署结果，和本地运行的一致

![](https://cdn.nlark.com/yuque/0/2024/png/25532991/1730287600728-be953b8c-15e6-4e0b-a602-dd15e9d13605.png)

# 小结

本文介绍了next.js搭建一个react 组件库文档的项目的基本目录结果，项目搭建过程；并详细说明了changesets、commitlint的配置， 并完成了github仓库的提交；接着，本文详细阐述了如何使用github 的github pages功能，并集成github 的工作流部署，还做了五点重点说明。

感谢您的阅读，让我们下篇再见。

