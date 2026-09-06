export type Camera = { k:number; x:number; y:number };
export const HOME:Camera={k:1,x:0,y:0};
export function constrain(c:Camera,w:number,h:number):Camera{const k=Math.max(1,Math.min(8,c.k));const mx=w*(1-1/k)/2,my=h*(1-1/k)/2;return {k,x:Math.max(-mx,Math.min(mx,c.x)),y:Math.max(-my,Math.min(my,c.y))};}
export function zoomAt(c:Camera,k:number,w:number,h:number,px=0,py=0):Camera{const next=Math.max(1,Math.min(8,k));return constrain({k:next,x:px-(px-c.x)*c.k/next,y:py-(py-c.y)*c.k/next},w,h);}
