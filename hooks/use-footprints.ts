'use client';
import {useEffect,useRef,useState} from 'react';
import type {SupabaseClient,User} from '@supabase/supabase-js';
import cities from '@/app/city-index.json';
import {loadCloud} from '@/lib/supabase-client';
import {acknowledge,diff,overlay,validCities,type Queue} from '@/lib/cloud-state';
const ALLOWED=new Set(cities.map(c=>c.id));
const GUEST='shanhe-cities-v2';
const cacheKey=(uid:string)=>`shanhe-cloud-v1:${uid}`;
export type SyncStatus='loading'|'local'|'unconfigured'|'syncing'|'synced'|'pending'|'error';
export function useFootprints(){
 const [visited,setVisited]=useState<string[]>([]),[user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[status,setStatus]=useState<SyncStatus>('loading'),[storageError,setStorageError]=useState(false),[cloudError,setCloudError]=useState(''),[configured,setConfigured]=useState(false),[pendingCount,setPendingCount]=useState(0),[guestCount,setGuestCount]=useState(0);
 const client=useRef<SupabaseClient|null>(null),owner=useRef<string|null>(null),current=useRef<string[]>([]),queue=useRef<Queue>({}),generation=useRef(0),revision=useRef(Date.now()),running=useRef<number|null>(null),alive=useRef(true),refreshSerial=useRef(0),initialized=useRef(false);
 function readGuest(){try{return validCities(JSON.parse(localStorage.getItem(GUEST)||'[]'),ALLOWED);}catch{setStorageError(true);return [];}}
 function show(next:string[]){current.current=next;setVisited(next);}
 function persist(){try{if(owner.current)localStorage.setItem(cacheKey(owner.current),JSON.stringify({visited:current.current,queue:queue.current}));else localStorage.setItem(GUEST,JSON.stringify(current.current));setStorageError(false);}catch{setStorageError(true);}setPendingCount(Object.keys(queue.current).length);}
 async function refresh(){const db=client.current,uid=owner.current,g=generation.current;if(!db||!uid)return;const serial=++refreshSerial.current;
  const {data,error}=await db.from('city_visits').select('city_id,visited').eq('user_id',uid);
  if(!alive.current||g!==generation.current||serial!==refreshSerial.current)return;
  if(error){setStatus(Object.keys(queue.current).length?'pending':'error');setCloudError('云端暂时不可用，本机记录已保留，请重试。');return;}
  const remote=(data||[]).filter(r=>r.visited&&ALLOWED.has(r.city_id)).map(r=>r.city_id as string);show(overlay(remote,queue.current));persist();setCloudError('');
  if(Object.keys(queue.current).length)void flush();else setStatus('synced');
 }
 async function flush(){const db=client.current,uid=owner.current,g=generation.current;if(!db||!uid||running.current===g)return;
  if(!Object.keys(queue.current).length){await refresh();return;}running.current=g;setStatus('syncing');let succeeded=true;
  try{while(alive.current&&g===generation.current&&Object.keys(queue.current).length){const sent={...queue.current};++refreshSerial.current;
   const rows=Object.entries(sent).map(([city_id,c])=>({user_id:uid,city_id,visited:c.visited}));
   const {error}=await db.from('city_visits').upsert(rows,{onConflict:'user_id,city_id'});
   if(!alive.current||g!==generation.current)return;
   if(error){succeeded=false;setStatus('pending');setCloudError('尚未同步成功，修改已保留在本机。可稍后重试。');break;}
   queue.current=acknowledge(queue.current,sent);persist();
  }}catch{succeeded=false;if(alive.current&&g===generation.current){setStatus('pending');setCloudError('网络连接中断，修改等待同步。');}}
  finally{if(running.current===g)running.current=null;}
  if(succeeded&&alive.current&&g===generation.current){setCloudError('');await refresh();}
 }
 function save(next:string[]){if(!ready)return;const clean=validCities(next,ALLOWED);if(owner.current){queue.current={...queue.current,...diff(current.current,clean,++revision.current)};show(clean);persist();setStatus('pending');void flush();}else{show(clean);persist();setGuestCount(clean.length);setStatus(client.current?'local':'unconfigured');}}
 function activate(nextUser:User|null){if(!alive.current)return;if(initialized.current&&owner.current===(nextUser?.id||null))return;initialized.current=true;generation.current++;refreshSerial.current++;owner.current=nextUser?.id||null;setUser(nextUser);setCloudError('');queue.current={};const guest=readGuest();setGuestCount(guest.length);
  if(!nextUser){show(guest);setPendingCount(0);setReady(true);setStatus(client.current?'local':'unconfigured');return;}
  let saved:string[]=[];try{const raw=JSON.parse(localStorage.getItem(cacheKey(nextUser.id))||'{}');if(raw.visited)saved=validCities(raw.visited,ALLOWED);if(raw.queue&&typeof raw.queue==='object')for(const [id,c] of Object.entries(raw.queue) as [string,{visited:unknown;revision:unknown}][]){if(ALLOWED.has(id)&&c&&typeof c.visited==='boolean'&&typeof c.revision==='number'){queue.current[id]={visited:c.visited,revision:c.revision};revision.current=Math.max(revision.current,c.revision);}}}catch{setStorageError(true);}
  show(overlay(saved,queue.current));setPendingCount(Object.keys(queue.current).length);setReady(true);setStatus('syncing');void refresh();
 }
 useEffect(()=>{alive.current=true;let unsubscribe:(()=>void)|undefined;let deferred:ReturnType<typeof setTimeout>|undefined;
  loadCloud().then(async db=>{if(!alive.current)return;client.current=db;setConfigured(!!db);if(!db){activate(null);return;}
   let eventSeen=false;const {data}=db.auth.onAuthStateChange((_event,session)=>{eventSeen=true;if(deferred)clearTimeout(deferred);deferred=setTimeout(()=>activate(session?.user||null),0);});unsubscribe=()=>data.subscription.unsubscribe();
   const session=await db.auth.getSession();if(!alive.current)return;if(!eventSeen)activate(session.data.session?.user||null);
  }).catch(()=>{if(alive.current){activate(null);setStatus('error');setCloudError('云同步配置暂时不可用，本地记录仍可使用。');}});
  const sync=()=>{if(owner.current)void flush();};const visible=()=>{if(document.visibilityState==='visible')sync();};window.addEventListener('online',sync);window.addEventListener('focus',sync);document.addEventListener('visibilitychange',visible);const timer=setInterval(sync,60000);
  return()=>{alive.current=false;generation.current++;unsubscribe?.();if(deferred)clearTimeout(deferred);clearInterval(timer);window.removeEventListener('online',sync);window.removeEventListener('focus',sync);document.removeEventListener('visibilitychange',visible);};
 },[]);
 async function sendLogin(email:string){if(!client.current)throw Error('云同步尚未配置');const {error}=await client.current.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:new URL('./',window.location.href).href}});if(error)throw Error('登录邮件发送失败，请稍后重试或联系网站管理者检查邮件服务。');}
 async function signOut(){if(Object.keys(queue.current).length)throw Error('还有未同步修改，请联网同步后再退出（可先导出备份）。');const {error}=await client.current!.auth.signOut({scope:'local'});if(error)throw Error('退出失败，请重试');activate(null);}
 function importGuest(){const guest=readGuest();save([...new Set([...current.current,...guest])]);return guest.length;}
 function importBackup(raw:unknown){if(!raw||typeof raw!=='object')throw Error('备份格式不正确');const b=raw as {format?:string;version?:number;cities?:unknown};if(b.format!=='shanhe-footprints'||b.version!==1)throw Error('不是支持的山河足迹备份');const ids=validCities(b.cities,ALLOWED);save([...new Set([...current.current,...ids])]);return ids.length;}
 function exportBackup(){const body=JSON.stringify({format:'shanhe-footprints',version:1,exportedAt:new Date().toISOString(),cities:current.current},null,2);const url=URL.createObjectURL(new Blob([body],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`山河足迹-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return {visited,save,user,ready,status,storageError,cloudError,configured,pendingCount,guestCount,sendLogin,signOut,importGuest,importBackup,exportBackup,retry:flush};
}
