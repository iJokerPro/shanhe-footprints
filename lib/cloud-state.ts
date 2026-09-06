export type Change={visited:boolean;revision:number};
export type Queue=Record<string,Change>;
export function validCities(input:unknown,allowed:Set<string>):string[]{
 if(!Array.isArray(input))throw new Error('足迹必须是城市代码数组');
 if(input.some(id=>typeof id!=='string'||!allowed.has(id)))throw new Error('备份包含无法识别的城市代码');
 return [...new Set(input as string[])];
}
export function overlay(remote:string[],queue:Queue):string[]{const result=new Set(remote);for(const [id,c] of Object.entries(queue)){if(c.visited)result.add(id);else result.delete(id);}return [...result];}
export function acknowledge(current:Queue,sent:Queue):Queue{const next={...current};for(const [id,c] of Object.entries(sent))if(next[id]?.revision===c.revision)delete next[id];return next;}
export function diff(before:string[],after:string[],revision:number):Queue{const a=new Set(before),b=new Set(after);const result:Queue={};for(const id of new Set([...before,...after]))if(a.has(id)!==b.has(id))result[id]={visited:b.has(id),revision};return result;}
