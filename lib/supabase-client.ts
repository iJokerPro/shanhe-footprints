import {createClient,type SupabaseClient} from '@supabase/supabase-js';
let pending:Promise<SupabaseClient|null>|undefined;
export function loadCloud(){return pending??=fetch('./cloud-config.json',{cache:'no-store'}).then(async r=>{
 if(!r.ok)throw Error('无法读取云同步配置');
 const cfg=await r.json() as {url?:string;publishableKey?:string};
 if(!cfg.url&&!cfg.publishableKey)return null;
 if(!cfg.url||!cfg.publishableKey)throw Error('云同步配置不完整');
 const u=new URL(cfg.url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))throw Error('云同步地址无效');
 const key=cfg.publishableKey;
 if(!key.startsWith('sb_publishable_')){
  try{const body=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(body.role!=='anon')throw Error();}catch{throw Error('前端只能使用 Supabase 公开密钥');}
 }
 return createClient(cfg.url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
});}
