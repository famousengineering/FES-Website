import * as THREE from "three";

/**
 * High-Fidelity Standalone Panoramic Elevator Model for FES
 * Features:
 * - Continuous high-rise observation shaft (from pit foundation to machine crown)
 * - Aerodynamic panoramic glass capsule (observation walls & underbelly)
 * - Synchronized frameless glass sliding doors with chrome frames & arrival lanterns
 * - Articulated walking passengers with animated loading/unloading between cabin & floor corridor
 * - Full-span floor landings with architectural glass balustrades & LED edge glow
 * - Counterweight system with inverse travel & multi-strand hoist cables
 * - Interactive floor dispatch & kinematic auto-travel
 */

export type LiftPhase = "dwell" | "close" | "move" | "open";

export type LiftOptions = {
  floorCount?: number;
  floorHeight?: number;
  autoTravel?: boolean;
  travelSpeed?: number;
  doorSpeed?: number;
  mobile?: boolean;
};

export type LiftState = {
  currentFloor: number;
  targetFloor: number;
  cabinY: number;
  doorAmount: number;
  phase: LiftPhase;
  moving: boolean;
  registeredCalls: number[];
};

export type StandaloneLift = {
  object: THREE.Group;
  state: LiftState;
  update: (deltaSeconds: number) => void;
  callFloor: (floor: number) => void;
  setAutoTravel: (enabled: boolean) => void;
  dispose: () => void;
};

const COLORS = {
  chrome: 0xd8e4e8,
  steel: 0x82979e,
  darkSteel: 0x1c282e,
  graphite: 0x0c1418,
  glass: 0x9ed1db,
  glassReflection: 0xc4e9f2,
  amber: 0xf0a23a,
  amberGlow: 0xffb74d,
  warmWhite: 0xffedd5,
  safetyYellow: 0xdf9d1c,
  cable: 0x64747b,
};

const BUSINESS_COLORS = [
  0x1e3a5f, // Executive Navy
  0x2b3238, // Charcoal Suit
  0x8a6e4b, // Camel / Tan Overcoat
  0x274338, // Forest Green Blazer
  0x4c2a33, // Burgundy Blazer
  0x3c4c5a, // Steel Slate Blue
  0x6e5d4f, // Warm Mocha
  0x1c242b, // Midnight Black Suit
];

const HAIR_COLORS = [
  0x14100e, // Dark espresso
  0x2c221c, // Dark brown
  0x4a3728, // Chestnut
  0x78726e, // Salt & pepper
  0x181818, // Jet black
];

const SKIN_TONES = [
  0xd8ad91,
  0xc7977b,
  0xb88265,
  0xe2be9f,
];

const addBox = (
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const addCylinder = (
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
  position: [number, number, number],
  material: THREE.Material,
  rotation?: [number, number, number]
) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
};

const makeGlass = (mobile: boolean, opacity = 0.22) => {
  if (mobile) {
    return new THREE.MeshBasicMaterial({
      color: 0xcfe8f0,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: 0xe2f4fa,
    metalness: 0.05,
    roughness: 0.04,
    transmission: 0.88,
    transparent: true,
    opacity,
    depthWrite: false,
    thickness: 0.1,
    side: THREE.DoubleSide,
  });
};

interface ArticulatedPassenger {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  status: "idle" | "exiting" | "entering";
  walkPhase: number;
  walkSpeed: number;
  spotIndex: number;
  path: Array<{ x: number; z: number; rotY: number }>;
  currentWaypoint: number;
  delayTimer: number;
  seed: number;
  clothingColor: number;
}

const CABIN_SPOTS = [
  { x: -0.42, z: 0.15 },
  { x: 0.42, z: 0.15 },
  { x: -0.28, z: -0.25 },
  { x: 0.28, z: -0.25 },
];

function createArticulatedPassenger(
  clothingColor: number,
  startX: number,
  startZ: number,
  spotIndex: number
): ArticulatedPassenger {
  const group = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: clothingColor, roughness: 0.85 });
  const darkPants = new THREE.MeshStandardMaterial({ color: 0x161c20, roughness: 0.9 });
  const shoesMat = new THREE.MeshStandardMaterial({ color: 0x0a0c0e, roughness: 0.6 });
  const skinColor = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.8,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    roughness: 0.9,
  });

  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const tieColors = [0x991b1b, 0x1e3a8a, 0xd97706, 0x0f766e, 0x701a75];
  const tieMat = new THREE.MeshStandardMaterial({
    color: tieColors[Math.floor(Math.random() * tieColors.length)],
    roughness: 0.4,
  });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });

  // 1. Torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.42, 4, 8), fabric);
  torso.position.y = 0.82;

  // Front Identification: Crisp white collared shirt + Silk necktie on the front (+Z)
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.14, 0.025), shirtMat);
  shirt.position.set(0, 0.12, 0.11);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.22, 0.025), tieMat);
  tie.position.set(0, 0.04, 0.12);
  torso.add(shirt, tie);

  // 2. Head & Facial Features (facing +Z)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), skinMat);
  head.position.y = 1.30;

  // Eyes (front +Z)
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), eyeMat);
  leftEye.position.set(-0.038, 0.015, 0.098);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), eyeMat);
  rightEye.position.set(0.038, 0.015, 0.098);

  // Eyebrows (front +Z)
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 0.012), browMat);
  leftBrow.position.set(-0.038, 0.042, 0.100);
  const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 0.012), browMat);
  rightBrow.position.set(0.038, 0.042, 0.100);

  // Nose (front +Z)
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.036, 0.032), skinMat);
  nose.position.set(0, -0.018, 0.114);

  // Mouth (front +Z)
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.012, 0.015), browMat);
  mouth.position.set(0, -0.062, 0.102);

  // Ears (sides X)
  const leftEar = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, 0.028), skinMat);
  leftEar.position.set(-0.112, -0.01, 0);
  const rightEar = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, 0.028), skinMat);
  rightEar.position.set(0.112, -0.01, 0);

  // Hair: covers top and back of head (-Z), leaving front face and forehead exposed
  const topHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.116, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat
  );
  topHair.position.set(0, 0.035, -0.015);

  const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.06), hairMat);
  backHair.position.set(0, -0.05, -0.075);

  head.add(leftEye, rightEye, leftBrow, rightBrow, nose, mouth, leftEar, rightEar, topHair, backHair);

  // 3. Articulated Left Leg (pivots at hip y = 0.55)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.065, 0.55, 0);
  const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), darkPants);
  lLegMesh.position.y = -0.26;
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.05, 0.14), shoesMat);
  lShoe.position.set(0, -0.51, 0.03);
  leftLeg.add(lLegMesh, lShoe);

  // 4. Articulated Right Leg (pivots at hip y = 0.55)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.065, 0.55, 0);
  const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), darkPants);
  rLegMesh.position.y = -0.26;
  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.05, 0.14), shoesMat);
  rShoe.position.set(0, -0.51, 0.03);
  rightLeg.add(rLegMesh, rShoe);

  // 5. Articulated Left Arm (pivots at shoulder y = 1.02)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.18, 1.02, 0);
  const lArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32, 3, 6), fabric);
  lArmMesh.position.y = -0.16;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), skinMat);
  lHand.position.y = -0.32;
  leftArm.add(lArmMesh, lHand);

  // 6. Articulated Right Arm (pivots at shoulder y = 1.02)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.18, 1.02, 0);
  const rArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32, 3, 6), fabric);
  rArmMesh.position.y = -0.16;
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), skinMat);
  rHand.position.y = -0.32;
  rightArm.add(rArmMesh, rHand);

  group.add(torso, head, leftLeg, rightLeg, leftArm, rightArm);
  group.position.set(startX, 0.08, startZ);

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    torso,
    head,
    status: "idle",
    walkPhase: Math.random() * Math.PI * 2,
    walkSpeed: 1.15,
    spotIndex,
    path: [],
    currentWaypoint: 0,
    delayTimer: 0,
    seed: Math.random() * Math.PI * 2,
    clothingColor,
  };
}

export function createLiftModel(options: LiftOptions = {}): StandaloneLift {
  const floorCount = options.floorCount ?? 6;
  const floorHeight = options.floorHeight ?? 2.85;
  const travelSpeed = options.travelSpeed ?? 3.6;
  const doorSpeed = options.doorSpeed ?? 0.52;
  const mobile = options.mobile ?? false;

  const shaftWidth = 4.2;
  const shaftDepth = 3.2;
  const cabinWidth = 2.5;
  const cabinDepth = 1.95;
  const cabinHeight = 2.65;

  const hw = shaftWidth / 2;
  const hd = shaftDepth / 2;

  // Key vertical reference points
  const pitY = -1.8;
  const maxTravel = (floorCount - 1) * floorHeight;
  const overheadY = maxTravel + cabinHeight + 1.8;
  const slabY = overheadY - 0.15; // Top surface of machine room floor slab
  const mrSlabThick = 0.38;
  const roofY = slabY + mrSlabThick / 2 + 2.65; // Penthouse canopy roof slab
  const roofTopY = roofY + 0.11; // Absolute peak of the elevator structure

  // Shaft corner structural columns run cleanly from pit bottom up to penthouse roof top
  const colBottomY = pitY - 0.20;
  const colTopY = roofTopY;
  const colSpan = colTopY - colBottomY;
  const midY = (colTopY + colBottomY) / 2;

  const root = new THREE.Group();
  root.name = "RealisticPanoramicLift";

  // High-grade materials
  const chrome = new THREE.MeshStandardMaterial({ color: COLORS.chrome, metalness: 0.95, roughness: 0.12 });
  const steel = new THREE.MeshStandardMaterial({ color: COLORS.steel, metalness: 0.88, roughness: 0.25 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: COLORS.darkSteel, metalness: 0.85, roughness: 0.35 });
  const graphite = new THREE.MeshStandardMaterial({ color: COLORS.graphite, metalness: 0.45, roughness: 0.65 });
  const amberMat = new THREE.MeshStandardMaterial({
    color: COLORS.amber,
    emissive: COLORS.amberGlow,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });
  const warmMat = new THREE.MeshStandardMaterial({
    color: COLORS.warmWhite,
    emissive: COLORS.warmWhite,
    emissiveIntensity: 1.2,
    roughness: 0.3,
  });
  const yellowMat = new THREE.MeshStandardMaterial({ color: COLORS.safetyYellow, roughness: 0.6 });
  const cableMat = new THREE.MeshStandardMaterial({ color: COLORS.cable, metalness: 0.9, roughness: 0.35 });
  const glass = makeGlass(mobile, 0.32);
  const tintedGlass = makeGlass(mobile, 0.22);
  const doorGlass = makeGlass(mobile, 0.45);

  // Dynamic Arrival Lantern Material (illuminates brightly when doors open)
  const arrivalLanternMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xffb74d,
    emissiveIntensity: 0.3,
    roughness: 0.2,
  });

  // Dynamic Sill Glow Material
  const sillGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xffa834,
    emissiveIntensity: 0.3,
    roughness: 0.3,
  });

  // Shopping Mall Multi-Level Architectural Materials (matching real luxury mall atriums)
  const floorMarbleMat = new THREE.MeshStandardMaterial({
    color: 0x3a4b56, // Rich dark-slate architectural marble concourse (seamlessly matches corporate dark navy background)
    roughness: 0.22,
    metalness: 0.2,
  });
  const floorInlayMat = new THREE.MeshStandardMaterial({
    color: 0x16222a, // Contrast polished deep obsidian runner aisle
    roughness: 0.20,
    metalness: 0.35,
  });
  const floorFasciaMat = new THREE.MeshStandardMaterial({
    color: 0x546673, // Brushed architectural stainless/graphite slab edge fascia
    roughness: 0.25,
    metalness: 0.85,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x2b3842, // Reinforced architectural concrete
    roughness: 0.75,
    metalness: 0.2,
  });
  const machineSlabMat = new THREE.MeshStandardMaterial({
    color: 0x24323c, // Heavy reinforced machine room floor slab
    roughness: 0.65,
    metalness: 0.3,
  });
  const bufferYellowMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // High-visibility polyurethane safety yellow
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    roughness: 0.35,
    metalness: 0.2,
  });
  const bufferRubberMat = new THREE.MeshStandardMaterial({
    color: 0x141a1e, // Vulcanized black buffer strike cap
    roughness: 0.85,
    metalness: 0.1,
  });
  const floorGroundPlazaMat = new THREE.MeshStandardMaterial({
    color: 0x0f1920, // Luxury dark polished granite/marble plaza floor (matches dusk atrium theme)
    roughness: 0.16,
    metalness: 0.35,
  });
  const ceilingSoffitMat = new THREE.MeshStandardMaterial({
    color: 0x0c141a, // Finished dark graphite architectural ceiling soffit
    roughness: 0.6,
    metalness: 0.2,
  });
  const columnStoneMat = new THREE.MeshStandardMaterial({
    color: 0x2e3d47, // Stately graphite limestone pillars
    roughness: 0.3,
    metalness: 0.3,
  });
  const shopGlassMat = makeGlass(mobile, 0.45);
  const shopBacklitMat = new THREE.MeshStandardMaterial({
    color: 0xfff7ed,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.65,
    roughness: 0.4,
  });
  const shopSignMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  const railingHandrailMat = new THREE.MeshStandardMaterial({
    color: 0xd8e4e8,
    metalness: 0.95,
    roughness: 0.1,
  });
  const railingGlassMat = makeGlass(mobile, 0.24);
  const floorLedGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffb74d,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const floorTransomMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.8,
  });
  const callButtonGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.8,
  });

  // ==========================================
  // 1. CONTINUOUS VERTICAL SHAFT STRUCTURE
  // ==========================================
  const shaft = new THREE.Group();
  shaft.name = "ShaftStructure";
  root.add(shaft);

  // 4 Massive corner architectural columns running continuously
  const colThickness = 0.18;
  [
    [-hw, -hd],
    [hw, -hd],
    [-hw, hd],
    [hw, hd],
  ].forEach(([x, z]) => {
    addBox(shaft, [colThickness, colSpan, colThickness], [x, midY, z], darkSteel);
    // Metallic chrome edge accents
    addBox(shaft, [0.04, colSpan, 0.04], [x + Math.sign(x) * 0.07, midY, z + Math.sign(z) * 0.07], chrome);
  });

  // Dual Machined T-Guide Rails for Cabin (left and right sides - terminating under machine room slab)
  const railBottomY = pitY + 0.10;
  const railTopY = slabY - mrSlabThick / 2;
  const railSpan = railTopY - railBottomY;
  const railMidY = (railTopY + railBottomY) / 2;

  const railX = hw - 0.22;
  [-railX, railX].forEach((x) => {
    addBox(shaft, [0.06, railSpan, 0.12], [x, railMidY, 0], steel);
    addBox(shaft, [0.03, railSpan, 0.07], [x + (x > 0 ? -0.04 : 0.04), railMidY, 0], chrome);
  });

  // Right Side Counterweight Guide Rails (running along counterweight track)
  const cwtX = hw - 0.42;
  [-0.45, 0.45].forEach((z) => {
    addBox(shaft, [0.06, railSpan, 0.04], [cwtX, railMidY, z], steel);
    addBox(shaft, [0.03, railSpan, 0.02], [cwtX - 0.03, railMidY, z], chrome);
  });

  // ==========================================
  // 2. BOTTOM PIT & FOUNDATION BASE (BUFFERS & PIT WELL)
  // ==========================================
  const pit = new THREE.Group();
  pit.name = "PitFoundation";
  shaft.add(pit);

  // Reinforced Concrete Pit Foundation Well
  const pitWidth = shaftWidth + 1.2;
  const pitDepth = shaftDepth + 1.2;
  // Sub-foundation concrete slab
  addBox(pit, [pitWidth + 0.4, 0.40, pitDepth + 0.4], [0, pitY - 0.20, 0], concreteMat);
  // Pit floor finish (oiled waterproof slab)
  addBox(pit, [pitWidth, 0.04, pitDepth], [0, pitY + 0.02, 0], graphite);

  // Concrete Pit Retaining Walls (4-sided fully enclosed pit well below Ground level y = pitY to 0)
  const pitWallH = Math.abs(pitY);
  const pitWallY = pitY + pitWallH / 2;
  // 1. Left pit wall
  addBox(pit, [0.20, pitWallH, pitDepth], [-hw - 0.45, pitWallY, 0], concreteMat);
  addBox(pit, [0.04, pitWallH, pitDepth], [-hw - 0.33, pitWallY, 0], darkSteel);
  // 2. Right pit wall
  addBox(pit, [0.20, pitWallH, pitDepth], [hw + 0.45, pitWallY, 0], concreteMat);
  addBox(pit, [0.04, pitWallH, pitDepth], [hw + 0.33, pitWallY, 0], darkSteel);
  // 3. Rear pit wall
  addBox(pit, [pitWidth, pitWallH, 0.20], [0, pitWallY, -hd - 0.45], concreteMat);
  addBox(pit, [pitWidth, pitWallH, 0.04], [0, pitWallY, -hd - 0.33], darkSteel);
  // 4. FRONT PIT WALL (Fully enclosing front side with observation tempered safety glass & concrete base curb)
  const frontPitZ = hd + 0.45;
  const frontCurbH = 0.40;
  // Front concrete base curb
  addBox(pit, [pitWidth, frontCurbH, 0.18], [0, pitY + frontCurbH / 2, frontPitZ], concreteMat);
  addBox(pit, [pitWidth, frontCurbH, 0.04], [0, pitY + frontCurbH / 2, frontPitZ - 0.08], darkSteel);
  // Observation tempered safety glass so buffers inside pit remain clearly visible
  const frontGlassH = pitWallH - frontCurbH;
  const frontGlassY = pitY + frontCurbH + frontGlassH / 2;
  addBox(pit, [pitWidth - 0.1, frontGlassH, 0.03], [0, frontGlassY, frontPitZ], tintedGlass);
  // Structural corner columns & vertical stainless steel mullions
  [-hw - 0.45, hw + 0.45].forEach((mx) => {
    addBox(pit, [0.12, pitWallH, 0.12], [mx, pitWallY, frontPitZ], darkSteel);
    addBox(pit, [0.04, pitWallH, 0.04], [mx, pitWallY, frontPitZ + 0.04], chrome);
  });
  [-0.9, 0.9].forEach((mx) => {
    addBox(pit, [0.04, frontGlassH, 0.06], [mx, frontGlassY, frontPitZ], chrome);
  });
  // Ground floor stainless steel apron coping threshold at y = 0
  addBox(pit, [pitWidth + 0.1, 0.06, 0.22], [0, 0.01, frontPitZ], chrome);
  addBox(pit, [pitWidth, 0.02, 0.06], [0, 0.03, frontPitZ], floorFasciaMat);

  // Safety Yellow Kick-Plate Curb around interior bottom pit perimeter
  const curbThick = 0.04;
  const curbH = 0.08;
  const curbY = pitY + curbH / 2;
  addBox(pit, [pitWidth - 0.1, curbH, curbThick], [0, curbY, frontPitZ - 0.12], yellowMat);
  addBox(pit, [pitWidth - 0.1, curbH, curbThick], [0, curbY, -hd - 0.30], yellowMat);
  addBox(pit, [curbThick, curbH, pitDepth - 0.1], [-hw - 0.30, curbY, 0], yellowMat);
  addBox(pit, [curbThick, curbH, pitDepth - 0.1], [hw + 0.30, curbY, 0], yellowMat);

  // Pit Access Safety Ladder on Left Wall (EN 81-20 safety standard)
  const ladderX = -hw + 0.18;
  const ladderZ = -hd + 0.22;
  addBox(pit, [0.03, pitWallH + 0.6, 0.05], [ladderX - 0.16, pitWallY + 0.3, ladderZ], yellowMat);
  addBox(pit, [0.03, pitWallH + 0.6, 0.05], [ladderX + 0.16, pitWallY + 0.3, ladderZ], yellowMat);
  for (let rY = pitY + 0.3; rY <= 0.6; rY += 0.3) {
    addCylinder(pit, 0.015, 0.015, 0.32, 10, [ladderX, rY, ladderZ], chrome, [0, 0, Math.PI / 2]);
  }

  // Pit Emergency Stop Switch & Inspection Light
  const pitEstop = addBox(pit, [0.10, 0.16, 0.08], [-hw + 0.05, pitY + 0.95, -0.4], yellowMat);
  addCylinder(pitEstop, 0.03, 0.03, 0.04, 12, [0.04, 0.02, 0], new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }), [0, 0, Math.PI / 2]);
  addBox(pit, [0.08, 0.18, 0.10], [-hw + 0.05, pitY + 1.25, 0.4], darkSteel);
  addBox(pit, [0.05, 0.14, 0.07], [-hw + 0.09, pitY + 1.25, 0.4], warmMat);

  // ------------------------------------------------------------------
  // 1. CABIN BUFFER (Directly centered under cabin: x = 0, z = 0)
  // ------------------------------------------------------------------
  const carBufferGroup = new THREE.Group();
  carBufferGroup.position.set(0, pitY, 0);
  pit.add(carBufferGroup);

  // Heavy steel baseplate bolted to concrete pit floor
  addBox(carBufferGroup, [0.68, 0.08, 0.68], [0, 0.04, 0], darkSteel);
  // 4 Heavy anchor bolts at corners
  [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(([bx, bz]) => {
    addCylinder(carBufferGroup, 0.022, 0.022, 0.08, 8, [bx, 0.10, bz], chrome);
    addCylinder(carBufferGroup, 0.032, 0.032, 0.03, 6, [bx, 0.09, bz], steel);
  });
  // Welded structural steel buffer pedestal stool with stiffener ribs
  addBox(carBufferGroup, [0.52, 0.32, 0.52], [0, 0.24, 0], steel);
  [-0.27, 0.27].forEach((gx) => {
    addBox(carBufferGroup, [0.03, 0.24, 0.36], [gx, 0.20, 0], darkSteel);
  });
  [-0.27, 0.27].forEach((gz) => {
    addBox(carBufferGroup, [0.36, 0.24, 0.03], [0, 0.20, gz], darkSteel);
  });
  // Heavy buffer outer cylinder barrel (safety polyurethane yellow)
  addCylinder(carBufferGroup, 0.22, 0.24, 0.52, 20, [0, 0.66, 0], bufferYellowMat);
  // Hydraulic seal gland ring
  addCylinder(carBufferGroup, 0.25, 0.25, 0.08, 20, [0, 0.94, 0], darkSteel);
  // Ground and polished telescopic chrome piston rod / ram
  addCylinder(carBufferGroup, 0.14, 0.14, 0.44, 20, [0, 1.18, 0], chrome);
  // Polyurethane energy-absorbing impact cap / buffer head
  addCylinder(carBufferGroup, 0.22, 0.18, 0.16, 20, [0, 1.44, 0], bufferYellowMat);
  // Tough vulcanized black rubber impact strike pad on top
  addCylinder(carBufferGroup, 0.21, 0.21, 0.05, 20, [0, 1.54, 0], bufferRubberMat);
  // Buffer electrical limit safety switch with conduit
  addBox(carBufferGroup, [0.08, 0.14, 0.09], [0.28, 0.68, 0], darkSteel);
  addCylinder(carBufferGroup, 0.015, 0.015, 0.55, 8, [0.26, 0.38, 0], chrome);

  // ------------------------------------------------------------------
  // 2. COUNTERWEIGHT BUFFER (Directly centered under counterweight: x = cwtX, z = 0)
  // ------------------------------------------------------------------
  const cwtBufferGroup = new THREE.Group();
  cwtBufferGroup.position.set(cwtX, pitY, 0);
  pit.add(cwtBufferGroup);

  // Heavy steel baseplate bolted to concrete pit floor
  addBox(cwtBufferGroup, [0.48, 0.08, 0.48], [0, 0.04, 0], darkSteel);
  // 4 Anchor bolts
  [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([bx, bz]) => {
    addCylinder(cwtBufferGroup, 0.018, 0.018, 0.08, 8, [bx, 0.10, bz], chrome);
    addCylinder(cwtBufferGroup, 0.026, 0.026, 0.03, 6, [bx, 0.09, bz], steel);
  });
  // Welded structural steel pedestal stool
  addBox(cwtBufferGroup, [0.38, 0.32, 0.38], [0, 0.24, 0], steel);
  [-0.20, 0.20].forEach((gx) => {
    addBox(cwtBufferGroup, [0.025, 0.22, 0.26], [gx, 0.19, 0], darkSteel);
  });
  // Buffer hydraulic cylinder barrel in safety yellow
  addCylinder(cwtBufferGroup, 0.17, 0.19, 0.50, 18, [0, 0.65, 0], bufferYellowMat);
  // Hydraulic seal gland collar
  addCylinder(cwtBufferGroup, 0.19, 0.19, 0.07, 18, [0, 0.92, 0], darkSteel);
  // Telescopic chrome piston rod
  addCylinder(cwtBufferGroup, 0.10, 0.10, 0.42, 18, [0, 1.14, 0], chrome);
  // Polyurethane impact head
  addCylinder(cwtBufferGroup, 0.17, 0.14, 0.15, 18, [0, 1.39, 0], bufferYellowMat);
  // Vulcanized black rubber strike pad on top
  addCylinder(cwtBufferGroup, 0.16, 0.16, 0.04, 18, [0, 1.48, 0], bufferRubberMat);
  // Buffer safety switch
  addBox(cwtBufferGroup, [0.07, 0.12, 0.08], [0.21, 0.65, 0], darkSteel);
  addCylinder(cwtBufferGroup, 0.012, 0.012, 0.52, 8, [0.20, 0.36, 0], chrome);

  // ==========================================
  // 3. TOP OVERHEAD MACHINE ROOM SLAB & HOISTING MOTOR
  // ==========================================
  const crown = new THREE.Group();
  crown.name = "MachineRoomAndCrown";
  shaft.add(crown);

  const mrWidth = shaftWidth + 1.8; // 6.0m wide reinforced machine room floor slab
  const mrDepth = shaftDepth + 2.2; // 5.4m deep expansive slab

  // 1. HEAVY REINFORCED CONCRETE MACHINE ROOM FLOOR SLAB
  addBox(crown, [mrWidth, mrSlabThick, mrDepth], [0, slabY, -0.3], machineSlabMat);
  // Architectural brushed steel slab edge perimeter fascia
  addBox(crown, [mrWidth + 0.08, mrSlabThick + 0.04, mrDepth + 0.08], [0, slabY, -0.3], floorFasciaMat);
  // Finished dark ceiling soffit underneath facing hoistway
  addBox(crown, [shaftWidth + 0.4, 0.02, shaftDepth + 0.4], [0, slabY - mrSlabThick / 2 - 0.01, 0], ceilingSoffitMat);

  // Underside Hoistway Ceiling Maintenance Luminaire
  addBox(crown, [0.22, 0.06, 0.32], [0, slabY - mrSlabThick / 2 - 0.04, 0.6], darkSteel);
  addBox(crown, [0.18, 0.03, 0.28], [0, slabY - mrSlabThick / 2 - 0.06, 0.6], warmMat);

  // 2. PRECISION ROPE CUTOUTS & SAFETY KICK-CURBS (TOE-BOARDS)
  // Car cable slot with safety yellow kick-plate curb
  addBox(crown, [1.35, 0.14, 0.42], [0, slabY + mrSlabThick / 2 + 0.07, 0], yellowMat);
  addBox(crown, [1.25, 0.16, 0.32], [0, slabY + mrSlabThick / 2 + 0.07, 0], graphite);
  // Counterweight cable slot with safety yellow kick-plate curb
  addBox(crown, [0.46, 0.14, 0.65], [cwtX, slabY + mrSlabThick / 2 + 0.07, 0], yellowMat);
  addBox(crown, [0.38, 0.16, 0.55], [cwtX, slabY + mrSlabThick / 2 + 0.07, 0], graphite);

  // 3. STRUCTURAL STEEL MACHINE BEDPLATE BEAMS (Heavy I-Beams / RSJs)
  const bedplateY = slabY + mrSlabThick / 2 + 0.16;
  const beamLength = 3.6;
  [-0.78, 0.78].forEach((bx) => {
    addBox(crown, [0.22, 0.04, beamLength], [bx, bedplateY - 0.12, -0.2], darkSteel);
    addBox(crown, [0.04, 0.24, beamLength], [bx, bedplateY, -0.2], steel);
    addBox(crown, [0.22, 0.04, beamLength], [bx, bedplateY + 0.12, -0.2], darkSteel);
    addBox(crown, [0.28, 0.05, 0.32], [bx, slabY + mrSlabThick / 2 + 0.025, -1.4], graphite);
    addBox(crown, [0.28, 0.05, 0.32], [bx, slabY + mrSlabThick / 2 + 0.025, 1.0], graphite);
  });
  addBox(crown, [1.4, 0.18, 0.18], [0, bedplateY + 0.04, -1.2], steel);
  addBox(crown, [1.4, 0.18, 0.18], [0, bedplateY + 0.04, 0.8], steel);

  // 4. GEARLESS PMSM TRACTION MACHINE (Permanent Magnet Synchronous Motor)
  const motorY = bedplateY + 0.44;
  const motorGroup = new THREE.Group();
  motorGroup.position.set(0, motorY, -0.2);
  crown.add(motorGroup);

  // Cast motor stator body with radial cooling fins
  addCylinder(motorGroup, 0.44, 0.44, 0.88, 24, [0, 0, 0], darkSteel, [0, 0, Math.PI / 2]);
  for (let f = -0.38; f <= 0.38; f += 0.08) {
    addCylinder(motorGroup, 0.46, 0.46, 0.02, 24, [f, 0, 0], steel, [0, 0, Math.PI / 2]);
  }
  // Twin electro-mechanical disc brakes with chrome manual release levers
  [-0.48, 0.48].forEach((bx) => {
    addCylinder(motorGroup, 0.40, 0.40, 0.08, 20, [bx, 0, 0], graphite, [0, 0, Math.PI / 2]);
    addBox(motorGroup, [0.08, 0.32, 0.12], [bx, 0.32, 0], darkSteel);
    addCylinder(motorGroup, 0.018, 0.018, 0.38, 10, [bx, 0.52, 0], chrome, [0.2, 0, 0]);
  });

  // Dual Traction Drive Sheaves
  const sheaveGroup = new THREE.Group();
  sheaveGroup.position.set(0, motorY, 0);
  crown.add(sheaveGroup);

  const sheaveL = addCylinder(sheaveGroup, 0.48, 0.48, 0.15, 24, [-0.5, 0, 0], chrome, [0, 0, Math.PI / 2]);
  const sheaveR = addCylinder(sheaveGroup, 0.48, 0.48, 0.15, 24, [0.5, 0, 0], chrome, [0, 0, Math.PI / 2]);
  addCylinder(sheaveL, 0.20, 0.20, 0.18, 16, [0, 0, 0], amberMat);
  addCylinder(sheaveR, 0.20, 0.20, 0.18, 16, [0, 0, 0], amberMat);
  addBox(sheaveGroup, [1.3, 0.04, 0.52], [0, 0.52, 0], yellowMat);

  // Deflector Sheaves for counterweight alignment
  addCylinder(crown, 0.34, 0.34, 0.14, 18, [-0.5, motorY - 0.42, -hd + 0.35], steel, [0, 0, Math.PI / 2]);
  addCylinder(crown, 0.34, 0.34, 0.14, 18, [0.5, motorY - 0.42, -hd + 0.35], steel, [0, 0, Math.PI / 2]);

  // 5. CENTRIFUGAL OVERSPEED GOVERNOR ASSEMBLY
  const govGroup = new THREE.Group();
  govGroup.position.set(-hw + 0.65, slabY + mrSlabThick / 2, 0.7);
  crown.add(govGroup);
  addBox(govGroup, [0.28, 0.42, 0.28], [0, 0.21, 0], darkSteel);
  addCylinder(govGroup, 0.24, 0.24, 0.05, 20, [0, 0.48, 0], steel, [0, 0, Math.PI / 2]);
  addCylinder(govGroup, 0.08, 0.08, 0.08, 16, [0, 0.48, 0], amberMat, [0, 0, Math.PI / 2]);
  addBox(govGroup, [0.06, 0.12, 0.04], [0, 0.56, 0.10], amberMat);
  addBox(govGroup, [0.06, 0.12, 0.04], [0, 0.40, -0.10], amberMat);

  // 6. MICROPROCESSOR ELEVATOR CONTROLLER CABINET (VVVF Inverter Drive)
  const ctrlGroup = new THREE.Group();
  ctrlGroup.position.set(-1.9, slabY + mrSlabThick / 2 + 0.88, -hd - 0.2);
  crown.add(ctrlGroup);
  addBox(ctrlGroup, [0.85, 1.76, 0.44], [0, 0, 0], darkSteel);
  addBox(ctrlGroup, [0.80, 1.70, 0.03], [0, 0, 0.23], steel);
  addCylinder(ctrlGroup, 0.015, 0.015, 0.16, 8, [0.34, -0.05, 0.26], chrome);
  for (let l = 0.55; l <= 0.75; l += 0.05) {
    addBox(ctrlGroup, [0.65, 0.02, 0.015], [0, l, 0.25], darkSteel);
  }
  addBox(ctrlGroup, [0.22, 0.12, 0.02], [0, 0.32, 0.25], yellowMat);
  addBox(ctrlGroup, [0.42, 0.14, 0.02], [0, 0.12, 0.25], graphite);
  addCylinder(ctrlGroup, 0.014, 0.014, 0.02, 10, [-0.14, 0.12, 0.26], new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 2.5 }), [Math.PI / 2, 0, 0]);
  addCylinder(ctrlGroup, 0.014, 0.014, 0.02, 10, [-0.07, 0.12, 0.26], new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.5 }), [Math.PI / 2, 0, 0]);
  addCylinder(ctrlGroup, 0.014, 0.014, 0.02, 10, [0, 0.12, 0.26], amberMat, [Math.PI / 2, 0, 0]);
  addCylinder(ctrlGroup, 0.014, 0.014, 0.02, 10, [0.07, 0.12, 0.26], warmMat, [Math.PI / 2, 0, 0]);

  // 7. MACHINE ROOM PERIMETER SAFETY BALUSTRADE & PENTHOUSE CANOPY
  const mrRailH = 1.05;
  const mrRailY = slabY + mrSlabThick / 2 + mrRailH / 2;
  addBox(crown, [mrWidth - 0.2, 0.05, 0.05], [0, slabY + mrSlabThick / 2 + mrRailH, -mrDepth / 2 + 0.1], chrome);
  addBox(crown, [mrWidth - 0.2, 0.05, 0.05], [0, slabY + mrSlabThick / 2 + mrRailH, mrDepth / 2 - 0.7], chrome);
  addBox(crown, [mrWidth - 0.2, 0.03, 0.03], [0, slabY + mrSlabThick / 2 + mrRailH * 0.5, -mrDepth / 2 + 0.1], chrome);
  addBox(crown, [mrWidth - 0.2, 0.03, 0.03], [0, slabY + mrSlabThick / 2 + mrRailH * 0.5, mrDepth / 2 - 0.7], chrome);

  [-mrWidth / 2 + 0.1, mrWidth / 2 - 0.1].forEach((px) => {
    addBox(crown, [0.05, 0.05, mrDepth - 0.8], [px, slabY + mrSlabThick / 2 + mrRailH, -0.3], chrome);
    addBox(crown, [0.03, 0.03, mrDepth - 0.8], [px, slabY + mrSlabThick / 2 + mrRailH * 0.5, -0.3], chrome);
    for (let pz = -mrDepth / 2 + 0.1; pz <= mrDepth / 2 - 0.7; pz += 1.2) {
      addCylinder(crown, 0.025, 0.025, mrRailH, 10, [px, mrRailY, pz], chrome);
    }
  });

  // Machine Room Penthouse Ceiling Canopy Roof Slab (Absolute peak / crown of the elevator structure)
  addBox(crown, [mrWidth + 0.4, 0.22, mrDepth + 0.4], [0, roofY, -0.3], machineSlabMat);
  addBox(crown, [mrWidth + 0.46, 0.24, mrDepth + 0.46], [0, roofY, -0.3], floorFasciaMat);
  [-1.6, 0, 1.6].forEach((dlx) => {
    [-1.2, 0.6].forEach((dlz) => {
      addCylinder(crown, 0.12, 0.12, 0.03, 14, [dlx, roofY - 0.11, dlz], chrome);
      addCylinder(crown, 0.09, 0.09, 0.04, 14, [dlx, roofY - 0.12, dlz], warmMat);
    });
  });

  // Penthouse structural corner steel posts connecting slab to roof canopy
  [
    [-mrWidth / 2 + 0.15, -mrDepth / 2 + 0.15],
    [mrWidth / 2 - 0.15, -mrDepth / 2 + 0.15],
    [-mrWidth / 2 + 0.15, mrDepth / 2 - 0.75],
    [mrWidth / 2 - 0.15, mrDepth / 2 - 0.75],
  ].forEach(([px, pz]) => {
    const postH = roofY - slabY;
    const postY = (roofY + slabY) / 2;
    addBox(crown, [0.12, postH, 0.12], [px, postY, pz - 0.3], darkSteel);
    addBox(crown, [0.04, postH, 0.04], [px, postY, pz - 0.3], chrome);
  });

  // Rooftop Aviation Obstruction Red Beacon on top of Penthouse crown
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, roofY + 0.11, -0.3);
  crown.add(beaconGroup);
  addCylinder(beaconGroup, 0.08, 0.10, 0.18, 12, [0, 0.09, 0], darkSteel);
  addCylinder(beaconGroup, 0.07, 0.07, 0.20, 12, [0, 0.28, 0], new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 2.8,
    roughness: 0.2,
  }));
  // Slim lightning rod finial
  addCylinder(beaconGroup, 0.012, 0.012, 0.65, 8, [0, 0.68, 0], chrome);

  // ==========================================
  // 4. SHOPPING MALL MULTI-LEVEL ATRIUM ARCHITECTURE
  // ==========================================
  const floorsGroup = new THREE.Group();
  floorsGroup.name = "FloorLandings";
  shaft.add(floorsGroup);

  // Array to dynamically illuminate 3D Hall Call buttons when a floor call is held
  const floorLopMats: { floor: number; mat: THREE.MeshStandardMaterial }[] = [];

  // Grand Cylindrical Architectural Columns (Pillars supporting the shopping mall concourse up to machine room)
  const pillarX = 4.6;
  const pillarZ = -5.8;
  const pillarBottomY = pitY;
  const pillarTopY = slabY;
  const pillarSpan = pillarTopY - pillarBottomY;
  const pillarMidY = (pillarTopY + pillarBottomY) / 2;
  [-pillarX, pillarX].forEach((px) => {
    // Continuous multi-storey limestone column
    addCylinder(floorsGroup, 0.30, 0.30, pillarSpan, 24, [px, pillarMidY, pillarZ], columnStoneMat);
    // Metallic chrome base and top accents
    addCylinder(floorsGroup, 0.36, 0.40, 0.6, 24, [px, pillarBottomY + 0.3, pillarZ], chrome);
    addCylinder(floorsGroup, 0.40, 0.36, 0.6, 24, [px, pillarTopY - 0.3, pillarZ], chrome);
  });

  // Vast Grand Plaza Floor at Ground Level (Level G - shopping mall main lobby)
  const groundPlazaWidth = 15.0;
  const groundPlazaDepth = 15.0;
  // Vast ground dark marble slab spanning under and far behind the elevator
  addBox(floorsGroup, [groundPlazaWidth, 0.30, groundPlazaDepth], [0, -0.15, -4.5], floorGroundPlazaMat);
  // Elegant polished granite runner aisle across the ground plaza
  addBox(floorsGroup, [3.8, 0.015, 8.0], [0, 0.008, -4.5], floorInlayMat);
  // Ground entrance threshold sill directly at elevator entrance
  addBox(floorsGroup, [2.4, 0.035, 0.20], [0, 0.02, -hd - 0.09], chrome);
  addBox(floorsGroup, [2.0, 0.01, 0.04], [0, 0.04, -hd - 0.09], sillGlowMat);

  // Ground lobby architectural low planter curbs
  [-6.2, 6.2].forEach((lx) => {
    addBox(floorsGroup, [0.35, 0.45, 10.0], [lx, 0.22, -4.5], floorFasciaMat);
    addBox(floorsGroup, [0.28, 0.10, 9.8], [lx, 0.45, -4.5], darkSteel);
  });

  for (let i = 0; i < floorCount; i += 1) {
    const y = i * floorHeight;

    // Structural tie beams connecting columns & elevator shaft at each floor level
    addBox(floorsGroup, [shaftWidth + 0.2, 0.12, 0.12], [0, y - 0.06, -hd], darkSteel);
    addBox(floorsGroup, [shaftWidth + 0.2, 0.12, 0.12], [0, y - 0.06, hd], darkSteel);
    addBox(floorsGroup, [0.12, 0.12, shaftDepth], [-hw, y - 0.06, 0], darkSteel);
    addBox(floorsGroup, [0.12, 0.12, shaftDepth], [hw, y - 0.06, 0], darkSteel);

    // Cantilever steel bracket arms linking elevator shaft to the building concourse slab
    [-hw + 0.2, hw - 0.2].forEach((bx) => {
      addBox(floorsGroup, [0.10, 0.16, 0.8], [bx, y - 0.12, -hd - 0.4], darkSteel);
      addBox(floorsGroup, [0.12, 0.04, 0.8], [bx, y - 0.04, -hd - 0.4], chrome);
    });

    // Stately column capital collar at each floor intersection
    [-pillarX, pillarX].forEach((px) => {
      addCylinder(floorsGroup, 0.34, 0.34, 0.16, 24, [px, y - 0.08, pillarZ], chrome);
    });

    // ----------------------------------------------------
    // UPPER MEZZANINE MALL FLOORS (Levels 1 to 5)
    // ----------------------------------------------------
    if (i > 0) {
      const concourseWidth = 13.6; // 13.6m wide expansive shopping mall promenade
      const concourseDepth = 7.5;  // 7.5m deep corridor extending into the mall
      const platformZ = -hd - concourseDepth / 2; // centered at z = -5.35m

      // 1. Structural reinforced mezzanine concrete slab with brushed metallic fascia edge
      addBox(floorsGroup, [concourseWidth, 0.28, concourseDepth], [0, y - 0.14, platformZ], floorFasciaMat);

      // 2. Polished Italian light marble promenade walking surface
      addBox(floorsGroup, [concourseWidth - 0.08, 0.02, concourseDepth - 0.08], [0, y + 0.01, platformZ], floorMarbleMat);

      // 3. Contrasting polished dark granite runner aisle from elevator door into mall
      addBox(floorsGroup, [2.6, 0.022, concourseDepth - 0.10], [0, y + 0.012, platformZ], floorInlayMat);

      // 4. Underside architectural finished ceiling soffit
      addBox(floorsGroup, [concourseWidth - 0.10, 0.02, concourseDepth - 0.10], [0, y - 0.27, platformZ], ceilingSoffitMat);

      // 5. Warm golden architectural LED under-glow along the mezzanine front edge facing the atrium
      addBox(floorsGroup, [concourseWidth, 0.025, 0.03], [0, y - 0.02, -hd - 0.02], floorLedGlowMat);

      // 6. CONTINUOUS ATRIUM SAFETY BALUSTRADES (Glass Railings with polished chrome handrail)
      // Facing the atrium void along z = -hd - 0.03m, on left and right of elevator entrance:
      const leftRailLen = concourseWidth / 2 - 1.55; // from x = -6.8 to -1.55 (length 5.25m)
      const leftRailX = -concourseWidth / 2 + leftRailLen / 2;
      const rightRailLen = leftRailLen;
      const rightRailX = concourseWidth / 2 - rightRailLen / 2;
      const railZ = -hd - 0.03;

      // Left glass balustrade section
      addBox(floorsGroup, [leftRailLen - 0.05, 0.94, 0.02], [leftRailX, y + 0.48, railZ], railingGlassMat);
      addBox(floorsGroup, [leftRailLen, 0.06, 0.06], [leftRailX, y + 0.98, railZ], railingHandrailMat); // Chrome top handrail
      addBox(floorsGroup, [leftRailLen, 0.08, 0.04], [leftRailX, y + 0.04, railZ], floorFasciaMat); // Base shoe channel
      // Left vertical stainless posts
      [-2.0, -1.0, 0, 1.0, 2.0].forEach((postOff) => {
        if (Math.abs(leftRailX + postOff) < concourseWidth / 2) {
          addCylinder(floorsGroup, 0.024, 0.024, 0.96, 12, [leftRailX + postOff, y + 0.48, railZ], chrome);
        }
      });

      // Right glass balustrade section
      addBox(floorsGroup, [rightRailLen - 0.05, 0.94, 0.02], [rightRailX, y + 0.48, railZ], railingGlassMat);
      addBox(floorsGroup, [rightRailLen, 0.06, 0.06], [rightRailX, y + 0.98, railZ], railingHandrailMat); // Chrome top handrail
      addBox(floorsGroup, [rightRailLen, 0.08, 0.04], [rightRailX, y + 0.04, railZ], floorFasciaMat); // Base shoe channel
      // Right vertical stainless posts
      [-2.0, -1.0, 0, 1.0, 2.0].forEach((postOff) => {
        if (Math.abs(rightRailX + postOff) < concourseWidth / 2) {
          addCylinder(floorsGroup, 0.024, 0.024, 0.96, 12, [rightRailX + postOff, y + 0.48, railZ], chrome);
        }
      });

      // Side return balustrades along the left and right building edges
      [-concourseWidth / 2 + 0.03, concourseWidth / 2 - 0.03].forEach((sideX) => {
        addBox(floorsGroup, [0.02, 0.94, concourseDepth - 0.2], [sideX, y + 0.48, platformZ], railingGlassMat);
        addBox(floorsGroup, [0.06, 0.06, concourseDepth], [sideX, y + 0.98, platformZ], railingHandrailMat);
      });

      // 7. Recessed Architectural Downlights in the ceiling soffit
      [-2.4, 2.4].forEach((dlX) => {
        [-3.6, -6.6].forEach((dlZ) => {
          // Chrome bezel ring
          addCylinder(floorsGroup, 0.12, 0.12, 0.03, 14, [dlX, y + cabinHeight + 0.02, dlZ], chrome);
          // Glowing warm lens
          addCylinder(floorsGroup, 0.09, 0.09, 0.04, 14, [dlX, y + cabinHeight + 0.015, dlZ], warmMat);
        });
      });

      // Dedicated soft architectural downlight casting light on this concourse
      const concourseLight = new THREE.PointLight(0xffedd5, 1.2, 7.5, 1.6);
      concourseLight.position.set(0, y + cabinHeight + 0.1, platformZ);
      floorsGroup.add(concourseLight);

      // 8. SHOPPING MALL RETAIL STOREFRONTS AT THE REAR (z = -hd - concourseDepth = -9.1m)
      const shopZ = -hd - concourseDepth + 0.1;
      // Storefront dividing bulkhead & piers
      addBox(floorsGroup, [concourseWidth, 2.50, 0.16], [0, y + 1.25, shopZ], darkSteel);
      // Large polished retail vitrine display glass windows
      addBox(floorsGroup, [4.8, 2.0, 0.04], [-3.6, y + 1.15, shopZ + 0.08], shopGlassMat);
      addBox(floorsGroup, [4.8, 2.0, 0.04], [3.6, y + 1.15, shopZ + 0.08], shopGlassMat);
      // Warm glowing boutique display interior illumination behind windows
      addBox(floorsGroup, [4.6, 1.9, 0.02], [-3.6, y + 1.15, shopZ - 0.02], shopBacklitMat);
      addBox(floorsGroup, [4.6, 1.9, 0.02], [3.6, y + 1.15, shopZ - 0.02], shopBacklitMat);
      // Illuminated Backlit Retail Storefront Brand Sign
      addBox(floorsGroup, [4.2, 0.36, 0.05], [0, y + 2.25, shopZ + 0.09], shopSignMat);
    }

    // ----------------------------------------------------
    // ELEVATOR LANDING PORTAL ARCHITRAVE (All floors G to 5)
    // Links the elevator sliding doors directly to the floor concourse!
    // ----------------------------------------------------
    // Stainless steel entrance threshold sill with grooved landing plate
    addBox(floorsGroup, [2.2, 0.035, 0.18], [0, y + 0.02, -hd - 0.09], chrome);
    addBox(floorsGroup, [1.8, 0.01, 0.04], [0, y + 0.04, -hd - 0.09], sillGlowMat);

    // Architectural Door Frame / Portal Architrave (vertical jamb columns on both sides of entrance)
    const jambX = cabinWidth / 2 + 0.08;
    addBox(floorsGroup, [0.14, cabinHeight + 0.1, 0.14], [-jambX, y + cabinHeight / 2, -hd - 0.06], darkSteel);
    addBox(floorsGroup, [0.04, cabinHeight + 0.1, 0.04], [-jambX + 0.05, y + cabinHeight / 2, -hd - 0.12], chrome);
    addBox(floorsGroup, [0.14, cabinHeight + 0.1, 0.14], [jambX, y + cabinHeight / 2, -hd - 0.06], darkSteel);
    addBox(floorsGroup, [0.04, cabinHeight + 0.1, 0.04], [jambX - 0.05, y + cabinHeight / 2, -hd - 0.12], chrome);

    // Portal header transom beam
    addBox(floorsGroup, [3.2, 0.16, 0.16], [0, y + cabinHeight + 0.08, -hd - 0.06], floorTransomMat);
    addBox(floorsGroup, [3.2, 0.03, 0.03], [0, y + cabinHeight + 0.16, -hd - 0.14], chrome);

    // Hall Call Station (LOP) on the right portal jamb at y + 1.25m
    const lopBox = addBox(floorsGroup, [0.08, 0.28, 0.04], [jambX + 0.10, y + 1.25, -hd - 0.12], darkSteel);
    const lopMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });
    floorLopMats.push({ floor: i + 1, mat: lopMat });
    addBox(lopBox, [0.05, 0.05, 0.02], [0, 0.07, 0.02], lopMat); // UP arrow button
    addBox(lopBox, [0.05, 0.05, 0.02], [0, -0.07, 0.02], lopMat); // DOWN arrow button

    // Glowing Floor Level Plaque above the door header
    const floorLabelGroup = new THREE.Group();
    floorLabelGroup.position.set(0, y + cabinHeight + 0.08, -hd - 0.15);
    floorsGroup.add(floorLabelGroup);
    addBox(floorLabelGroup, [0.44, 0.18, 0.02], [0, 0, 0], graphite);
    addBox(floorLabelGroup, [0.38, 0.12, 0.015], [0, 0, 0.01], i === 0 ? amberMat : warmMat);

    // Portal entrance downlight directly above elevator doors
    const entranceLight = new THREE.PointLight(0xfff1e0, 1.2, 5.0, 1.5);
    entranceLight.position.set(0, y + cabinHeight + 0.05, -hd - 0.4);
    floorsGroup.add(entranceLight);
  }

  // ==========================================
  // 5. PANORAMIC OBSERVATION CAPSULE
  // ==========================================
  const car = new THREE.Group();
  car.name = "PanoramicObservationCar";
  shaft.add(car);

  // Cabin Floor & Aerodynamic Lower Skirt
  addBox(car, [cabinWidth + 0.08, 0.14, cabinDepth + 0.08], [0, 0, 0], steel);
  addBox(car, [cabinWidth - 0.18, 0.04, cabinDepth - 0.18], [0, 0.09, 0], graphite);

  const underSkirt = new THREE.Group();
  underSkirt.position.set(0, -0.25, 0);
  car.add(underSkirt);
  addBox(underSkirt, [cabinWidth - 0.1, 0.18, cabinDepth - 0.1], [0, 0.06, 0], darkSteel);
  addBox(underSkirt, [cabinWidth - 0.45, 0.22, cabinDepth - 0.35], [0, -0.1, 0], chrome);
  addBox(underSkirt, [0.35, 0.04, 0.35], [0, -0.22, 0], warmMat);
  // Reinforced car buffer striker plate centered under cabin (x = 0, z = 0)
  addBox(underSkirt, [0.55, 0.08, 0.55], [0, -0.24, 0], steel);
  addBox(underSkirt, [0.44, 0.04, 0.44], [0, -0.29, 0], chrome);

  // Cabin Ceiling & Upper Canopy Dome
  addBox(car, [cabinWidth + 0.08, 0.12, cabinDepth + 0.08], [0, cabinHeight, 0], steel);
  const topDome = new THREE.Group();
  topDome.position.set(0, cabinHeight + 0.22, 0);
  car.add(topDome);
  addBox(topDome, [cabinWidth - 0.1, 0.16, cabinDepth - 0.1], [0, -0.06, 0], darkSteel);
  addBox(topDome, [cabinWidth - 0.4, 0.18, cabinDepth - 0.3], [0, 0.08, 0], chrome);
  addBox(topDome, [cabinWidth - 0.6, 0.04, cabinDepth - 0.5], [0, -0.16, 0], warmMat);

  // Crosshead Cable Hitch
  const carHitch = addBox(car, [1.2, 0.22, 0.35], [0, cabinHeight + 0.45, 0], steel);
  addBox(carHitch, [0.12, 0.18, 0.12], [-0.5, 0.18, 0], chrome);
  addBox(carHitch, [0.12, 0.18, 0.12], [0.5, 0.18, 0], chrome);

  // Structural Corner Mullions
  const chw = cabinWidth / 2;
  const chd = cabinDepth / 2;
  [
    [-chw, -chd],
    [chw, -chd],
    [-chw, chd],
    [chw, chd],
  ].forEach(([x, z]) => {
    addBox(car, [0.1, cabinHeight - 0.14, 0.1], [x, cabinHeight / 2, z], chrome);
  });

  // Left & Right Panoramic Glass Walls
  addBox(car, [0.06, cabinHeight - 0.18, cabinDepth - 0.22], [-chw, cabinHeight / 2, 0], glass);
  addBox(car, [0.06, cabinHeight - 0.18, cabinDepth - 0.22], [chw, cabinHeight / 2, 0], glass);

  // Front Observation Panoramic Glass Wall & Handrail (facing viewer directly +chd)
  addBox(car, [cabinWidth - 0.22, cabinHeight - 0.18, 0.06], [0, cabinHeight / 2, chd], glass);
  addCylinder(car, 0.035, 0.035, cabinWidth - 0.35, 14, [0, 1.05, chd - 0.16], chrome, [0, 0, Math.PI / 2]);

  // Recessed Interior COP Column (minimalistic interior panel)
  const cop = addBox(car, [0.12, 1.25, 0.06], [-chw + 0.16, 1.25, -chd + 0.18], darkSteel);
  for (let b = 0; b < 6; b += 1) {
    addBox(cop, [0.03, 0.03, 0.015], [0, -0.4 + b * 0.15, 0.035], amberMat);
  }

  // --- DISTINCTIVE SLIDING DOORS & ARRIVAL ILLUMINATION ON REAR (-chd, connecting to floor landings) ---
  // Overhead Arrival Lantern: lights up brightly when doors open!
  addBox(car, [1.6, 0.08, 0.06], [0, cabinHeight - 0.06, -chd - 0.06], arrivalLanternMat);

  // Floor Sill Glow: highlights the walking threshold into the floor
  addBox(car, [1.5, 0.02, 0.04], [0, 0.08, -chd - 0.05], sillGlowMat);

  // Door Panels (Left and Right sliding leaves located at -chd)
  const doorLeft = new THREE.Group();
  const doorRight = new THREE.Group();
  const doorW = 0.74;
  const doorH = cabinHeight - 0.22;

  // Door Left: Glass leaf + Brushed chrome outer frame + Handle
  addBox(doorLeft, [doorW, doorH, 0.04], [-doorW / 2, doorH / 2 + 0.08, -chd - 0.04], doorGlass);
  addBox(doorLeft, [doorW, 0.04, 0.05], [-doorW / 2, 0.09, -chd - 0.04], chrome); // Bottom rail
  addBox(doorLeft, [doorW, 0.04, 0.05], [-doorW / 2, doorH + 0.06, -chd - 0.04], chrome); // Top rail
  addBox(doorLeft, [0.04, doorH, 0.05], [-0.02, doorH / 2 + 0.08, -chd - 0.04], chrome); // Meeting stile
  addBox(doorLeft, [0.04, doorH, 0.05], [-doorW + 0.02, doorH / 2 + 0.08, -chd - 0.04], chrome); // Rear stile
  // Vertical brushed stainless tubular door handle
  addCylinder(doorLeft, 0.022, 0.022, 1.4, 12, [-0.06, 1.25, -chd - 0.08], chrome);

  // Door Right: Glass leaf + Brushed chrome outer frame + Handle
  addBox(doorRight, [doorW, doorH, 0.04], [doorW / 2, doorH / 2 + 0.08, -chd - 0.04], doorGlass);
  addBox(doorRight, [doorW, 0.04, 0.05], [doorW / 2, 0.09, -chd - 0.04], chrome); // Bottom rail
  addBox(doorRight, [doorW, 0.04, 0.05], [doorW / 2, doorH + 0.06, -chd - 0.04], chrome); // Top rail
  addBox(doorRight, [0.04, doorH, 0.05], [0.02, doorH / 2 + 0.08, -chd - 0.04], chrome); // Meeting stile
  addBox(doorRight, [0.04, doorH, 0.05], [doorW - 0.02, doorH / 2 + 0.08, -chd - 0.04], chrome); // Rear stile
  // Vertical brushed stainless tubular door handle
  addCylinder(doorRight, 0.022, 0.022, 1.4, 12, [0.06, 1.25, -chd - 0.08], chrome);

  car.add(doorLeft, doorRight);

  // --- PASSENGER SIMULATION SYSTEM ---
  // Active passengers list inside/entering/exiting the cabin
  let passengersList: ArticulatedPassenger[] = [];

  // Initialize with 3 passengers inside cabin
  const initialIndices = [0, 1, 2];
  initialIndices.forEach((spotIdx) => {
    const spot = CABIN_SPOTS[spotIdx];
    const p = createArticulatedPassenger(
      BUSINESS_COLORS[spotIdx % BUSINESS_COLORS.length],
      spot.x,
      spot.z,
      spotIdx
    );
    p.status = "idle";
    p.group.rotation.y = 0; // Front face looking forward
    passengersList.push(p);
    car.add(p.group);
  });

  // Interior Illumination
  const cabinLight = new THREE.PointLight(0xffedd5, mobile ? 2.8 : 3.8, 8.5, 1.8);
  cabinLight.position.set(0, cabinHeight - 0.2, 0);
  car.add(cabinLight);

  const underLight = new THREE.SpotLight(0xffb74d, mobile ? 1.5 : 2.5, 9.0, Math.PI / 4, 0.6, 2);
  underLight.position.set(0, -0.3, 0);
  underLight.target.position.set(0, -5.0, 0);
  car.add(underLight);
  car.add(underLight.target);

  // ==========================================
  // 6. RIGHT SIDE COUNTERWEIGHT SYSTEM (Photo 1 - running on red line side)
  // ==========================================
  const cwt = new THREE.Group();
  cwt.name = "RightSideCounterweight";
  shaft.add(cwt);

  const cwtThickness = 0.24;
  const cwtHeight = 2.4;
  const cwtDepth = 1.15;

  // Steel outer frame
  addBox(cwt, [cwtThickness, 0.12, cwtDepth], [0, cwtHeight / 2, 0], darkSteel);
  addBox(cwt, [cwtThickness, 0.12, cwtDepth], [0, -cwtHeight / 2, 0], darkSteel);
  // Reinforced buffer striker plate centered on bottom of counterweight
  addBox(cwt, [cwtThickness + 0.06, 0.08, 0.46], [0, -cwtHeight / 2 - 0.04, 0], steel);
  addBox(cwt, [cwtThickness + 0.02, 0.03, 0.38], [0, -cwtHeight / 2 - 0.08, 0], chrome);
  addBox(cwt, [cwtThickness, cwtHeight, 0.08], [0, 0, -cwtDepth / 2 + 0.04], darkSteel);
  addBox(cwt, [cwtThickness, cwtHeight, 0.08], [0, 0, cwtDepth / 2 - 0.04], darkSteel);

  // Stacked cast iron ballast weights
  for (let wIdx = 0; wIdx < 5; wIdx += 1) {
    addBox(cwt, [cwtThickness - 0.04, 0.34, cwtDepth - 0.16], [0, -0.75 + wIdx * 0.38, 0], steel);
  }

  // Top cable hitch
  addBox(cwt, [cwtThickness, 0.18, 0.5], [0, cwtHeight / 2 + 0.14, 0], chrome);
  cwt.position.set(cwtX, maxTravel + 0.8, 0);

  // ==========================================
  // 7. SUSPENSION & HOIST CABLES
  // ==========================================
  const cableRadius = 0.022;
  const cableGeom = new THREE.CylinderGeometry(cableRadius, cableRadius, 1, 8);
  cableGeom.translate(0, 0.5, 0);

  const cableCarL = new THREE.Mesh(cableGeom, cableMat);
  const cableCarR = new THREE.Mesh(cableGeom, cableMat);
  shaft.add(cableCarL, cableCarR);

  const cableCwtL = new THREE.Mesh(cableGeom, cableMat);
  const cableCwtR = new THREE.Mesh(cableGeom, cableMat);
  shaft.add(cableCwtL, cableCwtR);

  const travelingCable = addCylinder(shaft, 0.035, 0.035, 1, 8, [hw - 0.35, 0, 0], graphite);
  travelingCable.geometry.translate(0, 0.5, 0);

  // ==========================================
  // 8. KINEMATICS & PASSENGER ANIMATION LOOP
  // ==========================================
  const state: LiftState = {
    currentFloor: 1,
    targetFloor: 3,
    cabinY: 0,
    doorAmount: 0,
    phase: "open",
    moving: false,
    registeredCalls: [],
  };

  const autoSequence = [3, 6, 2, 5, 1, 4];
  let autoIndex = 0;
  let phaseTimer = 0;
  let autoTravel = options.autoTravel ?? true;
  let totalTime = 0;
  let passengerExchangeTriggered = false;

  const callFloor = (floorNumber: number) => {
    let target = Math.round(floorNumber);
    if (target === 0) target = 1;
    target = THREE.MathUtils.clamp(target, 1, floorCount);

    if (target === state.currentFloor && (state.phase === "dwell" || state.phase === "open")) {
      return;
    }

    if (!state.registeredCalls.includes(target)) {
      state.registeredCalls = [...state.registeredCalls, target];
    }

    // Do NOT abruptly change direction or flight mid-air!
    // If lift is moving, keep flying to current destination; the call is queued and attended sequentially.
    if (state.phase === "move") {
      return;
    }

    state.targetFloor = target;
    if (state.phase === "dwell" || state.phase === "open") {
      state.phase = "close";
      phaseTimer = 0;
    }
  };

  // Helper to trigger realistic walking passenger exchange
  const triggerPassengerExchange = () => {
    if (passengerExchangeTriggered) return;
    passengerExchangeTriggered = true;

    // 1. SELECT RANDOM EXITING PASSENGERS
    // (Walk forward out of cabin onto landing floor, then turn away into the building corridor -> BACK SIDE visible!)
    const idlePassengers = passengersList.filter((p) => p.status === "idle");
    let numExit = 0;
    if (idlePassengers.length > 2) {
      numExit = Math.random() < 0.65 ? 2 : 1;
    } else if (idlePassengers.length > 0) {
      numExit = 1;
    }

    const exitLaneX = -0.34; // Left side of doorway
    const enterLaneX = 0.34; // Right side of doorway (Completely separate lanes so they NEVER cross each other!)

    const exiting = idlePassengers.slice(0, numExit);
    exiting.forEach((p, idx) => {
      p.status = "exiting";
      p.delayTimer = 0.3 + idx * 0.8;
      p.currentWaypoint = 0;
      // Path stepping out of rear doors and walking deep onto the solid shopping mall concourse:
      // 1. Move to exit lane near rear doors: x = exitLaneX, z = -0.60 (rotY = Math.PI -> BACK SIDE VISIBLE!)
      // 2. Step through open rear doors onto mall entrance threshold: x = exitLaneX, z = -1.65 (rotY = Math.PI -> BACK SIDE VISIBLE!)
      // 3. Walk along the polished marble concourse past glass balustrades: x = exitLaneX, z = -3.60 (rotY = Math.PI -> BACK SIDE VISIBLE!)
      // 4. Continue walking between architectural columns: x = exitLaneX, z = -5.80 (rotY = Math.PI -> BACK SIDE VISIBLE!)
      // 5. Disperse safely onto the shopping mall concourse towards retail shops: x = exitLaneX - 1.1, z = -7.80 (rotY = Math.PI -> BACK SIDE VISIBLE!)
      p.path = [
        { x: exitLaneX, z: -0.60, rotY: Math.PI },
        { x: exitLaneX, z: -1.65, rotY: Math.PI },
        { x: exitLaneX, z: -3.60, rotY: Math.PI },
        { x: exitLaneX, z: -5.80, rotY: Math.PI },
        { x: exitLaneX - 1.1, z: -7.80, rotY: Math.PI },
      ];
    });

    // 2. SELECT RANDOM ENTERING PASSENGERS FROM FLOOR
    // (Board ONLY AFTER exiting passenger has cleared doorway! Staggered delay = 2.4s. Enter through separate right lane!)
    const freedSpotIndices = new Set(exiting.map((p) => p.spotIndex));
    const occupiedSpotIndices = new Set(
      passengersList.filter((p) => p.status === "idle" && !freedSpotIndices.has(p.spotIndex)).map((p) => p.spotIndex)
    );
    const availableSpots = CABIN_SPOTS.map((_, i) => i).filter((i) => !occupiedSpotIndices.has(i));

    const numEnter = Math.min(availableSpots.length, Math.random() < 0.6 ? 2 : 1);
    for (let e = 0; e < numEnter; e += 1) {
      const spotIdx = availableSpots[e];
      const targetSpot = CABIN_SPOTS[spotIdx];
      const newColor = BUSINESS_COLORS[Math.floor(Math.random() * BUSINESS_COLORS.length)];
      // Spawn deep on the solid shopping mall concourse floor
      const newPassenger = createArticulatedPassenger(newColor, enterLaneX + 1.0, -7.50, spotIdx);
      newPassenger.status = "entering";
      newPassenger.delayTimer = 2.4 + e * 0.9; // Waits until exiting passenger has completely left doorway!
      newPassenger.currentWaypoint = 0;
      newPassenger.group.rotation.y = 0; // Walking towards camera into cabin

      // Path from shopping mall concourse towards front panoramic view:
      // 1. Walking from deep in the mall forward along concourse: x = enterLaneX, z = -5.80 (rotY = 0 -> FRONT FACE VISIBLE!)
      // 2. Approaching the elevator landing between pillars: x = enterLaneX, z = -3.60 (rotY = 0 -> FRONT FACE VISIBLE!)
      // 3. Stepping across the elevator landing threshold sill: x = enterLaneX, z = -1.65 (rotY = 0 -> FRONT FACE VISIBLE!)
      // 4. Stepping through open sliding doors into cabin: x = enterLaneX, z = -0.60 (rotY = 0 -> FRONT FACE VISIBLE!)
      // 5. Takes designated cabin spot facing front panoramic glass: x = targetSpot.x, z = targetSpot.z (rotY = 0 -> FRONT FACE VISIBLE!)
      newPassenger.path = [
        { x: enterLaneX, z: -5.80, rotY: 0 },
        { x: enterLaneX, z: -3.60, rotY: 0 },
        { x: enterLaneX, z: -1.65, rotY: 0 },
        { x: enterLaneX, z: -0.60, rotY: 0 },
        { x: targetSpot.x, z: targetSpot.z, rotY: 0 },
      ];

      passengersList.push(newPassenger);
      car.add(newPassenger.group);
    }
  };

  const update = (deltaSeconds: number) => {
    const dt = Math.min(deltaSeconds, 0.05);
    totalTime += dt;
    phaseTimer += dt;

    const topSheaveY = slabY + mrSlabThick / 2 + 0.60;
    const targetY = (state.targetFloor - 1) * floorHeight;

    // --- State Machine ---
    if (state.phase === "dwell") {
      state.doorAmount = 1;
      state.moving = false;

      // Trigger passenger exchange as soon as doors dwell
      if (phaseTimer > 0.3) {
        triggerPassengerExchange();
      }

      // Check for other pending calls that need attention
      const pendingCalls = state.registeredCalls.filter((f) => f !== state.currentFloor);
      if (pendingCalls.length > 0 && phaseTimer > 3.8) {
        // Dispatch to next pending registered call
        state.targetFloor = pendingCalls[0];
        state.phase = "close";
        phaseTimer = 0;
      } else if (pendingCalls.length === 0 && state.currentFloor !== 1 && phaseTimer > 3.6) {
        // Call attended! Elevator closes doors and automatically returns to Ground Floor (Level 1 / G)
        state.targetFloor = 1;
        state.phase = "close";
        phaseTimer = 0;
      } else if (autoTravel && state.registeredCalls.length === 0 && state.currentFloor === 1 && phaseTimer > 12.0) {
        // Idle demo auto-travel if enabled
        autoIndex = (autoIndex + 1) % autoSequence.length;
        const next = autoSequence[autoIndex];
        callFloor(next === state.currentFloor ? ((next % floorCount) + 1) : next);
      }
    } else if (state.phase === "close") {
      state.moving = false;
      passengerExchangeTriggered = false;
      state.doorAmount = Math.max(0, state.doorAmount - dt * doorSpeed);
      if (state.doorAmount <= 0.001) {
        state.doorAmount = 0;
        state.phase = "move";
        phaseTimer = 0;
      }
    } else if (state.phase === "move") {
      state.moving = true;
      state.doorAmount = 0;
      passengerExchangeTriggered = false;

      const diff = targetY - state.cabinY;
      const dist = Math.abs(diff);

      const speed = Math.min(travelSpeed, Math.max(1.15, Math.sqrt(dist * 3.2) * travelSpeed * 0.95));
      const step = Math.sign(diff) * Math.min(dist, speed * dt);
      state.cabinY += step;

      sheaveGroup.rotation.x += step * 1.8;

      // Real-time passing floor indicator
      const passingFloor = THREE.MathUtils.clamp(Math.round(state.cabinY / floorHeight) + 1, 1, floorCount);
      state.currentFloor = passingFloor;

      if (dist < 0.012) {
        state.cabinY = targetY;
        state.currentFloor = state.targetFloor;
        // Turn OFF the call hold light ONLY when lift arrives and stops at that floor!
        state.registeredCalls = state.registeredCalls.filter((f) => f !== state.currentFloor);
        state.phase = "open";
        phaseTimer = 0;
      }
    } else if (state.phase === "open") {
      state.moving = false;
      state.doorAmount = Math.min(1, state.doorAmount + dt * doorSpeed);
      if (state.doorAmount >= 0.999) {
        state.doorAmount = 1;
        state.phase = "dwell";
        phaseTimer = 0;
      }
    }

    // Dynamic 3D Hall Call LOP lighting
    floorLopMats.forEach((item) => {
      if (state.registeredCalls.includes(item.floor)) {
        item.mat.color.setHex(0xf59e0b);
        item.mat.emissive.setHex(0xf59e0b);
        item.mat.emissiveIntensity = 3.5;
      } else if (state.currentFloor === item.floor && !state.moving) {
        item.mat.color.setHex(0x10b981);
        item.mat.emissive.setHex(0x10b981);
        item.mat.emissiveIntensity = 1.8;
      } else {
        item.mat.color.setHex(0x38bdf8);
        item.mat.emissive.setHex(0x0284c7);
        item.mat.emissiveIntensity = 1.0;
      }
    });

    // --- Positions & Sliding Doors ---
    car.position.y = state.cabinY;

    // Doors sliding: open wide so clear doorway is 1.56m wide
    const doorSlide = state.doorAmount * 0.78;
    doorLeft.position.x = -doorSlide;
    doorRight.position.x = doorSlide;

    // Transom arrival lantern & sill glow dynamic illumination
    arrivalLanternMat.emissiveIntensity = 0.25 + state.doorAmount * 2.4;
    sillGlowMat.emissiveIntensity = 0.25 + state.doorAmount * 2.0;

    // Counterweight inverse travel on RIGHT SIDE track (Photo 1 - running on red line side)
    const cwtY = maxTravel + 0.8 - (state.cabinY * (maxTravel / (maxTravel || 1)));
    cwt.position.set(cwtX, cwtY, 0);

    // Cables scaling
    const carHitchY = state.cabinY + cabinHeight + 0.45;
    const carCableLen = Math.max(0.1, topSheaveY - carHitchY);
    cableCarL.position.set(-0.5, carHitchY, 0);
    cableCarL.scale.set(1, carCableLen, 1);
    cableCarR.position.set(0.5, carHitchY, 0);
    cableCarR.scale.set(1, carCableLen, 1);

    const cwtHitchY = cwtY + cwtHeight / 2 + 0.14;
    const cwtCableLen = Math.max(0.1, topSheaveY - cwtHitchY);
    cableCwtL.position.set(cwtX, cwtHitchY, -0.2);
    cableCwtL.scale.set(1, cwtCableLen, 1);
    cableCwtR.position.set(cwtX, cwtHitchY, 0.2);
    cableCwtR.scale.set(1, cwtCableLen, 1);

    // Traveling cable under cabin
    const midTravelY = maxTravel / 2;
    const travCableLen = Math.abs(state.cabinY - midTravelY) + 1.2;
    travelingCable.position.set(hw - 0.3, Math.min(state.cabinY, midTravelY), -0.2);
    travelingCable.scale.set(1, Math.max(0.5, travCableLen), 1);

    // --- PASSENGER ANIMATION STEP ---
    passengersList = passengersList.filter((p) => {
      // Handle delay timer (staggered walking)
      if (p.delayTimer > 0) {
        p.delayTimer -= dt;
        // Idle breathing while waiting
        const breathe = Math.sin(totalTime * 2.2 + p.seed);
        p.torso.position.y = 0.82 + breathe * 0.012;
        p.head.position.y = 1.30 + breathe * 0.012;
        return true;
      }

      // Idle passenger inside cabin: gentle breathing and arm posture
      if (p.status === "idle") {
        const breathe = Math.sin(totalTime * 2.2 + p.seed);
        p.torso.position.y = 0.82 + breathe * 0.012;
        p.head.position.y = 1.30 + breathe * 0.012;
        p.leftLeg.rotation.x = 0;
        p.rightLeg.rotation.x = 0;
        p.leftArm.rotation.x = Math.sin(totalTime * 1.1 + p.seed) * 0.04;
        p.rightArm.rotation.x = -Math.sin(totalTime * 1.1 + p.seed) * 0.04;
        return true;
      }

      // Walking passenger (exiting or entering)
      if (p.status === "exiting" || p.status === "entering") {
        const wp = p.path[p.currentWaypoint];
        if (!wp) {
          if (p.status === "exiting") {
            // Reached end of corridor -> remove from car and dispose
            car.remove(p.group);
            p.group.traverse((obj) => {
              if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach((m) => m.dispose());
              }
            });
            return false;
          } else {
            // Reached inside cabin spot -> become idle!
            p.status = "idle";
            p.leftLeg.rotation.x = 0;
            p.rightLeg.rotation.x = 0;
            p.leftArm.rotation.x = 0;
            p.rightArm.rotation.x = 0;
            p.group.rotation.y = 0; // Front face proudly facing forward
            return true;
          }
        }

        // Stepping towards current waypoint
        const dx = wp.x - p.group.position.x;
        const dz = wp.z - p.group.position.z;
        const dist = Math.hypot(dx, dz);

        // Articulated walking stride
        p.walkPhase += dt * 8.2;
        p.leftLeg.rotation.x = Math.sin(p.walkPhase) * 0.55;
        p.rightLeg.rotation.x = -Math.sin(p.walkPhase) * 0.55;
        p.leftArm.rotation.x = -Math.sin(p.walkPhase) * 0.45;
        p.rightArm.rotation.x = Math.sin(p.walkPhase) * 0.45;
        p.torso.position.y = 0.82 + Math.abs(Math.sin(p.walkPhase * 2)) * 0.025;
        p.head.position.y = 1.30 + Math.abs(Math.sin(p.walkPhase * 2)) * 0.025;

        // Smooth rotation to face walking direction
        p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, wp.rotY, dt * 9.0);

        const step = p.walkSpeed * dt;
        if (dist <= step || dist < 0.035) {
          p.group.position.x = wp.x;
          p.group.position.z = wp.z;
          p.currentWaypoint += 1;
        } else {
          p.group.position.x += (dx / dist) * step;
          p.group.position.z += (dz / dist) * step;
        }

        return true;
      }

      return true;
    });

    // Cabin light pulsing subtly
    cabinLight.intensity = (state.moving ? 4.2 : 3.8) + Math.sin(totalTime * 2.5) * 0.25;
  };

  const setAutoTravel = (enabled: boolean) => {
    autoTravel = enabled;
  };

  const dispose = () => {
    root.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach((m: THREE.Material) => m.dispose());
      }
    });
  };

  return { object: root, state, update, callFloor, setAutoTravel, dispose };
}

export default createLiftModel;
