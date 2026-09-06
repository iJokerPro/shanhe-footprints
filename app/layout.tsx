import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'山河足迹 · 我的中国城市旅行地图', icons:{icon:'/favicon.svg'}, description:'按省份展开城市地图，逐个点亮地级市、自治州及同级目的地，记录城市旅行进度。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
