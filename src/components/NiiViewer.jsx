// src/components/NiiViewer.jsx - Updated with Option B (single border glow)
import { useEffect, useMemo, useRef, useState } from 'react';
import * as nifti from 'nifti-reader-js';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

const MNI_BG_URL = 'static/mni_2mm.nii.gz';
const X_RIGHT_ON_SCREEN_RIGHT = true;

function isStandardMNI2mm(dims, voxelMM) {
  const okDims = Array.isArray(dims) && dims[0]===91 && dims[1]===109 && dims[2]===91;
  const okSp = voxelMM && Math.abs(voxelMM[0]-2)<1e-3 && Math.abs(voxelMM[1]-2)<1e-3 && Math.abs(voxelMM[2]-2)<1e-3;
  return okDims && okSp;
}

const MNI2MM = { x0: 90, y0: -126, z0: -72, vx: 2, vy: 2, vz: 2 };

export function NiiViewer({ query }) {
  const [loadingBG, setLoadingBG] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errBG, setErrBG] = useState('');
  const [errMap, setErrMap] = useState('');

  const [voxel, setVoxel] = useState(2.0);
  const [fwhm, setFwhm] = useState(10.0);
  const [kernel, setKernel] = useState('gauss');
  const [r, setR] = useState(6.0);

  const [overlayAlpha, setOverlayAlpha] = useState(0.5);
  const [posOnly, setPosOnly] = useState(true);
  const [useAbs, setUseAbs] = useState(false);
  const [thrMode, setThrMode] = useState('pctl');
  const [pctl, setPctl] = useState(95);
  const [thrValue, setThrValue] = useState(0);

  const bgRef = useRef(null);
  const mapRef = useRef(null);
  const [dims, setDims] = useState([0,0,0]);
  const [ix, setIx] = useState(0);
  const [iy, setIy] = useState(0);
  const [iz, setIz] = useState(0);
  const [cx, setCx] = useState('0');
  const [cy, setCy] = useState('0');
  const [cz, setCz] = useState('0');

  const canvases = [useRef(null), useRef(null), useRef(null)];

  const mapUrl = useMemo(() => {
    if (!query) return '';
    const u = new URL(`${API_BASE}/query/${encodeURIComponent(query)}/nii`);
    u.searchParams.set('voxel', String(voxel));
    u.searchParams.set('fwhm', String(fwhm));
    u.searchParams.set('kernel', String(kernel));
    u.searchParams.set('r', String(r));
    return u.toString();
  }, [query, voxel, fwhm, kernel, r]);

  function asTypedArray(header, buffer) {
    switch (header.datatypeCode) {
      case nifti.NIFTI1.TYPE_INT8: return new Int8Array(buffer);
      case nifti.NIFTI1.TYPE_UINT8: return new Uint8Array(buffer);
      case nifti.NIFTI1.TYPE_INT16: return new Int16Array(buffer);
      case nifti.NIFTI1.TYPE_UINT16: return new Uint16Array(buffer);
      case nifti.NIFTI1.TYPE_INT32: return new Int32Array(buffer);
      case nifti.NIFTI1.TYPE_UINT32: return new Uint32Array(buffer);
      case nifti.NIFTI1.TYPE_FLOAT32: return new Float32Array(buffer);
      case nifti.NIFTI1.TYPE_FLOAT64: return new Float64Array(buffer);
      default: return new Float32Array(buffer);
    }
  }

  function minmax(arr) {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    return [mn, mx];
  }

  function percentile(arr, p, step=Math.ceil(arr.length/200000)) {
    if (!arr.length) return 0;
    const samp = [];
    for (let i=0; i<arr.length; i+=step) samp.push(arr[i]);
    samp.sort((a,b)=>a-b);
    const k = Math.floor((p/100) * (samp.length - 1));
    return samp[Math.max(0, Math.min(samp.length-1, k))];
  }

  async function loadNifti(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      throw new Error(`GET ${url} → ${res.status} ${t}`);
    }
    let ab = await res.arrayBuffer();
    if (nifti.isCompressed(ab)) ab = nifti.decompress(ab);
    if (!nifti.isNIFTI(ab)) throw new Error('not a NIfTI file');
    const header = nifti.readHeader(ab);
    const image = nifti.readImage(header, ab);
    const ta = asTypedArray(header, image);
    let f32;
    if (ta instanceof Float32Array) f32 = ta;
    else if (ta instanceof Float64Array) f32 = Float32Array.from(ta);
    else {
      const [mn, mx] = minmax(ta);
      const range = (mx - mn) || 1;
      f32 = new Float32Array(ta.length);
      for (let i=0;i<ta.length;i++) f32[i] = (ta[i] - mn) / range;
    }
    const nx = header.dims[1] | 0;
    const ny = header.dims[2] | 0;
    const nz = header.dims[3] | 0;
    if (!nx || !ny || !nz) throw new Error('invalid dims');
    const [mn, mx] = minmax(f32);
    const vx = Math.abs(header.pixDims?.[1] ?? 1);
    const vy = Math.abs(header.pixDims?.[2] ?? 1);
    const vz = Math.abs(header.pixDims?.[3] ?? 1);
    return { data: f32, dims:[nx,ny,nz], voxelMM:[vx,vy,vz], min: mn, max: mx };
  }

  const getVoxelMM = () => {
    const vm = bgRef.current?.voxelMM ?? mapRef.current?.voxelMM ?? [1,1,1];
    return { x: vm[0], y: vm[1], z: vm[2] };
  };

  const AXIS_SIGN = { x: -1, y: 1, z: 1 };

  const idx2coord = (i, n, axis) => {
    const [nx, ny, nz] = dims;
    const { x: vx, y: vy, z: vz } = getVoxelMM();
    const isStd = isStandardMNI2mm([nx, ny, nz], [vx, vy, vz]);
    if (isStd) {
      if (axis === 'x') return (-MNI2MM.vx * i + MNI2MM.x0);
      if (axis === 'y') return ( MNI2MM.vy * i + MNI2MM.y0);
      if (axis === 'z') return ( MNI2MM.vz * i + MNI2MM.z0);
    }
    const mmPerVoxel = axis === 'x' ? vx : axis === 'y' ? vy : vz;
    return AXIS_SIGN[axis] * (i - Math.floor(n/2)) * mmPerVoxel;
  };

  const coord2idx = (c_mm, n, axis) => {
    const [nx, ny, nz] = dims;
    const { x: vx, y: vy, z: vz } = getVoxelMM();
    const isStd = isStandardMNI2mm([nx, ny, nz], [vx, vy, vz]);
    if (isStd) {
      let v;
      if (axis === 'x') v = ( (MNI2MM.x0 - c_mm) / MNI2MM.vx );
      else if (axis === 'y') v = ( (c_mm - MNI2MM.y0) / MNI2MM.vy );
      else v = ( (c_mm - MNI2MM.z0) / MNI2MM.vz );
      const idx = Math.round(v);
      return Math.max(0, Math.min(n-1, idx));
    }
    const mmPerVoxel = axis === 'x' ? vx : axis === 'y' ? vy : vz;
    const sign = AXIS_SIGN[axis];
    const v = (sign * (c_mm / mmPerVoxel)) + Math.floor(n/2);
    const idx = Math.round(v);
    return Math.max(0, Math.min(n-1, idx));
  };

  useEffect(() => {
    let alive = true;
    setLoadingBG(true); setErrBG('');
    (async () => {
      try {
        const bg = await loadNifti(MNI_BG_URL);
        if (!alive) return;
        bgRef.current = bg;
        setDims(bg.dims);
        const [nx,ny,nz] = bg.dims;
        const mx = Math.floor(nx/2), my = Math.floor(ny/2), mz = Math.floor(nz/2);
        setIx(mx); setIy(my); setIz(mz);
        setCx('0'); setCy('0'); setCz('0');
      } catch (e) {
        if (!alive) return;
        setErrBG(e?.message || String(e));
        bgRef.current = null;
      } finally {
        if (!alive) return;
        setLoadingBG(false);
      }
    })();
    return () => { alive = false };
  }, []);

  useEffect(() => {
    if (!mapUrl) { mapRef.current = null; return }
    let alive = true;
    setLoadingMap(true); setErrMap('');
    (async () => {
      try {
        const mv = await loadNifti(mapUrl);
        if (!alive) return;
        mapRef.current = mv;
        if (!bgRef.current) {
          setDims(mv.dims);
          const [nx,ny,nz] = mv.dims;
          const mx = Math.floor(nx/2), my = Math.floor(ny/2), mz = Math.floor(nz/2);
          setIx(mx); setIy(my); setIz(mz);
          setCx('0'); setCy('0'); setCz('0');
        }
      } catch (e) {
        if (!alive) return;
        setErrMap(e?.message || String(e));
        mapRef.current = null;
      } finally {
        if (!alive) return;
        setLoadingMap(false);
      }
    })();
    return () => { alive = false };
  }, [mapUrl]);

  const mapThreshold = useMemo(() => {
    const mv = mapRef.current;
    if (!mv) return null;
    if (thrMode === 'value') return Number(thrValue) || 0;
    return percentile(mv.data, Math.max(0, Math.min(100, Number(pctl) || 95)));
  }, [thrMode, thrValue, pctl, mapRef.current]);

  function drawSlice(canvas, axis, index) {
    const [nx, ny, nz] = dims;
    const sx = (x) => (X_RIGHT_ON_SCREEN_RIGHT ? (nx - 1 - x) : x);
    const bg = bgRef.current;
    const map = mapRef.current;
    const dimsStr = dims.join('x');
    const bgOK = !!(bg && bg.dims.join('x') === dimsStr);
    const mapOK = !!(map && map.dims.join('x') === dimsStr);

    let w=0, h=0, getBG=null, getMap=null;
    if (axis === 'z') { w = nx; h = ny; if (bgOK) getBG = (x,y)=> bg.data[sx(x) + y*nx + index*nx*ny]; if (mapOK) getMap = (x,y)=> map.data[sx(x) + y*nx + index*nx*ny] }
    if (axis === 'y') { w = nx; h = nz; if (bgOK) getBG = (x,y)=> bg.data[sx(x) + index*nx + y*nx*ny]; if (mapOK) getMap = (x,y)=> map.data[sx(x) + index*nx + y*nx*ny] }
    if (axis === 'x') { w = ny; h = nz; if (bgOK) getBG = (x,y)=> bg.data[index + x*nx + y*nx*ny]; if (mapOK) getMap = (x,y)=> map.data[index + x*nx + y*nx*ny] }

    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    const img = ctx.createImageData(w, h);

    const alpha = Math.max(0, Math.min(1, overlayAlpha));
    const R = 255, G = 0, B = 0;
    const thr = mapThreshold;
    const bgMin = bg?.min ?? 0;
    const bgMax = bg?.max ?? 1;
    const bgRange = (bgMax - bgMin) || 1;

    let p = 0;
    for (let yy=0; yy<h; yy++) {
      const srcY = h - 1 - yy;
      for (let xx=0; xx<w; xx++) {
        let gray = 0;
        if (getBG) {
          const vbg = getBG(xx, srcY);
          let g = (vbg - bgMin) / bgRange;
          if (g < 0) g = 0;
          if (g > 1) g = 1;
          gray = (g * 255) | 0;
        }
        img.data[p] = gray;
        img.data[p + 1] = gray;
        img.data[p + 2] = gray;
        img.data[p + 3] = 255;

        if (getMap) {
          let mv = getMap(xx, srcY);
          const raw = mv;
          if (useAbs) mv = Math.abs(mv);
          let pass = (thr == null) ? (mv > 0) : (mv >= thr);
          if (posOnly && raw <= 0) pass = false;
          if (pass) {
            img.data[p] = ((1 - alpha) * img.data[p] + alpha * R) | 0;
            img.data[p + 1] = ((1 - alpha) * img.data[p + 1] + alpha * G) | 0;
            img.data[p + 2] = ((1 - alpha) * img.data[p + 2] + alpha * B) | 0;
          }
        }
        p += 4;
      }
    }
    ctx.putImageData(img, 0, 0);

    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    let cx = 0, cy = 0;
    if (axis === 'z') {
      cx = Math.max(0, Math.min(w-1, (X_RIGHT_ON_SCREEN_RIGHT ? (w - 1 - ix) : ix)));
      cy = Math.max(0, Math.min(h-1, iy));
    } else if (axis === 'y') {
      cx = Math.max(0, Math.min(w-1, (X_RIGHT_ON_SCREEN_RIGHT ? (w - 1 - ix) : ix)));
      cy = Math.max(0, Math.min(h-1, iz));
    } else {
      cx = Math.max(0, Math.min(w-1, iy));
      cy = Math.max(0, Math.min(h-1, iz));
    }
    const screenY = h - 1 - cy;
    ctx.beginPath(); ctx.moveTo(cx + 0.5, 0); ctx.lineTo(cx + 0.5, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, screenY + 0.5); ctx.lineTo(w, screenY + 0.5); ctx.stroke();
    ctx.restore();
  }

  function onCanvasClick(e, axis) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width);
    const y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height);
    const srcY = canvas.height - 1 - y;
    const [nx,ny,nz] = dims;
    const toIdxX = (screenX) => (X_RIGHT_ON_SCREEN_RIGHT ? (nx - 1 - screenX) : screenX);
    if (axis === 'z') { const xi = toIdxX(x); setIx(xi); setIy(srcY); setCx(String(idx2coord(xi, nx, 'x'))); setCy(String(idx2coord(srcY, ny, 'y'))) }
    else if (axis === 'y') { const xi = toIdxX(x); setIx(xi); setIz(srcY); setCx(String(idx2coord(xi, nx, 'x'))); setCz(String(idx2coord(srcY, nz, 'z'))) }
    else { setIy(x); setIz(srcY); setCy(String(idx2coord(x, ny, 'y'))); setCz(String(idx2coord(srcY, nz, 'z'))) }
  }

  useEffect(() => {
    const [nx,ny,nz] = dims;
    if (!nx) return;
    setCx(String(idx2coord(ix, nx, 'x')));
    setCy(String(idx2coord(iy, ny, 'y')));
    setCz(String(idx2coord(iz, nz, 'z')));
  }, [ix,iy,iz,dims]);

  const commitCoord = (axis) => {
    const [nx,ny,nz] = dims;
    let vStr = axis==='x' ? cx : axis==='y' ? cy : cz;
    if (vStr === '' || vStr === '-' ) return;
    const parsed = parseFloat(vStr);
    if (Number.isNaN(parsed)) return;
    if (axis==='x') setIx(coord2idx(parsed, nx, 'x'));
    if (axis==='y') setIy(coord2idx(parsed, ny, 'y'));
    if (axis==='z') setIz(coord2idx(parsed, nz, 'z'));
  };

  useEffect(() => {
    const [nx, ny, nz] = dims;
    if (!nx) return;
    const c0 = canvases[0].current, c1 = canvases[1].current, c2 = canvases[2].current;
    if (c0 && iz >=0 && iz < nz) drawSlice(c0, 'z', iz);
    if (c1 && iy >=0 && iy < ny) drawSlice(c1, 'y', iy);
    if (c2 && ix >=0 && ix < nx) drawSlice(c2, 'x', ix);
  }, [dims, ix, iy, iz, overlayAlpha, posOnly, useAbs, thrMode, pctl, thrValue, loadingBG, loadingMap, errBG, errMap, query]);

  const [nx, ny, nz] = dims;

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontSize: ds.fontSize.lg,
              fontWeight: ds.fontWeight.bold,
              color: ds.colors.text.primary,
              margin: 0,
              lineHeight: ds.lineHeight.tight
            }}>
              NIfTI visualization
            </h2>
            <p style={{
              fontSize: ds.fontSize.xs,
              color: ds.colors.text.tertiary,
              margin: `${ds.spacing.xs} 0 0 0`,
              fontWeight: ds.fontWeight.medium
            }}>
              Ajust the setting based on your needs.
            </p>
          </div>
          {query && mapUrl && (
            <a
              href={mapUrl}
              download
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: ds.spacing.sm,
                padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                background: ds.colors.primary[600],
                color: ds.colors.text.inverse,
                border: 'none',
                borderRadius: ds.borderRadius.md,
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.semibold,
                cursor: 'pointer',
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.sm,
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ds.colors.primary[700];
                e.currentTarget.style.boxShadow = ds.shadows.md;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ds.colors.primary[600];
                e.currentTarget.style.boxShadow = ds.shadows.sm;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Map
            </a>
          )}
        </div>
      </div>

      <div style={{ padding: ds.spacing.xl }}>
        <div style={{
          background: ds.colors.gray[50],
          borderRadius: ds.borderRadius.md,
          padding: ds.spacing.lg,
          marginBottom: ds.spacing.lg,
          border: `1px solid ${ds.colors.gray[200]}`
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: ds.spacing.md,
            marginBottom: ds.spacing.lg
          }}>
            {[
              { label: 'X (mm)', value: cx, setValue: setCx, axis: 'x' },
              { label: 'Y (mm)', value: cy, setValue: setCy, axis: 'y' },
              { label: 'Z (mm)', value: cz, setValue: setCz, axis: 'z' }
            ].map(({ label, value, setValue, axis }) => (
              <div key={axis}>
                <label style={{
                  display: 'block',
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                  marginBottom: ds.spacing.xs
                }}>
                  {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={() => commitCoord(axis)}
                  onKeyDown={(e) => { if(e.key==='Enter') commitCoord(axis) }}
                  style={{
                    ...ds.components.input,
                    width: '100%',
                    fontSize: ds.fontSize.sm,
                    textAlign: 'center',
                    fontWeight: ds.fontWeight.medium
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                    e.target.style.transform = 'translateY(-0.5px)';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[300];
                    }
                  }}
                  onBlur={(e) => {
                    commitCoord(axis);
                    e.target.style.borderColor = ds.colors.gray[300];
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: ds.spacing.md
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.semibold,
                color: ds.colors.text.secondary,
                marginBottom: ds.spacing.xs
              }}>
                Threshold Mode
              </label>
              <div style={{
                display: 'flex',
                gap: ds.spacing.xs,
                background: ds.colors.gray[100],
                padding: ds.spacing.xs,
                borderRadius: ds.borderRadius.lg
              }}>
                <button
                  onClick={() => setThrMode('pctl')}
                  style={{
                    flex: 1,
                    padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                    background: thrMode === 'pctl' 
                      ? ds.colors.background.primary
                      : 'transparent',
                    color: thrMode === 'pctl' 
                      ? ds.colors.primary[600]
                      : ds.colors.text.secondary,
                    border: 'none',
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.sm,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: thrMode === 'pctl' ? ds.shadows.sm : 'none'
                  }}
                >
                  Percentile
                </button>
                <button
                  onClick={() => setThrMode('value')}
                  style={{
                    flex: 1,
                    padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                    background: thrMode === 'value' 
                      ? ds.colors.background.primary
                      : 'transparent',
                    color: thrMode === 'value' 
                      ? ds.colors.primary[600]
                      : ds.colors.text.secondary,
                    border: 'none',
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.sm,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: thrMode === 'value' ? ds.shadows.sm : 'none'
                  }}
                >
                  Value
                </button>
              </div>
            </div>

            {thrMode === 'value' ? (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                  marginBottom: ds.spacing.xs
                }}>
                  Threshold
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={thrValue}
                  onChange={e=>setThrValue(Number(e.target.value))}
                  style={{
                    ...ds.components.input,
                    width: '100%',
                    fontSize: ds.fontSize.sm
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                    e.target.style.transform = 'translateY(-0.5px)';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[300];
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = ds.colors.gray[300];
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.semibold,
                  color: ds.colors.text.secondary,
                  marginBottom: ds.spacing.xs
                }}>
                  Percentile
                </label>
                <input
                  type='number'
                  min={50}
                  max={99.9}
                  step={0.5}
                  value={pctl}
                  onChange={e=>setPctl(Number(e.target.value)||95)}
                  style={{
                    ...ds.components.input,
                    width: '100%',
                    fontSize: ds.fontSize.sm
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                    e.target.style.transform = 'translateY(-0.5px)';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = ds.colors.gray[300];
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = ds.colors.gray[300];
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.semibold,
                color: ds.colors.text.secondary,
                marginBottom: ds.spacing.xs
              }}>
                Overlay Alpha: {overlayAlpha.toFixed(2)}
              </label>
              <input
                type='range'
                min={0}
                max={1}
                step={0.05}
                value={overlayAlpha}
                onChange={e=>setOverlayAlpha(Number(e.target.value))}
                style={{ width: '100%', marginTop: ds.spacing.xs }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.semibold,
                color: ds.colors.text.secondary,
                marginBottom: ds.spacing.xs
              }}>
                FWHM
              </label>
              <input
                type='number'
                step='0.5'
                value={fwhm}
                onChange={e=>setFwhm(Number(e.target.value)||0)}
                style={{
                  ...ds.components.input,
                  width: '100%',
                  fontSize: ds.fontSize.sm
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                  e.target.style.transform = 'translateY(-0.5px)';
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = ds.colors.gray[400];
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = ds.colors.gray[300];
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = ds.colors.gray[300];
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          </div>
        </div>

        {(loadingBG || loadingMap) && (
          <div style={{ padding: ds.spacing['2xl'], textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${ds.colors.primary[200]}`,
              borderTopColor: ds.colors.primary[600],
              borderRadius: ds.borderRadius.full,
              margin: '0 auto',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{
              color: ds.colors.text.tertiary,
              fontSize: ds.fontSize.sm,
              marginTop: ds.spacing.md,
              fontWeight: ds.fontWeight.medium
            }}>
              Loading brain data...
            </p>
          </div>
        )}

        {(errBG || errMap) && (
          <div style={{
            padding: ds.spacing.lg,
            borderRadius: ds.borderRadius.md,
            border: `1px solid ${ds.colors.error}40`,
            background: `${ds.colors.error}10`,
            color: ds.colors.error,
            fontSize: ds.fontSize.sm,
            marginBottom: ds.spacing.lg
          }}>
            {errBG && <div><strong>Background:</strong> {errBG}</div>}
            {errMap && <div><strong>Map:</strong> {errMap}</div>}
          </div>
        )}

        {nx && !loadingBG && !loadingMap && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: ds.spacing.md
          }}>
            {[
              { key: 'y', name: 'Coronal', canvasRef: canvases[1] },
              { key: 'x', name: 'Sagittal', canvasRef: canvases[2] },
              { key: 'z', name: 'Axial', canvasRef: canvases[0] }
            ].map(({ key, name, canvasRef }) => (
              <div key={key} style={{
                background: ds.colors.gray[900],
                borderRadius: ds.borderRadius.md,
                padding: ds.spacing.sm,
                border: `1px solid ${ds.colors.gray[200]}`
              }}>
                <p style={{
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.semibold,
                  color: ds.colors.gray[300],
                  marginBottom: ds.spacing.sm,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {name}
                </p>
                <canvas
                  ref={canvasRef}
                  onClick={(e) => onCanvasClick(e, key)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: ds.borderRadius.sm,
                    cursor: 'crosshair',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}