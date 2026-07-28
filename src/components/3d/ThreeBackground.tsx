import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  accentColor?: string;
  isLight?: boolean;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  accentColor = '#2563eb',
  isLight = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Light background fog
    scene.fog = new THREE.FogExp2(0xfafaf8, 0.012);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting for Glass Shapes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 1.5);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    dirLight2.position.set(-20, -20, 15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xec4899, 1, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // 3. Floating Glass Orbs Group
    const glassGroup = new THREE.Group();
    scene.add(glassGroup);

    // Create translucent glass spheres & icosahedrons
    const geometries = [
      new THREE.IcosahedronGeometry(5, 1),
      new THREE.SphereGeometry(3.5, 32, 32),
      new THREE.TorusGeometry(4, 1.2, 16, 50),
      new THREE.OctahedronGeometry(3, 0),
      new THREE.SphereGeometry(2.2, 32, 32),
    ];

    const materials = [
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#3b82f6'),
        roughness: 0.1,
        transmission: 0.85,
        thickness: 1.2,
        transparent: true,
        opacity: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#8b5cf6'),
        roughness: 0.15,
        transmission: 0.9,
        thickness: 1.5,
        transparent: true,
        opacity: 0.3,
        clearcoat: 1,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#06b6d4'),
        roughness: 0.05,
        transmission: 0.8,
        thickness: 0.8,
        transparent: true,
        opacity: 0.25,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ec4899'),
        roughness: 0.2,
        transmission: 0.85,
        thickness: 1.0,
        transparent: true,
        opacity: 0.2,
      }),
    ];

    const meshes: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; initialY: number; speedY: number }[] = [];

    // Position floating objects
    const positions = [
      { x: 18, y: 8, z: -5 },
      { x: -16, y: -6, z: -8 },
      { x: 14, y: -12, z: -10 },
      { x: -18, y: 10, z: -12 },
      { x: 0, y: -14, z: -15 },
    ];

    positions.forEach((pos, idx) => {
      const geo = geometries[idx % geometries.length];
      const mat = materials[idx % materials.length];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, pos.y, pos.z);
      glassGroup.add(mesh);

      meshes.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.005,
        },
        initialY: pos.y,
        speedY: 0.5 + Math.random() * 0.5,
      });
    });

    // 4. Soft Animated Gradient Mesh Waves
    const planeGeo = new THREE.PlaneGeometry(80, 80, 32, 32);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2.5;
    planeMesh.position.set(0, -18, -20);
    scene.add(planeMesh);

    // 5. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0003;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0003;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Animate Glass Shapes
      meshes.forEach(({ mesh, rotSpeed, initialY, speedY }) => {
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
        mesh.rotation.z += rotSpeed.z;
        mesh.position.y = initialY + Math.sin(elapsedTime * speedY) * 1.5;
      });

      // Animate background wave mesh
      const posAttr = planeGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getY(i);
        const z = Math.sin(elapsedTime * 0.8 + u * 0.1) * 0.8 + Math.cos(elapsedTime * 0.6 + v * 0.1) * 0.8;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      // Subtle camera rotation
      camera.position.x = Math.sin(elapsedTime * 0.1) * 0.5 + targetX * 12;
      camera.position.y = Math.cos(elapsedTime * 0.1) * 0.5 - targetY * 12;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      planeGeo.dispose();
      planeMat.dispose();
    };
  }, [accentColor]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAFAF8]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(59, 130, 246, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 88% 25%, rgba(139, 92, 246, 0.07) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.05) 0%, transparent 40%)
        `,
      }}
    />
  );
};
