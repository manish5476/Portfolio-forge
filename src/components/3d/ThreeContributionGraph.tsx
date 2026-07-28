import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Layers, RotateCcw, Sparkles } from 'lucide-react';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ThreeContributionGraphProps {
  contributions: ContributionDay[];
  accentColor?: string;
  isLight?: boolean;
}

export const ThreeContributionGraph: React.FC<ThreeContributionGraphProps> = ({
  contributions,
  accentColor = '#06b6d4',
  isLight = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ date: string; count: number } | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = mountRef.current;
    if (!container || !contributions || contributions.length === 0) return;

    // 1. Group contributions into weeks (up to 52)
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];
    contributions.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === contributions.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const maxWeeks = Math.min(weeks.length, 52);

    // 2. Setup Three.js Scene, Orthographic/Perspective Camera, Renderer
    const width = container.clientWidth || 700;
    const height = 280;

    const scene = new THREE.Scene();

    // Camera setup for Isometric 3D Projection
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 1000);
    camera.position.set(22, 28, 38);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(new THREE.Color(accentColor), 2, 60);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 4. Color Palette Mapping
    const levelColors = [
      new THREE.Color(isLight ? 0xe2e8f0 : 0x1e293b), // Level 0: Slate
      new THREE.Color(0x0891b2),                       // Level 1: Cyan-600
      new THREE.Color(0x0284c7),                       // Level 2: Sky-600
      new THREE.Color(0x3b82f6),                       // Level 3: Blue-500
      new THREE.Color(0x38bdf8),                       // Level 4: Electric Cyan
    ];

    const levelHeights = [0.2, 0.8, 1.5, 2.3, 3.4];

    // 5. Instanced / Group Grid of 3D Cubes
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Center grid offset
    const spacing = 0.85;
    const startX = -(maxWeeks * spacing) / 2;
    const startZ = -(7 * spacing) / 2;

    const cubeGeo = new THREE.BoxGeometry(0.7, 1, 0.7);
    const meshes: { mesh: THREE.Mesh; dayData: ContributionDay }[] = [];

    weeks.slice(0, maxWeeks).forEach((week, wIdx) => {
      week.forEach((day, dIdx) => {
        const heightVal = levelHeights[day.level];
        const colorVal = levelColors[day.level];

        const mat = new THREE.MeshStandardMaterial({
          color: colorVal,
          roughness: 0.3,
          metalness: 0.2,
          emissive: day.level > 2 ? colorVal : new THREE.Color(0x000000),
          emissiveIntensity: day.level > 2 ? 0.3 : 0,
        });

        const cube = new THREE.Mesh(cubeGeo, mat);
        cube.scale.set(1, heightVal, 1);
        cube.position.set(
          startX + wIdx * spacing,
          heightVal / 2,
          startZ + dIdx * spacing
        );

        cubeGroup.add(cube);
        meshes.push({ mesh: cube, dayData: day });
      });
    });

    // Grid Floor Outline
    const floorGeo = new THREE.PlaneGeometry(maxWeeks * spacing + 1, 7 * spacing + 1);
    const floorMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(isLight ? 0xcbd5e1 : 0x0f172a),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI / 2;
    floorMesh.position.y = -0.05;
    cubeGroup.add(floorMesh);

    // 6. Raycaster & Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let hoveredMesh: THREE.Mesh | null = null;
    let originalScaleY = 1;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const first = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== first) {
          if (hoveredMesh) {
            hoveredMesh.scale.y = originalScaleY;
          }
          hoveredMesh = first;
          originalScaleY = first.scale.y;
          first.scale.y = originalScaleY * 1.35;

          const match = meshes.find((m) => m.mesh === first);
          if (match) {
            setHoveredInfo({ date: match.dayData.date, count: match.dayData.count });
          }
        }
      } else {
        if (hoveredMesh) {
          hoveredMesh.scale.y = originalScaleY;
          hoveredMesh = null;
          setHoveredInfo(null);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // 7. Slow Rotation & Render Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation of grid
      cubeGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      cubeGeo.dispose();
      floorGeo.dispose();
      floorMat.dispose();
    };
  }, [contributions, isLight, accentColor, viewMode]);

  return (
    <div className="space-y-3">
      {/* Mode Controls & Hover Info Bar */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-semibold text-[11px] transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>{viewMode === '3d' ? '3D Isometric Matrix' : 'Flat 2D Grid'}</span>
          </button>
        </div>

        {/* Floating Tooltip Info */}
        <div className="h-6 flex items-center">
          {hoveredInfo ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] animate-in fade-in zoom-in-95 shadow-lg">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>
                <strong>{hoveredInfo.count}</strong> contributions on{' '}
                {new Date(hoveredInfo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">Hover over 3D cubes to inspect daily output</span>
          )}
        </div>
      </div>

      {/* Render Canvas Container or 2D Fallback */}
      {viewMode === '3d' ? (
        <div
          ref={mountRef}
          className="w-full h-[280px] rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden flex items-center justify-center cursor-crosshair shadow-inner"
        />
      ) : (
        /* Flat 2D Grid Fallback */
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-[repeat(52,minmax(0,1fr))] gap-1">
            {contributions.slice(0, 364).map((day, idx) => {
              const bg =
                day.level === 0
                  ? 'bg-slate-900'
                  : day.level === 1
                  ? 'bg-cyan-950 border-cyan-900'
                  : day.level === 2
                  ? 'bg-cyan-700'
                  : day.level === 3
                  ? 'bg-cyan-500'
                  : 'bg-cyan-300 shadow-sm shadow-cyan-400';
              return (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-xs border border-slate-800/50 ${bg}`}
                  title={`${day.count} on ${day.date}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
