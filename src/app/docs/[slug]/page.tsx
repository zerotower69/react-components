import fs from "fs"
import path from "path"
import RemoteContent from "@/components/markdown/RemoteContent"

export async function generateStaticParams(){
    const files =fs.readdirSync(path.join(process.cwd(),'packages'))
        .filter(file=>fs.existsSync(path.join(process.cwd(),'packages',file,'docs','index.md')))
    return files.map(file => ({ slug: file } ))
}


export default async function Page({params}:{params:{slug:string}}){
    const slug = params.slug;
    const content = await fs.promises
        .readFile(path.join(process.cwd(),'packages',slug,'docs','index.md'), 'utf-8');

    return <>
        <div>slug:{params.slug}</div>
        {/*<div>{content}</div>*/}
        <RemoteContent source={content} />
    </>
}
