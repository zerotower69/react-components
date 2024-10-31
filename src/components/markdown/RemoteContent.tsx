import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeHighlight from "rehype-highlight";
import {MDXRemote} from "next-mdx-remote/rsc";

const RemoteContent:React.FC<{source:string}>=({source})=>{
    return <MDXRemote source={source} options={{
        mdxOptions:{
            remarkPlugins:[remarkGfm,remarkFrontmatter],
            rehypePlugins:[rehypeHighlight]
        }
    }}/>
}

export default RemoteContent
