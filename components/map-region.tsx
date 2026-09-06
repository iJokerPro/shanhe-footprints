'use client';
import type { ReactElement } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
export function MapRegion({name,province,status,action,children}:{name:string;province?:string;status:string;action:string;children:ReactElement}){
 if(!name)return children;
 return <Tooltip><TooltipTrigger delay={0} closeDelay={0} render={children}/><TooltipContent className="region-tooltip" side="top" sideOffset={10}><div><small>{province||'旅行足迹'}</small><strong>{name}</strong><span>{status} · {action}</span></div></TooltipContent></Tooltip>;
}
