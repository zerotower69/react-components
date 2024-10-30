/** @type {import('next').NextConfig} */
const nextConfig = {
    output:"export",
    images:{
        //github pages 无法对图像优化
        unoptimized:true
    },
    basePath:"/react-components",
    assetPrefix:"/react-components"
};

export default nextConfig;
