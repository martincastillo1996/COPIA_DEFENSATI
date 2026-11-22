/**
 * Máscara de tierra firme a partir de /world-110m.json (TopoJSON de Natural Earth).
 * Decodifica los arcos cuantizados y rasteriza los continentes en proyección
 * equirectangular sobre un canvas 2D. Sin dependencias externas.
 */

type Pos = [number, number];
type Ring = number[];
interface Topology {
  transform?: { scale: Pos; translate: Pos };
  arcs: Pos[][];
  objects: { land: { geometries: { type: string; arcs: Ring[] | Ring[][] }[] } };
}

export interface LandMask {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}

let cache: Promise<LandMask> | null = null;

export function loadLandMask(w = 1024, h = 512): Promise<LandMask> {
  if (cache) return cache;
  cache = (async () => {
    const res = await fetch('/world-110m.json');
    if (!res.ok) throw new Error(`world-110m.json: HTTP ${res.status}`);
    const topo = (await res.json()) as Topology;
    const t = topo.transform;

    const arcs: Pos[][] = topo.arcs.map((arc) => {
      let x = 0;
      let y = 0;
      return arc.map(([a, b]) => {
        if (!t) return [a, b] as Pos;
        x += a;
        y += b;
        return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]] as Pos;
      });
    });

    const ringPoints = (ring: Ring): Pos[] => {
      const pts: Pos[] = [];
      for (const i of ring) {
        const arc = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
        pts.push(...(pts.length ? arc.slice(1) : arc));
      }
      return pts;
    };

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    if (!g) throw new Error('Canvas 2D no disponible');
    g.fillStyle = '#fff';

    const drawPolygon = (rings: Ring[]) => {
      g.beginPath();
      for (const r of rings) {
        ringPoints(r).forEach(([lon, lat], k) => {
          const X = ((lon + 180) / 360) * w;
          const Y = ((90 - lat) / 180) * h;
          if (k) g.lineTo(X, Y);
          else g.moveTo(X, Y);
        });
        g.closePath();
      }
      g.fill('evenodd');
    };

    for (const geo of topo.objects.land.geometries) {
      if (geo.type === 'Polygon') drawPolygon(geo.arcs as Ring[]);
      else if (geo.type === 'MultiPolygon') (geo.arcs as Ring[][]).forEach(drawPolygon);
    }

    return { data: g.getImageData(0, 0, w, h).data, w, h };
  })();
  cache.catch(() => {
    cache = null;
  });
  return cache;
}

export function isLand(mask: LandMask, lat: number, lon: number): boolean {
  const x = Math.min(mask.w - 1, Math.max(0, Math.floor(((lon + 180) / 360) * mask.w)));
  const y = Math.min(mask.h - 1, Math.max(0, Math.floor(((90 - lat) / 180) * mask.h)));
  return mask.data[(y * mask.w + x) * 4] > 127;
}
