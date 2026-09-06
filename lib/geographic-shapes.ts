// Inverse of the atlas projection used by build-cities.py. Keep coordinates
// geographic before Leaflet projects them into Web Mercator tile space.
export function shapeRings(path:string):[number,number][][]{
 return (path.match(/M[^Z]+Z/g)||[]).map(ring=>(ring.match(/-?[\d.]+,-?[\d.]+/g)||[]).map(pair=>{const [x,y]=pair.split(',').map(Number);return [54-(y-20)/14.3,(x-25)/11.7+73] as [number,number];})).filter(r=>r.length>=3&&r.every(([lat,lng])=>Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180));
}
