import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  X,
  Play
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { LooksmaxingState, BanyaState } from '../../types/game';

interface GTAWorld3DViewProps {
  onOpenBanya: () => void;
  onOpenLooksmax: () => void;
  onOpenBusiness: () => void;
  onOpenDealership: () => void;
  onOpenFootball: () => void;
  onOpenInvestments: () => void;
  onOpenLuxury: () => void;
  onOpenClub: () => void;
  onOpenTax: () => void;
  looksmaxing: LooksmaxingState;
  banya: BanyaState;
  cash: number;
}

interface VehicleData {
  mesh: THREE.Group;
  name: string;
  color: string;
  pos: THREE.Vector3;
  rotY: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  steerAngle: number;
}

export function GTAWorld3DView({
  onOpenBanya,
  onOpenLooksmax,
  onOpenBusiness,
  onOpenDealership,
  onOpenFootball,
  onOpenInvestments,
  onOpenLuxury,
  onOpenClub,
  onOpenTax,
  looksmaxing,
  banya,
  cash
}: GTAWorld3DViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [inVehicle, setInVehicle] = useState<boolean>(false);
  const [currentCarName, setCurrentCarName] = useState<string>('');
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [nearbyAction, setNearbyAction] = useState<{
    text: string;
    action: () => void;
    icon: string;
  } | null>(null);

  // Radio Station
  const [radioStation, setRadioStation] = useState<string>('Luxury Phonk FM');

  // Input State Refs for zero-latency frame loop
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
    boost: false,
    horn: false
  });

  // Player & Vehicle Simulation Refs
  const simRef = useRef<{
    playerPos: THREE.Vector3;
    playerRotY: number;
    playerVelocity: THREE.Vector3;
    isGrounded: boolean;
    walkCycle: number;
    inVehicle: boolean;
    currentVehicleIndex: number;
    vehicles: VehicleData[];
  }>({
    playerPos: new THREE.Vector3(0, 0, 15),
    playerRotY: 0,
    playerVelocity: new THREE.Vector3(),
    isGrounded: true,
    walkCycle: 0,
    inVehicle: false,
    currentVehicleIndex: -1,
    vehicles: []
  });

  // Touch joystick tracking
  const [touchActive, setTouchActive] = useState<boolean>(false);
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c14);
    scene.fog = new THREE.FogExp2(0x0a0c14, 0.008);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Atmospheric metropolis lighting)
    const hemiLight = new THREE.HemisphereLight(0x7c8ba1, 0x1f232b, 0.9);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 3. Ground & Roads
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads Grid (Main avenues)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x242831, roughness: 0.7 });
    const markMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const whiteMarkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // North-South Main Boulevard
    const mainRoadNS = new THREE.Mesh(new THREE.PlaneGeometry(18, 350), roadMat);
    mainRoadNS.rotation.x = -Math.PI / 2;
    mainRoadNS.position.y = 0.02;
    mainRoadNS.receiveShadow = true;
    scene.add(mainRoadNS);

    // East-West Main Boulevard
    const mainRoadEW = new THREE.Mesh(new THREE.PlaneGeometry(350, 18), roadMat);
    mainRoadEW.rotation.x = -Math.PI / 2;
    mainRoadEW.position.y = 0.02;
    mainRoadEW.receiveShadow = true;
    scene.add(mainRoadEW);

    // Road markings
    for (let z = -160; z <= 160; z += 8) {
      if (Math.abs(z) > 10) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 4), markMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0, 0.03, z);
        scene.add(stripe);
      }
    }
    for (let x = -160; x <= 160; x += 8) {
      if (Math.abs(x) > 10) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), markMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0.03, 0);
        scene.add(stripe);
      }
    }

    // 4. Street Lamps
    const lampGeo = new THREE.CylinderGeometry(0.12, 0.18, 8, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe89e });

    const createStreetLamp = (x: number, z: number) => {
      const pole = new THREE.Mesh(lampGeo, lampMat);
      pole.position.set(x, 4, z);
      pole.castShadow = true;
      scene.add(pole);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bulbMat);
      bulb.position.set(x, 8, z);
      scene.add(bulb);

      const light = new THREE.PointLight(0xffe082, 1.2, 22, 1.8);
      light.position.set(x, 7.8, z);
      scene.add(light);
    };

    [-11, 11].forEach(x => {
      [-60, -30, 30, 60, 90].forEach(z => {
        createStreetLamp(x, z);
      });
    });

    // 5. Buildings and POIs:
    // -------------------------------------------------------------
    // POI 1: 🧖‍♂️ РУССКАЯ БАНЯ (Russian Banya & Spa Complex)
    // -------------------------------------------------------------
    const banyaGroup = new THREE.Group();
    banyaGroup.position.set(-35, 0, 25);

    // Cedar log cabin main body
    const logBodyMat = new THREE.MeshStandardMaterial({ color: 0x6d3e20, roughness: 0.9 });
    const banyaBody = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 14), logBodyMat);
    banyaBody.position.y = 3.5;
    banyaBody.castShadow = true;
    banyaBody.receiveShadow = true;
    banyaGroup.add(banyaBody);

    // Pitched wooden roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3e2213, roughness: 0.95 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 5, 4), roofMat);
    roof.position.y = 9.5;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 1.3);
    roof.castShadow = true;
    banyaGroup.add(roof);

    // Stone Chimney with real steam particles
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.9, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    chimney.position.set(4, 9, 3);
    chimney.castShadow = true;
    banyaGroup.add(chimney);

    // Steaming Chimney Smoke Particles
    const smokeCount = 18;
    const smokeGeo = new THREE.SphereGeometry(0.6, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.45 });
    const smokePuffs: THREE.Mesh[] = [];
    for (let i = 0; i < smokeCount; i++) {
      const puff = new THREE.Mesh(smokeGeo, smokeMat);
      puff.position.set(4 + (Math.random() - 0.5) * 0.8, 13 + i * 0.6, 3 + (Math.random() - 0.5) * 0.8);
      puff.scale.setScalar(1 + i * 0.2);
      banyaGroup.add(puff);
      smokePuffs.push(puff);
    }

    // Windows with warm firelight glow
    const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
    const banyaWindow = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), warmWindowMat);
    banyaWindow.position.set(0, 4, 7.05);
    banyaGroup.add(banyaWindow);

    // Outdoor Cold Plunge Tub (Купель)
    const plungeTub = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.8, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0x54361e, roughness: 0.8 })
    );
    plungeTub.position.set(12, 1, 5);
    banyaGroup.add(plungeTub);

    const plungeWater = new THREE.Mesh(
      new THREE.CircleGeometry(2.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.8 })
    );
    plungeWater.rotation.x = -Math.PI / 2;
    plungeWater.position.set(12, 1.8, 5);
    banyaGroup.add(plungeWater);

    // Glowing Banya Sign Badge
    const signMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 0.4), signMat);
    signMesh.position.set(0, 6.5, 7.2);
    banyaGroup.add(signMesh);

    scene.add(banyaGroup);

    // -------------------------------------------------------------
    // POI 2: 🏎️ PRESTIGE MOTOR DEALERSHIP
    // -------------------------------------------------------------
    const dealerGroup = new THREE.Group();
    dealerGroup.position.set(38, 0, 25);

    const dealerBody = new THREE.Mesh(
      new THREE.BoxGeometry(22, 9, 20),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    dealerBody.position.y = 4.5;
    dealerBody.castShadow = true;
    dealerGroup.add(dealerBody);

    // Glass showroom windows
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1 });
    const showroomGlass = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), glassMat);
    showroomGlass.position.set(-11.05, 4, 0);
    showroomGlass.rotation.y = -Math.PI / 2;
    dealerGroup.add(showroomGlass);

    // Dealer Neon Crown Sign
    const dealerSign = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
    dealerSign.position.set(-11.2, 8.5, 0);
    dealerSign.rotation.y = -Math.PI / 2;
    dealerGroup.add(dealerSign);

    scene.add(dealerGroup);

    // -------------------------------------------------------------
    // POI 3: 🏢 BUSINESS CITY TOWERS (10 Империй)
    // -------------------------------------------------------------
    const createSkyscraper = (x: number, z: number, h: number, colorHex: number, title: string) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(16, h, 16),
        new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.7, roughness: 0.3 })
      );
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      tower.add(body);

      // Spire / Spire Light
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      spire.position.y = h + 5;
      tower.add(spire);

      // Beacon
      const beacon = new THREE.PointLight(0xef4444, 2, 25);
      beacon.position.y = h + 10;
      tower.add(beacon);

      scene.add(tower);
    };

    createSkyscraper(-40, -50, 48, 0x1e3a8a, 'VANGUARD CORP');
    createSkyscraper(-65, -45, 62, 0x3b0764, 'AURA HOLDING');
    createSkyscraper(-45, -80, 54, 0x0f766e, 'SYNAPSE AI');

    // -------------------------------------------------------------
    // POI 4: 🗿 LOOKSMAXING CLINIC & BARBERSHOP
    // -------------------------------------------------------------
    const clinicGroup = new THREE.Group();
    clinicGroup.position.set(38, 0, -40);

    const clinicBody = new THREE.Mesh(
      new THREE.BoxGeometry(18, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
    );
    clinicBody.position.y = 4;
    clinicBody.castShadow = true;
    clinicGroup.add(clinicBody);

    // Barber Pole
    const barberPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 5, 12),
      new THREE.MeshStandardMaterial({ color: 0xec4899 })
    );
    barberPole.position.set(-9.5, 3.5, 5);
    clinicGroup.add(barberPole);

    // Glowing Neon Sign
    const clinicSign = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    clinicSign.position.set(-9.2, 7, 0);
    clinicSign.rotation.y = -Math.PI / 2;
    clinicGroup.add(clinicSign);

    scene.add(clinicGroup);

    // -------------------------------------------------------------
    // POI 5: ⚽ FOOTBALL ARENA & STADIUM
    // -------------------------------------------------------------
    const stadiumGroup = new THREE.Group();
    stadiumGroup.position.set(80, 0, -50);

    const stadiumBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 28, 10, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, side: THREE.DoubleSide })
    );
    stadiumBowl.position.y = 5;
    stadiumBowl.castShadow = true;
    stadiumGroup.add(stadiumBowl);

    const greenPitch = new THREE.Mesh(
      new THREE.CircleGeometry(22, 24),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    greenPitch.rotation.x = -Math.PI / 2;
    greenPitch.position.y = 0.1;
    stadiumGroup.add(greenPitch);

    // Stadium Floodlight Towers
    [[-20, -20], [20, -20], [-20, 20], [20, 20]].forEach(([lx, lz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 18, 6), new THREE.MeshBasicMaterial({ color: 0x64748b }));
      p.position.set(lx, 9, lz);
      stadiumGroup.add(p);
      const flood = new THREE.PointLight(0xffffff, 1.5, 30);
      flood.position.set(lx, 17, lz);
      stadiumGroup.add(flood);
    });

    scene.add(stadiumGroup);

    // -------------------------------------------------------------
    // POI 6: 🍸 VIP SYNDICATE CLUB
    // -------------------------------------------------------------
    const clubGroup = new THREE.Group();
    clubGroup.position.set(-45, 0, 80);
    const clubBody = new THREE.Mesh(
      new THREE.BoxGeometry(18, 14, 18),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.1 })
    );
    clubBody.position.y = 7;
    clubBody.castShadow = true;
    clubGroup.add(clubBody);

    const clubCrownSign = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.4, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xeab308 })
    );
    clubCrownSign.position.set(0, 15, 0);
    clubGroup.add(clubCrownSign);
    scene.add(clubGroup);

    // -------------------------------------------------------------
    // 6. 3D DRIVEABLE LUXURY VEHICLES
    // -------------------------------------------------------------
    const vehicles: VehicleData[] = [];

    const create3DSupercar = (name: string, hexColor: number, startPos: THREE.Vector3, rotY: number) => {
      const car = new THREE.Group();
      car.position.copy(startPos);
      car.rotation.y = rotY;

      // Chassis / Body
      const bodyMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        metalness: 0.9,
        roughness: 0.2
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 4.8), bodyMat);
      body.position.y = 0.55;
      body.castShadow = true;
      car.add(body);

      // Cabin / Cockpit Glass
      const cabinMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.95,
        roughness: 0.05
      });
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.65, 2.4), cabinMat);
      cabin.position.set(0, 1.15, -0.3);
      cabin.castShadow = true;
      car.add(cabin);

      // Rear Spoiler / Wing
      const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.6), spoilerMat);
      spoiler.position.set(0, 1.1, 2.1);
      car.add(spoiler);

      // Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 });
      const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
      wheelGeo.rotateZ(Math.PI / 2);

      const wheelPositions = [
        [-1.15, 0.42, 1.4],
        [1.15, 0.42, 1.4],
        [-1.15, 0.42, -1.4],
        [1.15, 0.42, -1.4]
      ];

      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        wheel.castShadow = true;
        car.add(wheel);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.37, 8), rimMat);
        rim.rotateZ(Math.PI / 2);
        rim.position.set(wx, wy, wz);
        car.add(rim);
      });

      // Headlights (Xenon White)
      const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), headlightMat);
      hlLeft.position.set(-0.8, 0.65, -2.4);
      car.add(hlLeft);

      const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), headlightMat);
      hlRight.position.set(0.8, 0.65, -2.4);
      car.add(hlRight);

      // Headlight Cones
      const headSpot = new THREE.SpotLight(0xffffff, 2, 45, Math.PI / 6, 0.4);
      headSpot.position.set(0, 0.7, -2.3);
      headSpot.target.position.set(0, 0, -20);
      car.add(headSpot);
      car.add(headSpot.target);

      // Taillights (Neon Red)
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
      const tailBar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.1), tailMat);
      tailBar.position.set(0, 0.7, 2.41);
      car.add(tailBar);

      scene.add(car);

      return {
        mesh: car,
        name,
        color: '#' + hexColor.toString(16),
        pos: car.position,
        rotY,
        speed: 0,
        maxSpeed: 1.4,
        accel: 0.025,
        steerAngle: 0
      };
    };

    // Spawn fleet of luxury supercars
    vehicles.push(create3DSupercar('Bugatti Chiron Super Sport 300+', 0x1d4ed8, new THREE.Vector3(-6, 0, 10), 0));
    vehicles.push(create3DSupercar('Porsche 911 GT3 RS Shark Blue', 0x0284c7, new THREE.Vector3(6, 0, 10), Math.PI));
    vehicles.push(create3DSupercar('Ferrari SF90 XX Stradale Rosso', 0xdc2626, new THREE.Vector3(-6, 0, -20), 0));
    vehicles.push(create3DSupercar('Lamborghini Revuelto Verde', 0x84cc16, new THREE.Vector3(6, 0, -20), Math.PI));
    vehicles.push(create3DSupercar('Rolls-Royce Phantom VIII Gold', 0xb45309, new THREE.Vector3(-25, 0, 22), Math.PI / 2));

    simRef.current.vehicles = vehicles;

    // -------------------------------------------------------------
    // 7. 3D CHAD PLAYER AVATAR
    // -------------------------------------------------------------
    const playerGroup = new THREE.Group();
    playerGroup.position.copy(simRef.current.playerPos);

    // Torso / Suit Blazer (V-Taper)
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.5), suitMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    playerGroup.add(torso);

    // White Luxury Shirt collar
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.52), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    shirt.position.set(0, 1.8, 0.02);
    playerGroup.add(shirt);

    // Gold Chain (Prestige accessory)
    const goldChain = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 6, 16), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    goldChain.position.set(0, 1.9, 0.24);
    goldChain.rotation.x = Math.PI / 4;
    playerGroup.add(goldChain);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.55), skinMat);
    head.position.y = 2.45;
    head.castShadow = true;
    playerGroup.add(head);

    // Sharp Jawline (Mewing visual)
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.35), skinMat);
    jaw.position.set(0, 2.2, -0.15);
    playerGroup.add(jaw);

    // Dark Sunglasses
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.1), glassesMat);
    glasses.position.set(0, 2.5, -0.3);
    playerGroup.add(glasses);

    // Luxury Hair Fade
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.25, 0.58), hairMat);
    hair.position.set(0, 2.8, 0);
    playerGroup.add(hair);

    // Legs
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 0.35), pantsMat);
    leftLeg.position.set(-0.25, 0.5, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 0.35), pantsMat);
    rightLeg.position.set(0.25, 0.5, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    // Glowing Mogger Aura Ring on ground
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const auraRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.35, 32), auraMat);
    auraRing.rotation.x = -Math.PI / 2;
    auraRing.position.y = 0.05;
    playerGroup.add(auraRing);

    scene.add(playerGroup);

    // -------------------------------------------------------------
    // 8. KEYBOARD & CONTROLS EVENT LISTENERS
    // -------------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        inputRef.current.sprint = true;
        inputRef.current.boost = true;
      }
      if (code === 'Space') {
        inputRef.current.jump = true;
      }
      if (code === 'KeyH') {
        sounds.playCarHorn();
      }
      if (code === 'KeyE') {
        // Trigger interaction
        handleInteractTrigger();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        inputRef.current.sprint = false;
        inputRef.current.boost = false;
      }
      if (code === 'Space') {
        inputRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // -------------------------------------------------------------
    // 9. ANIMATION & SIMULATION LOOP
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const input = inputRef.current;
      const sim = simRef.current;

      // Animate chimney smoke puffs
      smokePuffs.forEach((puff, idx) => {
        puff.position.y += delta * 1.5;
        puff.position.x += Math.sin(clock.getElapsedTime() + idx) * 0.02;
        if (puff.position.y > 22) {
          puff.position.y = 12;
        }
      });

      // Animate dealer car turntable
      dealerBody.rotation.y += delta * 0.02;

      // -------------------------------------------------------------
      // Vehicle Driving Physics vs On-Foot Player Controller
      // -------------------------------------------------------------
      if (sim.inVehicle && sim.currentVehicleIndex >= 0) {
        const vehicle = sim.vehicles[sim.currentVehicleIndex];

        // Acceleration / Braking
        const accelRate = vehicle.accel * (input.boost ? 2.0 : 1.0);
        const topLimit = vehicle.maxSpeed * (input.boost ? 1.6 : 1.0);

        if (input.forward) {
          vehicle.speed = Math.min(topLimit, vehicle.speed + accelRate);
        } else if (input.backward) {
          vehicle.speed = Math.max(-0.4, vehicle.speed - accelRate);
        } else {
          // Friction / Coasting
          vehicle.speed *= 0.96;
        }

        // Steering (Inverted when reversing)
        const steerDir = vehicle.speed < 0 ? -1 : 1;
        if (input.left) {
          vehicle.rotY += 1.8 * delta * steerDir * (Math.abs(vehicle.speed) / topLimit + 0.2);
        }
        if (input.right) {
          vehicle.rotY -= 1.8 * delta * steerDir * (Math.abs(vehicle.speed) / topLimit + 0.2);
        }

        // Update Vehicle Position
        const moveDist = vehicle.speed * 60 * delta;
        vehicle.pos.x -= Math.sin(vehicle.rotY) * moveDist;
        vehicle.pos.z -= Math.cos(vehicle.rotY) * moveDist;

        // City perimeter bounds [-160, 160]
        vehicle.pos.x = Math.max(-160, Math.min(160, vehicle.pos.x));
        vehicle.pos.z = Math.max(-160, Math.min(160, vehicle.pos.z));

        vehicle.mesh.position.copy(vehicle.pos);
        vehicle.mesh.rotation.y = vehicle.rotY;

        // Player follows inside vehicle
        sim.playerPos.copy(vehicle.pos);
        playerGroup.position.copy(vehicle.pos);
        playerGroup.visible = false; // Hide on foot avatar while driving

        // Update live speedometer state
        const calculatedKmh = Math.round(Math.abs(vehicle.speed) * 260);
        setSpeedKmh(calculatedKmh);

        // Chase Camera behind vehicle
        const camDistance = 8.5;
        const camHeight = 3.8;
        const targetCamX = vehicle.pos.x + Math.sin(vehicle.rotY) * camDistance;
        const targetCamZ = vehicle.pos.z + Math.cos(vehicle.rotY) * camDistance;

        camera.position.lerp(new THREE.Vector3(targetCamX, vehicle.pos.y + camHeight, targetCamZ), 0.12);
        camera.lookAt(vehicle.pos.x, vehicle.pos.y + 1.2, vehicle.pos.z);

      } else {
        // ON FOOT CHAD CONTROLLER
        playerGroup.visible = true;

        const moveSpeed = (input.sprint ? 14 : 7) * delta;
        let moveX = 0;
        let moveZ = 0;

        if (input.forward) moveZ -= 1;
        if (input.backward) moveZ += 1;
        if (input.left) moveX -= 1;
        if (input.right) moveX += 1;

        const isMoving = moveX !== 0 || moveZ !== 0;

        if (isMoving) {
          const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
          sim.playerPos.x += moveVector.x * moveSpeed;
          sim.playerPos.z += moveVector.z * moveSpeed;

          // Target rotation towards move direction
          const targetAngle = Math.atan2(moveVector.x, moveVector.z);
          sim.playerRotY = targetAngle;
          playerGroup.rotation.y = targetAngle;

          // Procedural walk animation cycle
          sim.walkCycle += delta * (input.sprint ? 16 : 9);
          leftLeg.rotation.x = Math.sin(sim.walkCycle) * 0.6;
          rightLeg.rotation.x = -Math.sin(sim.walkCycle) * 0.6;
        } else {
          leftLeg.rotation.x = 0;
          rightLeg.rotation.x = 0;
        }

        // Jump physics
        if (input.jump && sim.isGrounded) {
          sim.playerVelocity.y = 8;
          sim.isGrounded = false;
        }

        if (!sim.isGrounded) {
          sim.playerVelocity.y -= 25 * delta;
          sim.playerPos.y += sim.playerVelocity.y * delta;
          if (sim.playerPos.y <= 0) {
            sim.playerPos.y = 0;
            sim.playerVelocity.y = 0;
            sim.isGrounded = true;
          }
        }

        // City bounds
        sim.playerPos.x = Math.max(-160, Math.min(160, sim.playerPos.x));
        sim.playerPos.z = Math.max(-160, Math.min(160, sim.playerPos.z));

        playerGroup.position.copy(sim.playerPos);

        // Third-person camera follow behind player
        const camDistance = 6.5;
        const camHeight = 3.2;
        const targetCamX = sim.playerPos.x + Math.sin(sim.playerRotY) * camDistance;
        const targetCamZ = sim.playerPos.z + Math.cos(sim.playerRotY) * camDistance;

        camera.position.lerp(new THREE.Vector3(targetCamX, sim.playerPos.y + camHeight, targetCamZ), 0.15);
        camera.lookAt(sim.playerPos.x, sim.playerPos.y + 1.8, sim.playerPos.z);

        setSpeedKmh(0);
      }

      // -------------------------------------------------------------
      // Proximity Triggers & Interaction Detection
      // -------------------------------------------------------------
      checkProximityInteractions();

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Proximity logic
    const checkProximityInteractions = () => {
      const p = simRef.current.playerPos;

      // 1. Vehicle Entry Check (if on foot)
      if (!simRef.current.inVehicle) {
        let foundCarIndex = -1;
        simRef.current.vehicles.forEach((v, idx) => {
          if (p.distanceTo(v.pos) < 4.5) {
            foundCarIndex = idx;
          }
        });

        if (foundCarIndex >= 0) {
          const car = simRef.current.vehicles[foundCarIndex];
          setNearbyAction({
            text: `[E] Сесть за руль ${car.name}`,
            action: () => enterVehicle(foundCarIndex),
            icon: '🏎️'
          });
          return;
        }
      } else {
        // In car exit prompt
        setNearbyAction({
          text: `[E] Выйти из машины`,
          action: () => exitVehicle(),
          icon: '🚶‍♂️'
        });
        return;
      }

      // 2. 🧖‍♂️ Russian Banya Check ((-35, 25))
      const banyaDist = p.distanceTo(new THREE.Vector3(-35, 0, 25));
      if (banyaDist < 14) {
        setNearbyAction({
          text: `[E] Войти в Русскую Баню (Парилка & Ледяная Купель)`,
          action: () => onOpenBanya(),
          icon: '🧖‍♂️'
        });
        return;
      }

      // 3. 🏎️ Auto Dealership Check ((38, 25))
      const dealerDist = p.distanceTo(new THREE.Vector3(38, 0, 25));
      if (dealerDist < 16) {
        setNearbyAction({
          text: `[E] Войти в Автосалон & Тюнинг-Центр`,
          action: () => onOpenDealership(),
          icon: '🏎️'
        });
        return;
      }

      // 4. 🏢 Business Towers Check ((-45, -55))
      const bizDist = p.distanceTo(new THREE.Vector3(-45, 0, -55));
      if (bizDist < 20) {
        setNearbyAction({
          text: `[E] Открыть Управление 10 Империями`,
          action: () => onOpenBusiness(),
          icon: '🏢'
        });
        return;
      }

      // 5. 🗿 Looksmaxing Clinic ((38, -40))
      const clinicDist = p.distanceTo(new THREE.Vector3(38, 0, -40));
      if (clinicDist < 14) {
        setNearbyAction({
          text: `[E] Войти в Салон Луксмаксинга & Барбершоп`,
          action: () => onOpenLooksmax(),
          icon: '🗿'
        });
        return;
      }

      // 6. ⚽ Football Arena ((80, -50))
      const stadiumDist = p.distanceTo(new THREE.Vector3(80, 0, -50));
      if (stadiumDist < 24) {
        setNearbyAction({
          text: `[E] Войти на Футбольную Арену`,
          action: () => onOpenFootball(),
          icon: '⚽'
        });
        return;
      }

      // 7. 🍸 VIP Club ((-45, 80))
      const clubDist = p.distanceTo(new THREE.Vector3(-45, 0, 80));
      if (clubDist < 16) {
        setNearbyAction({
          text: `[E] Войти в Приватный VIP Клуб`,
          action: () => onOpenClub(),
          icon: '🍸'
        });
        return;
      }

      // No prompt active
      setNearbyAction(null);
    };

    const enterVehicle = (carIndex: number) => {
      sounds.playEngineRev();
      simRef.current.inVehicle = true;
      simRef.current.currentVehicleIndex = carIndex;
      setInVehicle(true);
      setCurrentCarName(simRef.current.vehicles[carIndex].name);
    };

    const exitVehicle = () => {
      sounds.playClick();
      const car = simRef.current.vehicles[simRef.current.currentVehicleIndex];
      simRef.current.playerPos.set(car.pos.x + 2.5, 0, car.pos.z);
      simRef.current.inVehicle = false;
      simRef.current.currentVehicleIndex = -1;
      setInVehicle(false);
      setCurrentCarName('');
      setSpeedKmh(0);
    };

    const handleInteractTrigger = () => {
      if (simRef.current.inVehicle) {
        exitVehicle();
      } else {
        // If near action, execute it
        const p = simRef.current.playerPos;
        let carIdx = -1;
        simRef.current.vehicles.forEach((v, i) => {
          if (p.distanceTo(v.pos) < 4.5) carIdx = i;
        });

        if (carIdx >= 0) {
          enterVehicle(carIdx);
          return;
        }

        if (p.distanceTo(new THREE.Vector3(-35, 0, 25)) < 14) {
          onOpenBanya();
          return;
        }
        if (p.distanceTo(new THREE.Vector3(38, 0, 25)) < 16) {
          onOpenDealership();
          return;
        }
        if (p.distanceTo(new THREE.Vector3(-45, 0, -55)) < 20) {
          onOpenBusiness();
          return;
        }
        if (p.distanceTo(new THREE.Vector3(38, 0, -40)) < 14) {
          onOpenLooksmax();
          return;
        }
        if (p.distanceTo(new THREE.Vector3(80, 0, -50)) < 24) {
          onOpenFootball();
          return;
        }
        if (p.distanceTo(new THREE.Vector3(-45, 0, 80)) < 16) {
          onOpenClub();
          return;
        }
      }
    };

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Radio toggle
  const handleToggleRadio = () => {
    sounds.playClick();
    const stations = ['Luxury Phonk FM', 'Synthwave Nights', 'Deep House Zurich', 'Off'];
    const idx = stations.indexOf(radioStation);
    const nextStation = stations[(idx + 1) % stations.length];
    setRadioStation(nextStation);
  };

  return (
    <div className="relative w-full h-[700px] md:h-[800px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-800 select-none">
      
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* GTA-Style Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        
        {/* Left: GTA Mini Radar & Compass */}
        <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-stone-700/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-xl">
          <div className="relative w-16 h-16 rounded-full border-2 border-amber-500/80 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            {/* Cardinal points */}
            <span className="absolute top-0.5 text-[8px] font-black text-amber-400">N</span>
            <span className="absolute bottom-0.5 text-[8px] font-black text-stone-500">S</span>
            <span className="absolute left-1 text-[8px] font-black text-stone-500">W</span>
            <span className="absolute right-1 text-[8px] font-black text-stone-500">E</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Loox City 3D
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-medium">
              {inVehicle ? `За рулем: ${currentCarName}` : 'Пешком (V-Taper Chad)'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-400/90 font-bold">
              <span>🗿 {looksmaxing.tier}</span>
              <span>🧖‍♂️ Сессий: {looksmaxing.banyaVisitsCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Teleport Navigation / Menu Shortcuts */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenBanya}
            className="px-3 py-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200 shadow-lg backdrop-blur transition active:scale-95 flex items-center gap-1"
          >
            <span>🧖‍♂️</span> Банный Комплекс
          </button>
          <button
            onClick={onOpenLooksmax}
            className="px-3 py-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200 shadow-lg backdrop-blur transition active:scale-95 flex items-center gap-1"
          >
            <span>🗿</span> Луксмаксинг
          </button>
          <button
            onClick={onOpenBusiness}
            className="px-3 py-1.5 bg-blue-950/90 hover:bg-blue-900 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200 shadow-lg backdrop-blur transition active:scale-95 flex items-center gap-1"
          >
            <span>🏢</span> 10 Империй
          </button>
          <button
            onClick={onOpenDealership}
            className="px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 rounded-xl text-xs font-bold text-cyan-200 shadow-lg backdrop-blur transition active:scale-95 flex items-center gap-1"
          >
            <span>🏎️</span> Автосалон
          </button>
        </div>

      </div>

      {/* Proximity Interaction Prompt (Center-Bottom) */}
      {nearbyAction && (
        <div className="absolute bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={nearbyAction.action}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-black font-extrabold text-sm md:text-base rounded-2xl shadow-2xl border-2 border-white/60 animate-bounce transition transform active:scale-95 flex items-center gap-2.5"
          >
            <span className="text-xl">{nearbyAction.icon}</span>
            <span>{nearbyAction.text}</span>
          </button>
        </div>
      )}

      {/* Speedometer & Car Controls (Active when in vehicle) */}
      {inVehicle && (
        <div className="absolute bottom-6 right-6 pointer-events-auto bg-black/85 backdrop-blur-md border border-stone-700/60 rounded-2xl p-4 text-white shadow-2xl flex flex-col items-center min-w-[170px]">
          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            СПИДОМЕТР
          </div>
          <div className="text-4xl md:text-5xl font-black font-mono text-amber-400 my-0.5 tracking-tighter">
            {speedKmh}
          </div>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            КМ / Ч
          </div>

          <div className="w-full h-1.5 bg-stone-800 rounded-full my-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all"
              style={{ width: `${Math.min(100, (speedKmh / 350) * 100)}%` }}
            />
          </div>

          {/* Nitro and Horn buttons */}
          <div className="flex items-center gap-2 mt-1 w-full">
            <button
              onMouseDown={() => { inputRef.current.boost = true; }}
              onMouseUp={() => { inputRef.current.boost = false; }}
              onTouchStart={() => { inputRef.current.boost = true; }}
              onTouchEnd={() => { inputRef.current.boost = false; }}
              className="flex-1 py-1 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-[10px] rounded-lg shadow active:scale-95 flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3 text-cyan-300" /> NOS
            </button>
            <button
              onClick={() => sounds.playCarHorn()}
              className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[10px] rounded-lg shadow active:scale-95 flex items-center justify-center gap-1"
            >
              <Volume2 className="w-3 h-3 text-amber-400" /> СИГНАЛ
            </button>
          </div>

          {/* Radio */}
          <button
            onClick={handleToggleRadio}
            className="mt-2 w-full text-[10px] text-stone-400 hover:text-amber-300 flex items-center justify-center gap-1"
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>{radioStation}</span>
          </button>
        </div>
      )}

      {/* Mobile Touch On-Screen Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-auto md:hidden">
        {/* On-screen D-Pad */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-2 rounded-2xl border border-stone-800/80">
          <div />
          <button
            onTouchStart={() => { inputRef.current.forward = true; }}
            onTouchEnd={() => { inputRef.current.forward = false; }}
            className="w-11 h-11 rounded-xl bg-stone-800/90 active:bg-amber-500 text-white active:text-black flex items-center justify-center font-bold text-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onTouchStart={() => { inputRef.current.left = true; }}
            onTouchEnd={() => { inputRef.current.left = false; }}
            className="w-11 h-11 rounded-xl bg-stone-800/90 active:bg-amber-500 text-white active:text-black flex items-center justify-center font-bold text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => { inputRef.current.backward = true; }}
            onTouchEnd={() => { inputRef.current.backward = false; }}
            className="w-11 h-11 rounded-xl bg-stone-800/90 active:bg-amber-500 text-white active:text-black flex items-center justify-center font-bold text-lg"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => { inputRef.current.right = true; }}
            onTouchEnd={() => { inputRef.current.right = false; }}
            className="w-11 h-11 rounded-xl bg-stone-800/90 active:bg-amber-500 text-white active:text-black flex items-center justify-center font-bold text-lg"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sprint / Jump Action buttons (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto md:hidden">
        <button
          onTouchStart={() => { inputRef.current.sprint = true; }}
          onTouchEnd={() => { inputRef.current.sprint = false; }}
          className="w-12 h-12 rounded-2xl bg-amber-600/90 active:bg-amber-400 text-black font-extrabold text-xs shadow-lg flex items-center justify-center"
        >
          БЕГ
        </button>
        <button
          onTouchStart={() => { inputRef.current.jump = true; }}
          onTouchEnd={() => { inputRef.current.jump = false; }}
          className="w-12 h-12 rounded-2xl bg-blue-600/90 active:bg-blue-400 text-white font-extrabold text-xs shadow-lg flex items-center justify-center"
        >
          ПРЫЖОК
        </button>
      </div>

      {/* Desktop Keyboard Hints HUD */}
      <div className="hidden md:flex absolute bottom-4 left-4 bg-black/75 backdrop-blur-md border border-stone-800 px-3 py-1.5 rounded-xl text-[11px] text-stone-300 gap-4 pointer-events-none">
        <span><strong className="text-amber-400">WASD / Стрелки:</strong> Движение</span>
        <span><strong className="text-amber-400">Shift:</strong> Спринт / Форсаж</span>
        <span><strong className="text-amber-400">Пробел:</strong> Прыжок / Дрифт</span>
        <span><strong className="text-amber-400">[E]:</strong> Взаимодействие / Сесть в авто / Баня</span>
        <span><strong className="text-amber-400">[H]:</strong> Сигнал</span>
      </div>

    </div>
  );
}
