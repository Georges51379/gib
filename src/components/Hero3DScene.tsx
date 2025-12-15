import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// Floating node component
const FloatingNode = ({ 
  position, 
  scale = 1, 
  speed = 1, 
  color,
  shape = 'sphere'
}: { 
  position: [number, number, number]; 
  scale?: number; 
  speed?: number; 
  color: string;
  shape?: 'sphere' | 'torus' | 'icosahedron' | 'octahedron';
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  const ShapeComponent = {
    sphere: Sphere,
    torus: Torus,
    icosahedron: Icosahedron,
    octahedron: Octahedron,
  }[shape];

  const shapeArgs = shape === 'torus' 
    ? [0.3, 0.15, 16, 32] 
    : shape === 'sphere' 
    ? [0.4, 32, 32] 
    : [0.4, 0];

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={1.5}
      floatingRange={[-0.2, 0.2]}
    >
      <ShapeComponent
        ref={meshRef}
        args={shapeArgs as any}
        position={position}
        scale={scale}
      >
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </ShapeComponent>
    </Float>
  );
};

// Connection lines between nodes
const ConnectionLines = ({ isDark }: { isDark: boolean }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const { viewport } = useThree();
  
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * viewport.width * 1.5,
        (Math.random() - 0.5) * viewport.height * 1.5,
        (Math.random() - 0.5) * 3
      ));
    }
    return pts;
  }, [viewport]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    // Create connections between nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < 3) {
          positions.push(points[i].x, points[i].y, points[i].z);
          positions.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={lineGeometry}>
      <lineBasicMaterial 
        color={isDark ? '#fbbf24' : '#3b82f6'} 
        transparent 
        opacity={0.15} 
      />
    </lineSegments>
  );
};

// Particle field
const ParticleField = ({ count = 100, isDark }: { count?: number; isDark: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      siz[i] = Math.random() * 2 + 0.5;
    }
    
    return [pos, siz];
  }, [count, viewport]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={isDark ? '#fbbf24' : '#3b82f6'}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Main scene content
const SceneContent = ({ isDark }: { isDark: boolean }) => {
  const primaryColor = isDark ? '#fbbf24' : '#3b82f6';
  const secondaryColor = isDark ? '#60a5fa' : '#8b5cf6';
  const accentColor = isDark ? '#34d399' : '#f59e0b';

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color={primaryColor} />
      
      {/* Floating geometric shapes */}
      <FloatingNode position={[-3, 1.5, -2]} scale={0.8} speed={0.8} color={primaryColor} shape="icosahedron" />
      <FloatingNode position={[3, -1, -1]} scale={0.6} speed={1.2} color={secondaryColor} shape="octahedron" />
      <FloatingNode position={[-2, -1.5, -3]} scale={0.5} speed={1} color={accentColor} shape="torus" />
      <FloatingNode position={[2.5, 2, -2]} scale={0.7} speed={0.9} color={primaryColor} shape="sphere" />
      <FloatingNode position={[-1, 2, -1.5]} scale={0.4} speed={1.3} color={secondaryColor} shape="icosahedron" />
      <FloatingNode position={[1, -2, -2.5]} scale={0.55} speed={1.1} color={accentColor} shape="octahedron" />
      
      {/* Connection lines network */}
      <ConnectionLines isDark={isDark} />
      
      {/* Particle field background */}
      <ParticleField count={80} isDark={isDark} />
    </>
  );
};

// Performance detector hook
const useCanRender3D = () => {
  const [canRender, setCanRender] = useState(true);
  
  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setCanRender(false);
      return;
    }
    
    // Check for low-end device indicators
    const isLowEnd = 
      navigator.hardwareConcurrency <= 2 ||
      /Android.*Mobile|iPhone|iPod/.test(navigator.userAgent) && 
      !window.matchMedia('(min-width: 768px)').matches;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isLowEnd || prefersReducedMotion) {
      setCanRender(false);
    }
  }, []);
  
  return canRender;
};

// Main export component
const Hero3DScene = () => {
  const canRender = useCanRender3D();
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Fallback for devices that can't render 3D
  if (!canRender) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient fallback */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: isDark 
              ? 'radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(96, 165, 250, 0.2) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
          }}
        />
        {/* Floating dots fallback */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              background: isDark ? '#fbbf24' : '#3b82f6',
              opacity: 0.4,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent isDark={isDark} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
