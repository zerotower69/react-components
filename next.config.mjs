import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeHighlight from 'rehype-highlight'

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true,
    //使用SSG构建方式
    output:'export',
    images:{
        //github pages 无法对图像优化
        unoptimized:true
    },
    //都是对应仓库名<reposity-name>
    // basePath:"/react-components",
    // assetPrefix:"/react-components",
    //支持这些后缀作为文件名
    pageExtensions:["js","jsx","ts","tsx","md","mdx"]
};

const withMDX = createMDX({
    extension: /\.mdx?$/,
    options:{
        //处理md象github那样，出来formatter语法
        remarkPlugins:[remarkGfm,remarkFrontmatter],
        rehypePlugins:[rehypeHighlight]
    }
    // Add markdown plugins here, as desired
})

export default withMDX(nextConfig);
