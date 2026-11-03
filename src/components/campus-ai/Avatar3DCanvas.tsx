import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { robotAudio } from '../../utils/robotAudio';

export type RobotMovement =
  | 'auto'              // Smart: stays in rest (robo emoji 1.jpg), and moves when asked questions!
  // --- The Iconic Emotions from the Sticker Sheet ---
  | 'rest'              // 1. (R1,C1) Rest Stance • Attentive oval eyes & symmetrical resting hands
  | 'wave_hello'        // 2. (R1,C2) Friendly Wave • Smiling eyes ^ ^ & right hand waving
  | 'thumbs_up'         // 3. (R1,C3) Thumbs-Up & Wink • Wink eye + thumb up + yellow sparks
  | 'cheer_both'        // 4. (R1,C4) Both Hands Cheering • Double arms raised + yellow bursts
  | 'laughing_cheer'    // 5. (R1,C5) Laughing Cheerful • > < eyes + clenched hands + yellow sparks
  | 'hug_heart'         // 6. (R2,C1) Hugging Heart • Clutching glowing red 3D heart against chest
  | 'in_love'           // 7. (R2,C2) In Love & Blushing • Tilted head, blushing cheeks, floating hearts
  | 'confused_question' // 8. (R2,C3) Puzzled Question • Hand on chin, asymmetrical eyes, floating '?'
  | 'thinking_dots'     // 9. (R2,C4) Thinking Suspicious • Hand on chin, side glance, floating dots
  | 'shocked_gasp'      // 10. (R2,C5) Shocked Gasp • Wide eyes, floating '!!', hands to cheeks
  | 'sad_crying'        // 11. (R3,C1) Crying Tears • Cyan tears streaming down screen, sorrowful droop
  | 'sleeping_zzz'      // 12. (R3,C2) Sleeping & Snoozing • Curled sideways, closed eyes, floating 'Z z z'
  | 'angry_fumes'       // 13. (R3,C3) Angry Fumes • Red glowing face & eyes, steam puffs, clenched fists
  | 'dizzy_stars'       // 14. (R3,C5) Dizzy Swirls • Spiral eyes @ @, orbiting stars, wobbly tilt
  | 'aha_idea'          // 15. (R4,C1) Aha! Idea • Finger up, glowing yellow lightbulb, happy smile
  | 'laptop_work'       // 16. (R4,C2) Working on Laptop • Holding 3D laptop, typing with focused eyes
  | 'tablet_mobile'     // 17. (R4,C3) Tablet / Mobile • Holding sleek mobile tablet with both hands
  | 'point_direction'   // 18. (R4,C4) Direction Pointer • Arm stretched horizontally pointing direction
  | 'flying_jump'       // 19. (R4,C5) Flying Jump • High levitation, arms spread wide, wind streaks
  | 'goodbye_wave'      // 20. (R4,C6) Goodbye Wave • Calm standing, right hand waving low goodbye
  | 'peek_corner'       // 21. (R5,C1) Peek Around Corner • Leaning sideways around wall edge, peeking
  | 'scared_tremble'    // 22. (R5,C2) Scared Tremble • Nervous body jitter vibration, hands out
  | 'frustrated_headache' // 23. (R5,C3) Frustrated Headache • Hands on head, stress lines on screen
  | 'party_confetti'    // 24. (R5,C5) Party Confetti • Colorful confetti falling, hands raised high
  | 'polite_bow'        // 25. (R5,C6) Polite Bow • Respectful forward bow, peaceful closed eyes
  | 'relaxed_chill'     // 26. Relaxed Lounging • Lying on side propped on elbow, serene smile
  | 'arms_crossed'      // 27. Arms Crossed • Sassy folded arms, deadpan flat-top eyes — —
  // --- New Cool & Funny Movements from Sticker Sheet ---
  | 'cool_shades'       // 28. Cool Swagger Sunglasses • Leaning back with sunglasses & finger guns
  | 'dj_headphones'     // 29. DJ Beats • Chunky headphones, rhythm bounce & floating music notes
  | 'movie_popcorn'     // 30. Movie Popcorn • 3D glasses & striped popcorn bucket snacking
  | 'gamer_headset'     // 31. Pro Gamer • Gaming headset & console gamepad controller
  | 'chef_cooking'      // 32. Master Chef • Chef toque hat & frying pan flipping veggies
  | 'sleeping_cat'      // 33. Cat Nap Pillow • Soft blue pillow with sleeping ginger cat curled up
  | 'superhero_cape'    // 34. Superhero Soar • Flying forward with fluttering red superhero cape
  | 'skateboard'        // 35. Skater Cruising • Neon cyan skateboard carving across campus
  | 'graduate_cap'      // 36. Graduate Honors • Mortarboard cap with gold tassel & diploma scroll
  | 'dumbbell_gym'      // 37. Gym Bodybuilder • Bicep curls with heavy black dumbbells
  | 'rose_romance'      // 38. Romantic Rose • Charming wink offering a fresh red rose
  | 'zen_meditation'    // 39. Zen Yoga Meditation • Lotus hovering with floating green leaves
  // --- Complementary Explaining Modes & Aliases ---
  | 'explain_hologram'  // Translucent holographic campus display
  | 'explain_hands'     // Keynote presentation sweeps
  | 'alert_warning'     // Caution warning palms-up
  | 'explain_book'      // Open academic book & lightbulb
  | 'explain_ponder'    // Alias for confused_question
  | 'explain_celebrate' // Alias for cheer_both / party_confetti
  | 'love_heart'        // Alias for hug_heart / in_love
  | 'focused_listen';   // Attentive listening posture

interface Avatar3DProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'alert';
  speechVolume?: number; // 0 to 1 for real-time lip sync amplitude
  movement?: RobotMovement;
  wearSunglasses?: boolean;
  wearHeadphones?: boolean;
  onMovementChange?: (movement: RobotMovement) => void;
}

export const Avatar3DCanvas: React.FC<Avatar3DProps> = ({
  state,
  speechVolume = 0,
  movement = 'auto',
  wearSunglasses = false,
  wearHeadphones = true,
  onMovementChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const speechRef = useRef(speechVolume);
  const movementRef = useRef(movement);
  const wearSunglassesRef = useRef(wearSunglasses);
  const wearHeadphonesRef = useRef(wearHeadphones);
  const onMovementChangeRef = useRef(onMovementChange);

  useEffect(() => {
    stateRef.current = state;
    speechRef.current = speechVolume;
    movementRef.current = movement;
    wearSunglassesRef.current = wearSunglasses;
    wearHeadphonesRef.current = wearHeadphones;
    onMovementChangeRef.current = onMovementChange;
  }, [state, speechVolume, movement, wearSunglasses, wearHeadphones, onMovementChange]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 380;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. High-Fidelity Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 4, 3.5);
    scene.add(keyLight);

    const rimLightBlue = new THREE.DirectionalLight(0x38bdf8, 3.2);
    rimLightBlue.position.set(4, 2, -2);
    scene.add(rimLightBlue);

    const fillLight = new THREE.DirectionalLight(0x67e8f9, 1.8);
    fillLight.position.set(-3.5, 2, 2);
    scene.add(fillLight);

    const bottomLight = new THREE.PointLight(0x93c5fd, 1.0, 8);
    bottomLight.position.set(0, -2.5, 2);
    scene.add(bottomLight);

    const bulbLight = new THREE.PointLight(0xfbbf24, 0, 4);
    bulbLight.position.set(0.4, 0.6, 0.9);
    scene.add(bulbLight);

    const holoLight = new THREE.PointLight(0x06b6d4, 0, 4);
    holoLight.position.set(0, 0, 1.1);
    scene.add(holoLight);

    // 3. Materials Matching the Official Robot Renders
    const whiteCeramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const skyBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.8,
    });

    const darkBezelMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.5,
    });

    // 4. Dynamic OLED Screen Canvas Texture
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 380;
    const ctx = faceCanvas.getContext('2d')!;

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.minFilter = THREE.LinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;

    const screenMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      color: 0xffffff,
    });

    // 5. Robot Hierarchy
    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    // ---- HEAD GROUP ----
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 0);
    robotRoot.add(headGroup);

    // Main White Rounded Monitor Helmet
    const headWidth = 1.5;
    const headHeight = 1.08;
    const headDepth = 0.95;

    const helmetGeo = new THREE.BoxGeometry(headWidth, headHeight, headDepth, 16, 16, 16);
    const pos = helmetGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      const factor = 1.0 - (Math.abs(x / headWidth) * 0.18 + Math.abs(y / headHeight) * 0.18 + Math.abs(z / headDepth) * 0.15);
      pos.setXYZ(i, x * factor, y * factor, z);
    }
    helmetGeo.computeVertexNormals();
    const helmetMesh = new THREE.Mesh(helmetGeo, whiteCeramicMat);
    headGroup.add(helmetMesh);

    // OLED Screen Surface
    const screenGeo = new THREE.PlaneGeometry(1.15, 0.78, 16, 16);
    const screenPos = screenGeo.attributes.position;
    for (let i = 0; i < screenPos.count; i++) {
      let x = screenPos.getX(i);
      let y = screenPos.getY(i);
      screenPos.setZ(i, (1.0 - (x * x * 0.8 + y * y * 0.8)) * 0.04);
    }
    screenGeo.computeVertexNormals();

    const screenBackMesh = new THREE.Mesh(screenGeo, darkBezelMat);
    screenBackMesh.position.set(0, 0.02, (headDepth / 2) * 0.9 + 0.01);
    headGroup.add(screenBackMesh);

    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.02, (headDepth / 2) * 0.9 + 0.02);
    headGroup.add(screenMesh);

    // Ear Muff Discs (Left & Right)
    const earDiscGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 32);
    earDiscGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earDiscGeo, skyBlueMat);
    leftEar.position.set(-headWidth * 0.48 - 0.06, 0.15, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earDiscGeo, skyBlueMat);
    rightEar.position.set(headWidth * 0.48 + 0.06, 0.15, 0);
    headGroup.add(rightEar);

    // Antenna Ears
    const antennaGeo = new THREE.CapsuleGeometry(0.08, 0.32, 16, 24);

    const leftAntenna = new THREE.Mesh(antennaGeo, skyBlueMat);
    leftAntenna.position.set(-headWidth * 0.48 - 0.08, 0.52, 0);
    leftAntenna.rotation.z = 0.35;
    leftAntenna.rotation.x = -0.05;
    headGroup.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(antennaGeo, skyBlueMat);
    rightAntenna.position.set(headWidth * 0.48 + 0.08, 0.52, 0);
    rightAntenna.rotation.z = -0.35;
    rightAntenna.rotation.x = -0.05;
    headGroup.add(rightAntenna);

    // ---- TORSO / BODY GROUP ----
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, -0.65, 0);
    robotRoot.add(bodyGroup);

    // Lower white body pod
    const lowerBodyGeo = new THREE.SphereGeometry(0.58, 36, 36);
    lowerBodyGeo.scale(0.85, 1.1, 0.85);
    const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, whiteCeramicMat);
    lowerBodyMesh.position.set(0, -0.08, 0);
    bodyGroup.add(lowerBodyMesh);

    // Upper sky-blue chest jacket
    const chestGeo = new THREE.SphereGeometry(0.62, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.55);
    chestGeo.scale(0.9, 1.05, 0.9);
    const chestMesh = new THREE.Mesh(chestGeo, skyBlueMat);
    chestMesh.position.set(0, 0.08, 0);
    bodyGroup.add(chestMesh);

    // Sky-blue center bib flap
    const flapGeo = new THREE.BoxGeometry(0.24, 0.38, 0.08);
    const flapMesh = new THREE.Mesh(flapGeo, skyBlueMat);
    flapMesh.position.set(0, -0.12, 0.48);
    flapMesh.rotation.x = -0.15;
    bodyGroup.add(flapMesh);

    // Glowing Circular Cyan Core Light
    const coreRingGeo = new THREE.TorusGeometry(0.13, 0.035, 16, 32);
    const coreRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.5,
    });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.position.set(0, 0.12, 0.54);
    bodyGroup.add(coreRing);

    const coreDiscGeo = new THREE.CircleGeometry(0.12, 32);
    const coreDiscMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
    const coreDisc = new THREE.Mesh(coreDiscGeo, coreDiscMat);
    coreDisc.position.set(0, 0.12, 0.545);
    bodyGroup.add(coreDisc);

    // ---- SHOULDER CAPS & ARTICULATED WHITE HANDS ----
    // BLUE PART = SHOULDERS (anchored firmly to torso)
    // WHITE PART = HANDS / ARMS (moving appendages pivoting underneath)
    const shoulderSocketX = 0.68;
    const shoulderSocketY = -0.30;
    const shoulderSocketZ = 0.02;

    const shoulderCapGeo = new THREE.SphereGeometry(0.145, 24, 24);
    shoulderCapGeo.scale(1.05, 1.25, 0.9);

    const leftShoulderMesh = new THREE.Mesh(shoulderCapGeo, skyBlueMat);
    leftShoulderMesh.position.set(-shoulderSocketX, shoulderSocketY, shoulderSocketZ);
    leftShoulderMesh.rotation.z = 0.22;
    robotRoot.add(leftShoulderMesh);

    const rightShoulderMesh = new THREE.Mesh(shoulderCapGeo, skyBlueMat);
    rightShoulderMesh.position.set(shoulderSocketX, shoulderSocketY, shoulderSocketZ);
    rightShoulderMesh.rotation.z = -0.22;
    robotRoot.add(rightShoulderMesh);

    const armBodyGeo = new THREE.CapsuleGeometry(0.09, 0.34, 24, 24);
    armBodyGeo.scale(0.88, 1.18, 0.72);

    const leftHandGroup = new THREE.Group();
    leftHandGroup.position.set(-shoulderSocketX, shoulderSocketY - 0.04, shoulderSocketZ);
    robotRoot.add(leftHandGroup);

    const leftHandMesh = new THREE.Mesh(armBodyGeo, whiteCeramicMat);
    leftHandMesh.position.set(0, -0.20, 0);
    leftHandGroup.add(leftHandMesh);

    const rightHandGroup = new THREE.Group();
    rightHandGroup.position.set(shoulderSocketX, shoulderSocketY - 0.04, shoulderSocketZ);
    robotRoot.add(rightHandGroup);

    const rightHandMesh = new THREE.Mesh(armBodyGeo, whiteCeramicMat);
    rightHandMesh.position.set(0, -0.20, 0);
    rightHandGroup.add(rightHandMesh);

    // ---- 3D PROPS FOR ALL 16 POSES ----

    // 1. IDEA LIGHTBULB (aha_idea & explain_book)
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(0.35, 0.85, 0.2);
    bulbGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(bulbGroup);

    const bulbGlassGeo = new THREE.SphereGeometry(0.2, 32, 32);
    bulbGlassGeo.scale(0.9, 1.1, 0.9);
    const bulbGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.92,
    });
    const bulbGlass = new THREE.Mesh(bulbGlassGeo, bulbGlassMat);
    bulbGroup.add(bulbGlass);

    const filamentGeo = new THREE.TorusGeometry(0.07, 0.02, 16, 24);
    const filamentMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const filament = new THREE.Mesh(filamentGeo, filamentMat);
    filament.position.set(0, 0.02, 0);
    bulbGroup.add(filament);

    const sparkRays: THREE.Mesh[] = [];
    const rayGeo = new THREE.CapsuleGeometry(0.025, 0.1, 8, 8);
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    for (let i = 0; i < 6; i++) {
      const ray = new THREE.Mesh(rayGeo, rayMat);
      const angle = (i / 6) * Math.PI * 1.6 + 0.5;
      ray.position.set(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35 + 0.05, 0);
      ray.rotation.z = angle - Math.PI / 2;
      bulbGroup.add(ray);
      sparkRays.push(ray);
    }

    // 2. PLUMP 3D RED HEART (hug_heart)
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, -0.25, 0.62);
    heartGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(heartGroup);

    const heartShape = new THREE.Shape();
    const hx = 0, hy = 0;
    heartShape.moveTo(hx + 0.25, hy + 0.25);
    heartShape.bezierCurveTo(hx + 0.25, hy + 0.25, hx + 0.2, hy, hx, hy);
    heartShape.bezierCurveTo(hx - 0.35, hy, hx - 0.35, hy + 0.35, hx - 0.35, hy + 0.35);
    heartShape.bezierCurveTo(hx - 0.35, hy + 0.6, hx - 0.12, hy + 0.82, hx + 0.25, hy + 1.1);
    heartShape.bezierCurveTo(hx + 0.62, hy + 0.82, hx + 0.85, hy + 0.6, hx + 0.85, hy + 0.35);
    heartShape.bezierCurveTo(hx + 0.85, hy + 0.35, hx + 0.85, hy, hx + 0.5, hy);
    heartShape.bezierCurveTo(hx + 0.35, hy, hx + 0.25, hy + 0.25, hx + 0.25, hy + 0.25);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    });
    heartGeo.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.6,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.rotation.z = Math.PI;
    heartMesh.scale.set(0.65, 0.65, 0.65);
    heartGroup.add(heartMesh);

    // 3. FLOATING MINI HEARTS (in_love)
    const floatingHeartsGroup = new THREE.Group();
    floatingHeartsGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(floatingHeartsGroup);

    const miniHeart1 = new THREE.Mesh(heartGeo, heartMat);
    miniHeart1.rotation.z = Math.PI - 0.3;
    miniHeart1.scale.set(0.25, 0.25, 0.25);
    miniHeart1.position.set(-0.65, 0.85, 0.15);
    floatingHeartsGroup.add(miniHeart1);

    const miniHeart2 = new THREE.Mesh(heartGeo, heartMat);
    miniHeart2.rotation.z = Math.PI + 0.25;
    miniHeart2.scale.set(0.32, 0.32, 0.32);
    miniHeart2.position.set(0.72, 0.95, 0.15);
    floatingHeartsGroup.add(miniHeart2);

    // 4. 3D GLOSSY QUESTION MARK '?' (confused_question & thinking)
    const questionGroup = new THREE.Group();
    questionGroup.position.set(0.52, 0.86, 0.18);
    questionGroup.rotation.z = -0.18;
    questionGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(questionGroup);

    const qMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    // Precision 2D Vector Shape for Question Mark Hook
    const qShape = new THREE.Shape();
    qShape.moveTo(-0.045, 0.0);
    qShape.lineTo(0.045, 0.0);
    qShape.lineTo(0.045, 0.12);
    qShape.bezierCurveTo(0.05, 0.20, 0.19, 0.24, 0.19, 0.36);
    qShape.bezierCurveTo(0.19, 0.52, 0.09, 0.58, -0.01, 0.58);
    qShape.bezierCurveTo(-0.13, 0.58, -0.22, 0.49, -0.22, 0.36);
    qShape.bezierCurveTo(-0.22, 0.28, -0.16, 0.26, -0.11, 0.26);
    qShape.bezierCurveTo(-0.11, 0.34, -0.08, 0.48, -0.01, 0.48);
    qShape.bezierCurveTo(0.07, 0.48, 0.10, 0.43, 0.10, 0.36);
    qShape.bezierCurveTo(0.10, 0.26, 0.01, 0.20, -0.045, 0.14);
    qShape.lineTo(-0.045, 0.0);
    qShape.closePath();

    const qHookGeo = new THREE.ExtrudeGeometry(qShape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    qHookGeo.center();

    const qHook = new THREE.Mesh(qHookGeo, qMat);
    qHook.position.set(0, 0.16, 0);
    questionGroup.add(qHook);

    const qDotGeo = new THREE.SphereGeometry(0.065, 32, 24);
    qDotGeo.scale(1, 1, 0.75);
    const qDot = new THREE.Mesh(qDotGeo, qMat);
    qDot.position.set(0.005, -0.26, 0);
    questionGroup.add(qDot);

    // 5. 3D LAPTOP (laptop_work)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, -0.32, 0.62);
    laptopGroup.rotation.x = 0.22;
    laptopGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(laptopGroup);

    const lapMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.6 });
    const lapBaseGeo = new THREE.BoxGeometry(0.56, 0.025, 0.38);
    const lapBase = new THREE.Mesh(lapBaseGeo, lapMat);
    laptopGroup.add(lapBase);

    const lapScreenGeo = new THREE.BoxGeometry(0.56, 0.38, 0.02);
    const lapScreenMesh = new THREE.Mesh(lapScreenGeo, lapMat);
    lapScreenMesh.position.set(0, 0.18, -0.18);
    lapScreenMesh.rotation.x = -0.35;
    laptopGroup.add(lapScreenMesh);

    const lapDispGeo = new THREE.PlaneGeometry(0.51, 0.32);
    const lapDispMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const lapDisp = new THREE.Mesh(lapDispGeo, lapDispMat);
    lapDisp.position.set(0, 0.18, -0.168);
    lapDisp.rotation.x = -0.35;
    laptopGroup.add(lapDisp);

    // 6. 3D ZZZ FLOATING LETTERS (sleeping_zzz)
    const zzzGroup = new THREE.Group();
    zzzGroup.position.set(0.48, 0.65, 0.2);
    zzzGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(zzzGroup);

    const zMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 0.6 });
    for (let i = 0; i < 3; i++) {
      const zPlaneGeo = new THREE.BoxGeometry(0.12 * (1 + i * 0.3), 0.03, 0.02);
      const z1 = new THREE.Mesh(zPlaneGeo, zMat);
      z1.position.set(i * 0.14, i * 0.16, 0);
      zzzGroup.add(z1);
    }

    // 7. CORNER WALL (peek_corner)
    const cornerWallGroup = new THREE.Group();
    cornerWallGroup.position.set(0.98, 0, 0.3);
    cornerWallGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(cornerWallGroup);

    const wallGeo = new THREE.BoxGeometry(0.18, 3.8, 1.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    cornerWallGroup.add(wallMesh);

    // 8. ENERGY BURSTS / SPARKS (thumbs_up & cheer_both)
    const energySparksGroup = new THREE.Group();
    energySparksGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(energySparksGroup);

    const burstRayGeo = new THREE.CapsuleGeometry(0.035, 0.16, 8, 8);
    const burstMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const burstRays: THREE.Mesh[] = [];
    [
      { x: -0.65, y: 0.95, r: 0.4 },
      { x: -0.85, y: 0.75, r: 0.8 },
      { x: 0.65, y: 0.95, r: -0.4 },
      { x: 0.85, y: 0.75, r: -0.8 },
    ].forEach(b => {
      const rMesh = new THREE.Mesh(burstRayGeo, burstMat);
      rMesh.position.set(b.x, b.y, 0.1);
      rMesh.rotation.z = b.r;
      energySparksGroup.add(rMesh);
      burstRays.push(rMesh);
    });

    // 9. HOLOGRAPHIC CAMPUS DATA BOARD (explain_hologram)
    const holoBoardGroup = new THREE.Group();
    holoBoardGroup.position.set(0.1, -0.15, 0.75);
    holoBoardGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(holoBoardGroup);

    const holoCanvas = document.createElement('canvas');
    holoCanvas.width = 512;
    holoCanvas.height = 360;
    const holoCtx = holoCanvas.getContext('2d')!;

    const holoTexture = new THREE.CanvasTexture(holoCanvas);
    const holoBoardMat = new THREE.MeshPhysicalMaterial({
      map: holoTexture,
      transparent: true,
      opacity: 0.92,
      roughness: 0.1,
      transmission: 0.85,
      color: 0xffffff,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });

    const holoBoardGeo = new THREE.PlaneGeometry(1.3, 0.9);
    const holoBoardMesh = new THREE.Mesh(holoBoardGeo, holoBoardMat);
    holoBoardMesh.rotation.y = -0.22;
    holoBoardMesh.rotation.x = -0.05;
    holoBoardGroup.add(holoBoardMesh);

    // 10. COLORFUL PARTY CONFETTI PARTICLES (party_confetti)
    const confettiGroup = new THREE.Group();
    confettiGroup.position.set(0, 0.4, 0.2);
    confettiGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(confettiGroup);

    const confettiColors = [0xf43f5e, 0x10b981, 0xfbbf24, 0x8b5cf6, 0x06b6d4, 0xf97316];
    const confettiPieces: { mesh: THREE.Mesh; speed: number; rotSpeed: number; originY: number; originX: number }[] = [];
    const confGeo = new THREE.PlaneGeometry(0.07, 0.045);
    for (let i = 0; i < 28; i++) {
      const col = confettiColors[i % confettiColors.length];
      const confMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
      const piece = new THREE.Mesh(confGeo, confMat);
      const startX = (Math.random() - 0.5) * 1.8;
      const startY = 0.4 + Math.random() * 1.1;
      const startZ = (Math.random() - 0.5) * 0.7;
      piece.position.set(startX, startY, startZ);
      confettiGroup.add(piece);
      confettiPieces.push({
        mesh: piece,
        speed: 0.6 + Math.random() * 0.9,
        rotSpeed: (Math.random() - 0.5) * 6,
        originY: startY,
        originX: startX,
      });
    }

    // 11. ORBITING DIZZY STARS (dizzy_stars)
    const dizzyStarsGroup = new THREE.Group();
    dizzyStarsGroup.position.set(0, 0.85, 0);
    dizzyStarsGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(dizzyStarsGroup);

    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.11 : 0.05;
      const a = (i / 10) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    const starGeo = new THREE.ShapeGeometry(starShape);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
    const starMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const sMesh = new THREE.Mesh(starGeo, starMat);
      dizzyStarsGroup.add(sMesh);
      starMeshes.push(sMesh);
    }

    // 12. ANGRY STEAM PUFFS (angry_fumes)
    const angryFumesGroup = new THREE.Group();
    angryFumesGroup.position.set(0, 0.85, 0.1);
    angryFumesGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(angryFumesGroup);

    const puffGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const puffLeft = new THREE.Mesh(puffGeo, puffMat);
    puffLeft.position.set(-0.68, 0.22, 0);
    angryFumesGroup.add(puffLeft);

    const puffRight = new THREE.Mesh(puffGeo, puffMat);
    puffRight.position.set(0.68, 0.22, 0);
    angryFumesGroup.add(puffRight);

    // 13. SHOCKED EXCLAMATION MARKS (shocked_gasp)
    const shockGroup = new THREE.Group();
    shockGroup.position.set(0, 0.92, 0.1);
    shockGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(shockGroup);

    const exclMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.2 });
    [-0.52, 0.52].forEach((posX) => {
      const barMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.16, 8, 8), exclMat);
      barMesh.position.set(posX, 0.1, 0);
      shockGroup.add(barMesh);

      const dotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), exclMat);
      dotMesh.position.set(posX, -0.11, 0);
      shockGroup.add(dotMesh);
    });

    // 14. 3D TABLET / MOBILE (tablet_mobile)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(0, -0.32, 0.55);
    tabletGroup.rotation.x = 0.55;
    tabletGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(tabletGroup);

    const tabGeo = new THREE.BoxGeometry(0.32, 0.44, 0.02);
    const tabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
    const tabMesh = new THREE.Mesh(tabGeo, tabMat);
    tabletGroup.add(tabMesh);

    const tabScreenGeo = new THREE.PlaneGeometry(0.28, 0.38);
    const tabScreenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const tabScreen = new THREE.Mesh(tabScreenGeo, tabScreenMat);
    tabScreen.position.set(0, 0, 0.012);
    tabletGroup.add(tabScreen);

    // =========================================================================
    // NEW COOL & FUNNY 3D PROPS (FROM STICKER SHEET)
    // =========================================================================

    // 15. ULTRA-COOL DESIGNER SUNGLASSES (cool_shades / wearSunglasses)
    // Custom tailored to robot face: eyes at x = ±0.152, y = 0.03
    const coolShadesGroup = new THREE.Group();
    coolShadesGroup.position.set(0, 0.025, (headDepth / 2) * 0.9 + 0.045);
    coolShadesGroup.scale.set(0.001, 0.001, 0.001);
    headGroup.add(coolShadesGroup);

    // Deep Obsidian / Carbon Black Acetate Frame
    const shadesMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      roughness: 0.12,
      metalness: 0.35,
    });
    // Luxurious Golden Brow Accent & Corner Rivets
    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.95,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
    });
    // Polarized Dark Tinted Lenses with High-Gloss Specular Sheen
    const shadesLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x04060c,
      roughness: 0.03,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      transparent: true,
      opacity: 0.90,
    });
    const glintMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });

    // A. Top Brow Bar spanning across top
    const browBarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.042, 0.034), shadesMat);
    browBarMesh.position.set(0, 0.095, 0);
    coolShadesGroup.add(browBarMesh);

    // Golden inlay stripe on brow bar
    const goldBrowStripe = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.008, 0.038), goldAccentMat);
    goldBrowStripe.position.set(0, 0.116, 0);
    coolShadesGroup.add(goldBrowStripe);

    // B. Keyhole Nose Bridge
    const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.032, 0.032), shadesMat);
    bridgeMesh.position.set(0, 0.02, 0);
    coolShadesGroup.add(bridgeMesh);

    // C. Left & Right Lenses and Beveled Rims (centered at x = ±0.165, directly over eyes)
    [-0.165, 0.165].forEach((xPos) => {
      // Outer Frame Rim
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.032), shadesMat);
      frameMesh.position.set(xPos, 0, 0);
      frameMesh.rotation.z = xPos < 0 ? -0.045 : 0.045; // Stylish angular slant
      coolShadesGroup.add(frameMesh);

      // Tinted Dark Lens
      const lensMesh = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.185, 0.035), shadesLensMat);
      lensMesh.position.set(xPos, 0, 0.002);
      lensMesh.rotation.z = xPos < 0 ? -0.045 : 0.045;
      coolShadesGroup.add(lensMesh);

      // Gold Corner Rivet Studs (Ray-Ban / luxury style)
      const rivetMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.04, 16), goldAccentMat);
      rivetMesh.rotation.x = Math.PI / 2;
      rivetMesh.position.set(xPos + (xPos < 0 ? -0.12 : 0.12), 0.085, 0.004);
      coolShadesGroup.add(rivetMesh);

      // Dual Comic / Anime Glossy Reflection Glints
      const glint1 = new THREE.Mesh(new THREE.PlaneGeometry(0.024, 0.14), glintMat);
      glint1.rotation.z = -0.65;
      glint1.position.set(xPos + 0.035, 0.01, 0.024);
      coolShadesGroup.add(glint1);

      const glint2 = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.09), glintMat);
      glint2.rotation.z = -0.65;
      glint2.position.set(xPos + 0.065, -0.01, 0.024);
      coolShadesGroup.add(glint2);
    });

    // D. Left & Right Side Temples (Arms extending back along the head towards ear discs)
    const leftTemple = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.034, 0.44), shadesMat);
    leftTemple.position.set(-0.375, 0.08, -0.21);
    leftTemple.rotation.y = 0.075;
    coolShadesGroup.add(leftTemple);

    const leftHinge = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.024, 0.02), goldAccentMat);
    leftHinge.position.set(-0.375, 0.085, 0.0);
    coolShadesGroup.add(leftHinge);

    const leftEarHook = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.05, 8, 8), shadesMat);
    leftEarHook.position.set(-0.36, 0.065, -0.42);
    leftEarHook.rotation.x = -0.45;
    coolShadesGroup.add(leftEarHook);

    const rightTemple = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.034, 0.44), shadesMat);
    rightTemple.position.set(0.375, 0.08, -0.21);
    rightTemple.rotation.y = -0.075;
    coolShadesGroup.add(rightTemple);

    const rightHinge = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.024, 0.02), goldAccentMat);
    rightHinge.position.set(0.375, 0.085, 0.0);
    coolShadesGroup.add(rightHinge);

    const rightEarHook = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.05, 8, 8), shadesMat);
    rightEarHook.position.set(0.36, 0.065, -0.42);
    rightEarHook.rotation.x = -0.45;
    coolShadesGroup.add(rightEarHook);

    // 16. DJ HEADPHONES & FLOATING MUSIC NOTES (Matching user reference image)
    const djHeadphonesGroup = new THREE.Group();
    // Default scale handles smooth lerp
    djHeadphonesGroup.scale.set(wearHeadphonesRef.current ? 1.0 : 0.001, wearHeadphonesRef.current ? 1.0 : 0.001, wearHeadphonesRef.current ? 1.0 : 0.001);
    headGroup.add(djHeadphonesGroup);

    // Premium headphone materials
    const headphoneBandMat = new THREE.MeshStandardMaterial({
      color: 0x111622, // Matte dark obsidian / carbon black
      roughness: 0.32,
      metalness: 0.65,
    });
    const headphoneRedMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant crimson red top accent cushion stripe from image
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.45,
    });
    const hingeSilverMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db, // Brushed chrome / metallic silver pivot slider
      roughness: 0.2,
      metalness: 0.92,
    });
    const earCupHousingMat = new THREE.MeshStandardMaterial({
      color: 0x161b26, // Outer earcup housing dark slate
      roughness: 0.25,
      metalness: 0.7,
    });
    const earCushionMat = new THREE.MeshStandardMaterial({
      color: 0x090d15, // Soft plush dark leather cushion
      roughness: 0.88,
    });
    const headphoneNeonMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff, // Glowing neon cyan / electric blue outer ring
      emissive: 0x00e1ff,
      emissiveIntensity: 2.8,
      roughness: 0.1,
    });
    const centerPlateMat = new THREE.MeshStandardMaterial({
      color: 0x0c101c,
      roughness: 0.3,
      metalness: 0.8,
    });

    // A. Smooth Curved Headband Arch over helmet
    const bandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.76, 0.22, 0.0),
      new THREE.Vector3(-0.70, 0.46, 0.02),
      new THREE.Vector3(-0.48, 0.66, 0.03),
      new THREE.Vector3(0.0, 0.72, 0.04),
      new THREE.Vector3(0.48, 0.66, 0.03),
      new THREE.Vector3(0.70, 0.46, 0.02),
      new THREE.Vector3(0.76, 0.22, 0.0),
    ]);

    const bandTubeGeo = new THREE.TubeGeometry(bandCurve, 40, 0.048, 16, false);
    const bandMesh = new THREE.Mesh(bandTubeGeo, headphoneBandMat);
    djHeadphonesGroup.add(bandMesh);

    // B. Signature Red Accent Stripe along top of band (exact match to image)
    const redStripeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.46, 0.68, 0.03),
      new THREE.Vector3(-0.25, 0.74, 0.038),
      new THREE.Vector3(0.0, 0.75, 0.042),
      new THREE.Vector3(0.25, 0.74, 0.038),
      new THREE.Vector3(0.46, 0.68, 0.03),
    ]);
    const redStripeGeo = new THREE.TubeGeometry(redStripeCurve, 24, 0.018, 12, false);
    const redStripeMesh = new THREE.Mesh(redStripeGeo, headphoneRedMat);
    djHeadphonesGroup.add(redStripeMesh);

    // C. Left & Right Silver Adjustment Sliders & Pivots
    [-0.76, 0.76].forEach((xPos) => {
      const slider = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.08), hingeSilverMat);
      slider.position.set(xPos, 0.22, 0.0);
      slider.rotation.z = xPos < 0 ? 0.35 : -0.35;
      djHeadphonesGroup.add(slider);

      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), hingeSilverMat);
      pivot.rotation.x = Math.PI / 2;
      pivot.position.set(xPos + (xPos < 0 ? -0.02 : 0.02), 0.18, 0.0);
      djHeadphonesGroup.add(pivot);
    });

    // D. Left & Right Large Ear Cups with Neon Cyan Glowing Ring
    const earcupX = headWidth * 0.48 + 0.12; // ~0.84
    [-earcupX, earcupX].forEach((xPos, idx) => {
      const isLeft = idx === 0;
      const cupGroup = new THREE.Group();
      cupGroup.position.set(xPos, 0.16, 0.0);
      djHeadphonesGroup.add(cupGroup);

      // 1. Soft Plush Inner Cushion Earpad
      const cushionGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.075, 32);
      cushionGeo.rotateZ(Math.PI / 2);
      const cushionMesh = new THREE.Mesh(cushionGeo, earCushionMat);
      cushionMesh.position.set(isLeft ? 0.045 : -0.045, 0, 0);
      cupGroup.add(cushionMesh);

      // 2. Main Earcup Outer Beveled Housing
      const housingGeo = new THREE.CylinderGeometry(0.25, 0.27, 0.13, 32);
      housingGeo.rotateZ(Math.PI / 2);
      const housingMesh = new THREE.Mesh(housingGeo, earCupHousingMat);
      housingMesh.position.set(isLeft ? -0.04 : 0.04, 0, 0);
      cupGroup.add(housingMesh);

      // 3. Glowing Neon Cyan Circular LED Ring (The signature look from the photo!)
      const neonRingGeo = new THREE.TorusGeometry(0.18, 0.034, 16, 36);
      neonRingGeo.rotateY(Math.PI / 2);
      const neonRingMesh = new THREE.Mesh(neonRingGeo, headphoneNeonMat);
      neonRingMesh.position.set(isLeft ? -0.11 : 0.11, 0, 0);
      cupGroup.add(neonRingMesh);

      // 4. Center Recessed Disc
      const centerDiscGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.02, 32);
      centerDiscGeo.rotateZ(Math.PI / 2);
      const centerDiscMesh = new THREE.Mesh(centerDiscGeo, centerPlateMat);
      centerDiscMesh.position.set(isLeft ? -0.105 : 0.105, 0, 0);
      cupGroup.add(centerDiscMesh);

      // 5. Glowing Center Cyan Dot
      const centerDotGeo = new THREE.SphereGeometry(0.04, 16, 16);
      centerDotGeo.scale(0.5, 1, 1);
      const centerDotMesh = new THREE.Mesh(centerDotGeo, headphoneNeonMat);
      centerDotMesh.position.set(isLeft ? -0.12 : 0.12, 0, 0);
      cupGroup.add(centerDotMesh);
    });

    // E. Floating 3D Music Notes (♫ and ♪) in vibrant glowing cyan/sky-blue
    const musicNotesGroup = new THREE.Group();
    musicNotesGroup.scale.set(wearHeadphonesRef.current ? 1.0 : 0.001, wearHeadphonesRef.current ? 1.0 : 0.001, wearHeadphonesRef.current ? 1.0 : 0.001);
    robotRoot.add(musicNotesGroup);

    const noteCyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.5,
      roughness: 0.15,
      metalness: 0.1,
    });
    const noteBlueMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 1.7,
      roughness: 0.15,
      metalness: 0.1,
    });

    const musicNoteMeshes: { mesh: THREE.Group; baseY: number; baseRotZ: number; speed: number; phase: number }[] = [];

    // Helper: Create 3D Beamed Note (♫)
    const createBeamedNote = (mat: THREE.Material) => {
      const g = new THREE.Group();
      [-0.08, 0.08].forEach((hx) => {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), mat);
        head.scale.set(1.25, 0.82, 0.45);
        head.rotation.z = -0.35;
        head.position.set(hx, 0, 0);
        g.add(head);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), mat);
        stem.position.set(hx + 0.045, 0.10, 0);
        g.add(stem);
      });
      // Horizontal Beam
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.034, 0.018), mat);
      beam.position.set(0.045, 0.20, 0);
      beam.rotation.z = 0.08;
      g.add(beam);
      return g;
    };

    // Helper: Create 3D Quarter Note (♪)
    const createQuarterNote = (mat: THREE.Material) => {
      const g = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 14), mat);
      head.scale.set(1.25, 0.82, 0.45);
      head.rotation.z = -0.35;
      g.add(head);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8), mat);
      stem.position.set(0.05, 0.11, 0);
      g.add(stem);

      // Curved Flag
      const flagGeo = new THREE.TorusGeometry(0.055, 0.014, 8, 16, Math.PI * 0.7);
      const flag = new THREE.Mesh(flagGeo, mat);
      flag.position.set(0.075, 0.19, 0);
      flag.rotation.z = -0.4;
      g.add(flag);
      return g;
    };

    // Instantiate 5 Notes placed like in reference image (3 on right, 2 on left)
    const noteConfigs = [
      { type: 'beam', x: -1.05, y: 0.65, z: 0.15, scale: 0.95, mat: noteCyanMat, speed: 2.4, phase: 0 },
      { type: 'single', x: -1.15, y: 0.28, z: 0.12, scale: 0.85, mat: noteBlueMat, speed: 2.8, phase: 1.8 },
      { type: 'beam', x: 1.08, y: 0.68, z: 0.15, scale: 1.05, mat: noteCyanMat, speed: 2.5, phase: 1.0 },
      { type: 'single', x: 1.18, y: 0.32, z: 0.12, scale: 0.9, mat: noteBlueMat, speed: 3.1, phase: 2.5 },
      { type: 'single', x: 0.92, y: 0.92, z: 0.05, scale: 0.8, mat: noteCyanMat, speed: 2.2, phase: 3.2 },
    ];

    noteConfigs.forEach((cfg) => {
      const nMesh = cfg.type === 'beam' ? createBeamedNote(cfg.mat) : createQuarterNote(cfg.mat);
      nMesh.position.set(cfg.x, cfg.y, cfg.z);
      nMesh.scale.setScalar(cfg.scale);
      musicNotesGroup.add(nMesh);
      musicNoteMeshes.push({
        mesh: nMesh,
        baseY: cfg.y,
        baseRotZ: 0,
        speed: cfg.speed,
        phase: cfg.phase,
      });
    });

    // 17. 3D MOVIE POPCORN & 3D GLASSES (movie_popcorn)
    const movieGlassesGroup = new THREE.Group();
    movieGlassesGroup.position.set(0, 0.025, (headDepth / 2) * 0.9 + 0.045);
    movieGlassesGroup.scale.set(0.001, 0.001, 0.001);
    headGroup.add(movieGlassesGroup);

    const whiteFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const redLensMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const cyanLensMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 });

    // 3D Glass Brow & Bridge
    const movieBrow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.03), whiteFrameMat);
    movieBrow.position.set(0, 0.09, 0);
    movieGlassesGroup.add(movieBrow);

    const movieBridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.03), whiteFrameMat);
    movieBridge.position.set(0, 0.02, 0);
    movieGlassesGroup.add(movieBridge);

    const redLens = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.20, 0.028), redLensMat);
    redLens.position.set(-0.165, 0, 0.005);
    movieGlassesGroup.add(redLens);

    const cyanLens = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.20, 0.028), cyanLensMat);
    cyanLens.position.set(0.165, 0, 0.005);
    movieGlassesGroup.add(cyanLens);

    // Movie Glasses Temple Arms
    [-0.365, 0.365].forEach((xPos) => {
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.44), whiteFrameMat);
      temple.position.set(xPos, 0.08, -0.21);
      temple.rotation.y = xPos < 0 ? 0.075 : -0.075;
      movieGlassesGroup.add(temple);
    });

    // Popcorn Bucket in left hand / lap
    const popcornGroup = new THREE.Group();
    popcornGroup.position.set(-0.35, -0.45, 0.55);
    popcornGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(popcornGroup);

    const bucketMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const bucketMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.44, 24), bucketMat);
    popcornGroup.add(bucketMesh);

    // White stripes on red bucket
    const whiteStripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let s = 0; s < 6; s++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.42), whiteStripeMat);
      const ang = (s / 6) * Math.PI * 2;
      stripe.position.set(Math.cos(ang) * 0.215, 0, Math.sin(ang) * 0.215);
      stripe.rotation.y = -ang + Math.PI / 2;
      popcornGroup.add(stripe);
    }

    // Overflowing popcorn kernels
    const popcornKernelMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 });
    for (let k = 0; k < 14; k++) {
      const kernel = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), popcornKernelMat);
      const ang = (k / 14) * Math.PI * 2;
      const r = Math.random() * 0.16;
      kernel.position.set(Math.cos(ang) * r, 0.22 + Math.random() * 0.06, Math.sin(ang) * r);
      popcornGroup.add(kernel);
    }

    // 18. CONSOLE GAMEPAD CONTROLLER (gamer_headset)
    const gamepadGroup = new THREE.Group();
    gamepadGroup.position.set(0, -0.36, 0.52);
    gamepadGroup.rotation.x = 0.45;
    gamepadGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(gamepadGroup);

    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.7 });
    const padBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.06), padMat);
    gamepadGroup.add(padBody);

    // Left & Right handles
    [-0.20, 0.20].forEach((hx, idx) => {
      const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.18, 12, 12), padMat);
      handle.position.set(hx, -0.06, 0);
      handle.rotation.z = idx === 0 ? 0.4 : -0.4;
      gamepadGroup.add(handle);
    });

    // Thumbsticks
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5 });
    [-0.10, 0.10].forEach((sx) => {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04), stickMat);
      stick.rotation.x = Math.PI / 2;
      stick.position.set(sx, -0.04, 0.04);
      gamepadGroup.add(stick);
    });

    // Action buttons (colored dots)
    const btnColors = [0x10b981, 0xef4444, 0x3b82f6, 0xf59e0b];
    btnColors.forEach((col, idx) => {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color: col }));
      const angle = (idx / 4) * Math.PI * 2;
      btn.position.set(0.14 + Math.cos(angle) * 0.04, 0.04 + Math.sin(angle) * 0.04, 0.035);
      gamepadGroup.add(btn);
    });

    // 19. CHEF HAT & FRYING PAN (chef_cooking)
    const chefHatGroup = new THREE.Group();
    chefHatGroup.position.set(0, 0.62, 0);
    chefHatGroup.scale.set(0.001, 0.001, 0.001);
    headGroup.add(chefHatGroup);

    const chefWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    // Hat base band
    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.14, 24), chefWhiteMat);
    chefHatGroup.add(hatBand);
    // Puffy hat top
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.38, 24), chefWhiteMat);
    hatTop.position.set(0, 0.22, 0);
    chefHatGroup.add(hatTop);

    // Frying Pan in right hand
    const fryingPanGroup = new THREE.Group();
    fryingPanGroup.position.set(0.38, -0.38, 0.55);
    fryingPanGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(fryingPanGroup);

    const panMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.8 });
    const panMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.06, 24), panMat);
    fryingPanGroup.add(panMesh);

    const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32), panMat);
    panHandle.rotation.x = Math.PI / 2;
    panHandle.position.set(0, 0, -0.22);
    fryingPanGroup.add(panHandle);

    // Tossed food particles
    const tossedFoods: { mesh: THREE.Mesh; seed: number }[] = [];
    const foodColors = [0x22c55e, 0xf97316, 0xeab308];
    for (let f = 0; f < 5; f++) {
      const foodMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 8, 8),
        new THREE.MeshStandardMaterial({ color: foodColors[f % foodColors.length] })
      );
      foodMesh.position.set((Math.random() - 0.5) * 0.18, 0.1, (Math.random() - 0.5) * 0.18);
      fryingPanGroup.add(foodMesh);
      tossedFoods.push({ mesh: foodMesh, seed: f });
    }

    // 20. SLEEPING CAT & FLUFFY PILLOW (sleeping_cat)
    const sleepingCatGroup = new THREE.Group();
    sleepingCatGroup.position.set(0, -0.85, 0.15);
    sleepingCatGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(sleepingCatGroup);

    // Soft Blue Pillow
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.6 });
    const pillowMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.85, 12, 12, 12), pillowMat);
    pillowMesh.position.set(0, -0.22, 0);
    sleepingCatGroup.add(pillowMesh);

    // Curled Ginger Tabby Cat
    const catGingerMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 });
    const catWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.7 });

    const catBody = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 16, 24, Math.PI * 1.6), catGingerMat);
    catBody.rotation.x = Math.PI / 2;
    catBody.position.set(0.35, 0, 0.05);
    sleepingCatGroup.add(catBody);

    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), catGingerMat);
    catHead.position.set(0.50, 0.04, 0.05);
    sleepingCatGroup.add(catHead);

    // Cat ears
    [-0.04, 0.04].forEach((zOff) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), catGingerMat);
      ear.position.set(0.53, 0.14, 0.05 + zOff);
      sleepingCatGroup.add(ear);
    });

    // 21. SUPERHERO CAPE (superhero_cape)
    const superheroCapeGroup = new THREE.Group();
    superheroCapeGroup.position.set(0, 0.02, -0.42);
    superheroCapeGroup.scale.set(0.001, 0.001, 0.001);
    bodyGroup.add(superheroCapeGroup);

    const capeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const capeGeo = new THREE.PlaneGeometry(0.85, 1.35, 8, 8);
    const capeMesh = new THREE.Mesh(capeGeo, capeMat);
    capeMesh.rotation.x = 0.32;
    capeMesh.position.set(0, -0.55, -0.15);
    superheroCapeGroup.add(capeMesh);

    // 22. NEON CYAN SKATEBOARD (skateboard)
    const skateboardGroup = new THREE.Group();
    skateboardGroup.position.set(0, -1.22, 0);
    skateboardGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(skateboardGroup);

    const skateDeckMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
    });
    const skateDeck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 1.25), skateDeckMat);
    skateboardGroup.add(skateDeck);

    // Wheels (4 glowing wheels)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
    [
      [-0.18, -0.06, 0.42],
      [0.18, -0.06, 0.42],
      [-0.18, -0.06, -0.42],
      [0.18, -0.06, -0.42],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      skateboardGroup.add(wheel);
    });

    // 23. GRADUATION CAP & DIPLOMA SCROLL (graduate_cap)
    const graduateCapGroup = new THREE.Group();
    graduateCapGroup.position.set(0, 0.58, 0);
    graduateCapGroup.scale.set(0.001, 0.001, 0.001);
    headGroup.add(graduateCapGroup);

    const gradBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const goldTasselMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.8 });

    // Mortarboard square board
    const mortarboard = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.04, 1.05), gradBlackMat);
    mortarboard.rotation.y = Math.PI / 4;
    mortarboard.position.set(0, 0.08, 0);
    graduateCapGroup.add(mortarboard);

    // Skull cap base
    const skullCap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.14, 24), gradBlackMat);
    graduateCapGroup.add(skullCap);

    // Golden tassel dangling over side
    const tasselCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32), goldTasselMat);
    tasselCord.position.set(0.42, -0.05, 0.22);
    graduateCapGroup.add(tasselCord);

    // Diploma scroll held in left hand
    const diplomaGroup = new THREE.Group();
    diplomaGroup.position.set(-0.38, -0.32, 0.48);
    diplomaGroup.rotation.x = -0.5;
    diplomaGroup.rotation.z = 0.3;
    diplomaGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(diplomaGroup);

    const diplomaMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.5 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const diplomaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 16), diplomaMat);
    diplomaGroup.add(diplomaMesh);

    const ribbonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.06, 16), ribbonMat);
    diplomaGroup.add(ribbonMesh);

    // 24. GYM DUMBBELLS (dumbbell_gym)
    const dumbbellGroup = new THREE.Group();
    dumbbellGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(dumbbellGroup);

    const dumbbellMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.8 });
    const dumbbellBarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.9 });

    const createDumbbell = () => {
      const dg = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32), dumbbellBarMat);
      bar.rotation.x = Math.PI / 2;
      dg.add(bar);

      [-0.14, 0.14].forEach((posZ) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), dumbbellMat);
        plate.rotation.x = Math.PI / 2;
        plate.position.set(0, 0, posZ);
        dg.add(plate);
      });
      return dg;
    };

    const dumbbellL = createDumbbell();
    dumbbellL.position.set(-0.52, -0.42, 0.42);
    dumbbellGroup.add(dumbbellL);

    const dumbbellR = createDumbbell();
    dumbbellR.position.set(0.52, -0.42, 0.42);
    dumbbellGroup.add(dumbbellR);

    // 25. ROMANTIC RED ROSE (rose_romance)
    const roseGroup = new THREE.Group();
    roseGroup.position.set(0.36, -0.28, 0.52);
    roseGroup.rotation.x = -0.4;
    roseGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(roseGroup);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
    const rosePetalMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, emissive: 0x991b1b, emissiveIntensity: 0.4 });

    const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.38), stemMat);
    roseGroup.add(stemMesh);

    const flowerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), rosePetalMat);
    flowerMesh.position.set(0, 0.20, 0);
    roseGroup.add(flowerMesh);

    // 26. ZEN MEDITATION FLOATING LEAVES (zen_meditation)
    const zenLeavesGroup = new THREE.Group();
    zenLeavesGroup.scale.set(0.001, 0.001, 0.001);
    robotRoot.add(zenLeavesGroup);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4, side: THREE.DoubleSide });
    const leafMeshes: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; yOffset: number }[] = [];
    for (let l = 0; l < 8; l++) {
      const leafGeo = new THREE.PlaneGeometry(0.12, 0.07);
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      zenLeavesGroup.add(leafMesh);
      leafMeshes.push({
        mesh: leafMesh,
        angle: (l / 8) * Math.PI * 2,
        radius: 0.65 + (l % 2) * 0.2,
        speed: 1.8 + (l % 3) * 0.4,
        yOffset: -0.2 + (l % 4) * 0.25,
      });
    }

    // Soft Shadow Disc under the floating robot
    const shadowGeo = new THREE.CircleGeometry(0.65, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.35, 0);
    scene.add(shadowMesh);

    // 6. Dynamic OLED Screen Canvas Renderer Covering All 16 Poses
    let blinkValue = 1.0;
    let blinkTimer = 0;

    const drawFaceScreen = (curState: string, volume: number, activeMovement: RobotMovement, elapsedTime: number = 0) => {
      ctx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);

      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);

      const glowGrad = ctx.createRadialGradient(256, 190, 20, 256, 190, 220);
      const isAmber = activeMovement === 'alert_warning' || curState === 'alert';
      const isRed = activeMovement === 'angry_fumes';
      glowGrad.addColorStop(0, isRed ? 'rgba(239, 68, 68, 0.35)' : isAmber ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.18)');
      glowGrad.addColorStop(1, 'rgba(8, 13, 26, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);

      // Corner HUD Brackets
      ctx.strokeStyle = isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      const margin = 44;
      const bracketLen = 30;

      // 4 Brackets ⌜ ⌝ ⌞ ⌟
      ctx.beginPath();
      ctx.moveTo(margin, margin + bracketLen);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + bracketLen, margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(faceCanvas.width - margin - bracketLen, margin);
      ctx.lineTo(faceCanvas.width - margin, margin);
      ctx.lineTo(faceCanvas.width - margin, margin + bracketLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(margin, faceCanvas.height - margin - bracketLen);
      ctx.lineTo(margin, faceCanvas.height - margin);
      ctx.lineTo(margin + bracketLen, faceCanvas.height - margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(faceCanvas.width - margin - bracketLen, faceCanvas.height - margin);
      ctx.lineTo(faceCanvas.width - margin, faceCanvas.height - margin);
      ctx.lineTo(faceCanvas.width - margin, faceCanvas.height - margin - bracketLen);
      ctx.stroke();

      const leftEyeX = 188;
      const rightEyeX = 324;
      const eyeY = 185;

      ctx.strokeStyle = isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#38bdf8';
      ctx.fillStyle = isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#38bdf8';
      ctx.shadowColor = isRed ? 'rgba(239, 68, 68, 0.95)' : isAmber ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.95)';
      ctx.shadowBlur = 24;

      // =======================================================================
      // DISTINCT FACIAL EXPRESSIONS FOR ALL 16 ICONIC POSES
      // =======================================================================

      // 1. Thumbs-Up & Wink (R1,C3)
      if (activeMovement === 'thumbs_up') {
        // Left eye: big round glowing circle
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 34, 0, Math.PI * 2);
        ctx.fill();

        // Right eye: playful cute wink curve
        ctx.beginPath();
        ctx.lineWidth = 18;
        ctx.moveTo(rightEyeX - 38, eyeY + 12);
        ctx.quadraticCurveTo(rightEyeX, eyeY - 26, rightEyeX + 38, eyeY + 12);
        ctx.stroke();
      }
      // 2. In Love & Blushing (R2,C1)
      else if (activeMovement === 'in_love') {
        // Smiling curved eyes ^ ^
        const eyeW = 42;
        const eyeH = 38 * blinkValue;
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.lineWidth = 18;
          ctx.moveTo(cx - eyeW, eyeY + 12);
          ctx.quadraticCurveTo(cx, eyeY - eyeH, cx + eyeW, eyeY + 12);
          ctx.stroke();
        });

        // Soft pink blush ovals on cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.beginPath();
        ctx.ellipse(leftEyeX - 10, eyeY + 54, 24, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(rightEyeX + 10, eyeY + 54, 24, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
      }
      // 3. Confused / Question / Thinking (Reference Image Match)
      else if (activeMovement === 'confused_question') {
        // Futuristic UI Corner Framing Brackets from reference image:
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        const w = faceCanvas.width;
        const h = faceCanvas.height;
        const padX = 72;
        const padY = 52;
        const bArm = 24;

        // Top-Left: ⌜
        ctx.beginPath();
        ctx.moveTo(padX, padY + bArm);
        ctx.lineTo(padX, padY);
        ctx.lineTo(padX + bArm, padY);
        ctx.stroke();

        // Top-Right: ⌝
        ctx.beginPath();
        ctx.moveTo(w - padX - bArm, padY);
        ctx.lineTo(w - padX, padY);
        ctx.lineTo(w - padX, padY + bArm);
        ctx.stroke();

        // Bottom-Left: ⌞
        ctx.beginPath();
        ctx.moveTo(padX, h - padY - bArm);
        ctx.lineTo(padX, h - padY);
        ctx.lineTo(padX + bArm, h - padY);
        ctx.stroke();

        // Bottom-Right: ⌟
        ctx.beginPath();
        ctx.moveTo(w - padX - bArm, h - padY);
        ctx.lineTo(w - padX, h - padY);
        ctx.lineTo(w - padX, h - padY - bArm);
        ctx.stroke();

        // Left eye (viewer's left): Wide, glowing, inquisitive round circle
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(leftEyeX - 6, eyeY + 2, 42, 0, Math.PI * 2);
        ctx.fill();

        // Right eye (viewer's right): Expressive curved questioning wink/squint
        ctx.beginPath();
        ctx.arc(rightEyeX - 28, eyeY + 6, 12, Math.PI * 0.5, Math.PI * 1.5);
        ctx.bezierCurveTo(rightEyeX - 14, eyeY - 22, rightEyeX + 12, eyeY - 24, rightEyeX + 34, eyeY - 4);
        ctx.arc(rightEyeX + 34, eyeY + 7, 12, -Math.PI * 0.3, Math.PI * 0.6);
        ctx.bezierCurveTo(rightEyeX + 14, eyeY + 8, rightEyeX - 8, eyeY + 16, rightEyeX - 28, eyeY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // 4. Arms Crossed / Deadpan / Serious (R3,C2)
      else if (activeMovement === 'arms_crossed') {
        // Flat-top deadpan unimpressed eyes — — (half circle bottom, flat top)
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx - 36, eyeY - 4);
          ctx.lineTo(cx + 36, eyeY - 4);
          ctx.arc(cx, eyeY - 4, 34, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
        });
      }
      // 5. Sleeping / Snoozing (R4,C2)
      else if (activeMovement === 'sleeping_zzz') {
        // Serene closed downward curves — —
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.lineWidth = 14;
          ctx.moveTo(cx - 34, eyeY - 4);
          ctx.quadraticCurveTo(cx, eyeY + 22, cx + 34, eyeY - 4);
          ctx.stroke();
        });
      }
      // 6. Laptop Work (R2,C3)
      else if (activeMovement === 'laptop_work') {
        // Focused oval eyes looking downward towards screen
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx, eyeY + 12, 32, 42 * Math.max(0.12, blinkValue), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, eyeY + 18, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
        });
      }
      // 7. Direction Pointer (R2,C4)
      else if (activeMovement === 'point_direction') {
        // Focused oval eyes looking to the right towards point direction
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx + 10, eyeY, 32, 44 * Math.max(0.1, blinkValue), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + 18, eyeY - 6, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
        });
      }
      // 8. Peek Around Corner (R3,C4)
      else if (activeMovement === 'peek_corner') {
        // Wide curious round circle eyes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.arc(cx, eyeY, 34, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + 8, eyeY - 8, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
        });
      }
      // 9. Sad Crying Tears (R3,C1)
      else if (activeMovement === 'sad_crying') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx, eyeY + 4, 30, 34, 0, 0, Math.PI * 2);
          ctx.fill();

          // Animated streaming teardrops
          for (let t = 0; t < 2; t++) {
            const tearY = eyeY + 30 + ((elapsedTime * 90 + t * 45) % 85);
            ctx.beginPath();
            ctx.ellipse(cx, tearY, 7, 12, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Drooping mouth line
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(222, 276);
        ctx.quadraticCurveTo(256, 252, 290, 276);
        ctx.stroke();
      }
      // 10. Angry Fumes / Furious Red (R3,C3)
      else if (activeMovement === 'angry_fumes') {
        // Slanted furious red eyes
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 32, eyeY - 24);
        ctx.lineTo(leftEyeX + 32, eyeY + 4);
        ctx.lineTo(leftEyeX + 24, eyeY + 28);
        ctx.lineTo(leftEyeX - 28, eyeY + 20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rightEyeX + 32, eyeY - 24);
        ctx.lineTo(rightEyeX - 32, eyeY + 4);
        ctx.lineTo(rightEyeX - 24, eyeY + 28);
        ctx.lineTo(rightEyeX + 28, eyeY + 20);
        ctx.closePath();
        ctx.fill();
      }
      // 11. Dizzy Swirls (R3,C5)
      else if (activeMovement === 'dizzy_stars') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 7;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 4.5; a += 0.25) {
            const rad = 6 + a * 6;
            const spin = elapsedTime * 4.5;
            const x = cx + Math.cos(a + spin) * rad;
            const y = eyeY + Math.sin(a + spin) * rad;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }
      // 12. Laughing Cheerful > < (R1,C5)
      else if (activeMovement === 'laughing_cheer') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        // Left eye: >
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 26, eyeY - 24);
        ctx.lineTo(leftEyeX + 18, eyeY);
        ctx.lineTo(leftEyeX - 26, eyeY + 24);
        ctx.stroke();
        // Right eye: <
        ctx.beginPath();
        ctx.moveTo(rightEyeX + 26, eyeY - 24);
        ctx.lineTo(rightEyeX - 18, eyeY);
        ctx.lineTo(rightEyeX + 26, eyeY + 24);
        ctx.stroke();
      }
      // 13. Shocked Gasp (R2,C5)
      else if (activeMovement === 'shocked_gasp') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.arc(cx, eyeY - 4, 38, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.beginPath();
        ctx.ellipse(256, 270, 20, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 14. Polite Bow (R5,C6)
      else if (activeMovement === 'polite_bow') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(cx - 30, eyeY - 8);
          ctx.quadraticCurveTo(cx, eyeY + 18, cx + 30, eyeY - 8);
          ctx.stroke();
        });
      }
      // 15. Frustrated Headache (R5,C3)
      else if (activeMovement === 'frustrated_headache') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(cx - 32, eyeY);
          ctx.lineTo(cx + 32, eyeY);
          ctx.stroke();
          // Stress marks |||
          ctx.lineWidth = 4;
          for (let s = -1; s <= 1; s++) {
            ctx.beginPath();
            ctx.moveTo(cx + s * 12, eyeY - 45);
            ctx.lineTo(cx + s * 12, eyeY - 22);
            ctx.stroke();
          }
        });
      }
      // 16. Thinking Suspicious Dots (R2,C4)
      else if (activeMovement === 'thinking_dots') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx + 12, eyeY, 26, 38, 0.2, 0, Math.PI * 2);
          ctx.fill();
        });
        // 3 floating dots ...
        ctx.fillStyle = '#38bdf8';
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          ctx.arc(380 + d * 18, 120, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 17. Joyful Smile Eyes ^ ^ (wave_hello, cheer_both, aha_idea, flying_jump, relaxed_chill, hug_heart, party_confetti)
      else if (
        activeMovement === 'wave_hello' ||
        activeMovement === 'cheer_both' ||
        activeMovement === 'aha_idea' ||
        activeMovement === 'flying_jump' ||
        activeMovement === 'relaxed_chill' ||
        activeMovement === 'hug_heart' ||
        activeMovement === 'party_confetti' ||
        activeMovement === 'explain_celebrate' ||
        activeMovement === 'chef_cooking' ||
        activeMovement === 'skateboard'
      ) {
        const eyeW = 42;
        const eyeH = 38 * blinkValue;
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.lineWidth = 18;
          ctx.moveTo(cx - eyeW, eyeY + 12);
          ctx.quadraticCurveTo(cx, eyeY - eyeH, cx + eyeW, eyeY + 12);
          ctx.stroke();
        });

        // Chef playful tongue
        if (activeMovement === 'chef_cooking') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(266, 276, 12, 0, Math.PI);
          ctx.fill();
        }
      }
      // 18. Cool Swagger Sunglasses (cool_shades)
      else if (activeMovement === 'cool_shades') {
        // Left eye: cool wink
        ctx.beginPath();
        ctx.lineWidth = 16;
        ctx.moveTo(leftEyeX - 34, eyeY + 8);
        ctx.quadraticCurveTo(leftEyeX, eyeY - 24, leftEyeX + 34, eyeY + 8);
        ctx.stroke();

        // Right eye: wide confident glowing gaze with bright reflection
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rightEyeX + 10, eyeY - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isAmber ? '#f59e0b' : '#38bdf8';

        // Cool smirking mouth
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(224, 276);
        ctx.quadraticCurveTo(260, 292, 292, 260);
        ctx.stroke();

        // Twinkling bling diamond star on tooth! ✨
        const gleamSize = (Math.sin(elapsedTime * 6.0) + 1.0) * 4.5;
        if (gleamSize > 2) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(292, 260 - gleamSize * 1.5);
          ctx.quadraticCurveTo(292, 260, 292 + gleamSize * 1.5, 260);
          ctx.quadraticCurveTo(292, 260, 292, 260 + gleamSize * 1.5);
          ctx.quadraticCurveTo(292, 260, 292 - gleamSize * 1.5, 260);
          ctx.closePath();
          ctx.fill();
        }
      }
      // 19. DJ Beats (dj_headphones)
      else if (activeMovement === 'dj_headphones') {
        // Grooving closed curved eyes with musical notes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.lineWidth = 18;
          ctx.moveTo(cx - 36, eyeY + 8);
          ctx.quadraticCurveTo(cx, eyeY - 28, cx + 36, eyeY + 8);
          ctx.stroke();
        });
        // Tiny notes on screen
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('♫', 130, 220);
        ctx.fillText('♪', 350, 210);
      }
      // 20. Movie Popcorn (movie_popcorn)
      else if (activeMovement === 'movie_popcorn') {
        // Wide captivated eyes watching movie
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.arc(cx, eyeY - 4, 34, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + 8, eyeY - 12, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
        });
        // Chewing mouth
        const chewY = Math.sin(elapsedTime * 6) * 8;
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.moveTo(234, 270 + chewY);
        ctx.quadraticCurveTo(256, 284 - chewY, 278, 270 + chewY);
        ctx.stroke();
      }
      // 21. Pro Gamer (gamer_headset)
      else if (activeMovement === 'gamer_headset') {
        // Sharp focused determined gamer eyes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx - 36, eyeY - 16);
          ctx.lineTo(cx + 36, eyeY);
          ctx.lineTo(cx + 28, eyeY + 22);
          ctx.lineTo(cx - 30, eyeY + 14);
          ctx.closePath();
          ctx.fill();

          // Glowing HUD reticle
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - 24, eyeY - 10, 48, 28);
        });
      }
      // 22. Graduate Honors (graduate_cap)
      else if (activeMovement === 'graduate_cap') {
        // Sparkling star eyes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(cx, eyeY, 32, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx - 6, eyeY - 6, 8, 0, Math.PI * 2);
          ctx.arc(cx + 10, eyeY + 8, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        // Proud smile
        ctx.beginPath();
        ctx.lineWidth = 12;
        ctx.moveTo(218, 268);
        ctx.quadraticCurveTo(256, 296, 294, 268);
        ctx.stroke();
      }
      // 23. Gym Bodybuilder (dumbbell_gym)
      else if (activeMovement === 'dumbbell_gym') {
        // Intense grit determination eyes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx - 34, eyeY - 14);
          ctx.lineTo(cx + 34, eyeY + 2);
          ctx.lineTo(cx + 28, eyeY + 24);
          ctx.lineTo(cx - 30, eyeY + 16);
          ctx.closePath();
          ctx.fill();
        });
        // Gritting determination mouth
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.moveTo(226, 272);
        ctx.lineTo(286, 272);
        ctx.stroke();
      }
      // 24. Romantic Rose (rose_romance)
      else if (activeMovement === 'rose_romance') {
        // Left eye: round sparkling gaze, Right eye: charming wink
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.lineWidth = 16;
        ctx.moveTo(rightEyeX - 36, eyeY + 8);
        ctx.quadraticCurveTo(rightEyeX, eyeY - 26, rightEyeX + 36, eyeY + 8);
        ctx.stroke();

        // Rosy blushing cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
        ctx.beginPath();
        ctx.ellipse(leftEyeX - 12, eyeY + 48, 22, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX + 12, eyeY + 48, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
      }
      // 25. Zen Meditation & Sleeping Cat (zen_meditation / sleeping_cat)
      else if (activeMovement === 'zen_meditation' || activeMovement === 'sleeping_cat') {
        // Serene calm lotus closed eyes
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.lineWidth = 14;
          ctx.moveTo(cx - 34, eyeY - 2);
          ctx.quadraticCurveTo(cx, eyeY + 22, cx + 34, eyeY - 2);
          ctx.stroke();
        });
      }
      // 26. Superhero Soar (superhero_cape)
      else if (activeMovement === 'superhero_cape') {
        // Determined heroic eyes angled forward
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx, eyeY - 4, 30, 40, 0.1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + 6, eyeY - 10, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
        });
      }
      // 10. Caution Warning Alert (alert_warning)
      else if (activeMovement === 'alert_warning' || curState === 'alert') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx, eyeY, 30, 42, 0, 0, Math.PI * 2);
          ctx.lineWidth = 14;
          ctx.stroke();
          ctx.fillRect(cx - 5, eyeY - 20, 10, 24);
          ctx.beginPath();
          ctx.arc(cx, eyeY + 16, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // 11. Thinking / Pondering (explain_ponder)
      else if (activeMovement === 'explain_ponder' || curState === 'thinking') {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.ellipse(cx - 8, eyeY - 12, 26, 36 * Math.max(0.2, blinkValue), -0.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // 12. Blinking Shut
      else if (blinkValue < 0.2) {
        [leftEyeX, rightEyeX].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx - 36, eyeY);
          ctx.lineTo(cx + 36, eyeY);
          ctx.lineWidth = 10;
          ctx.stroke();
        });
      }
      // 13. EXACT REST POSE & Focused (rest, goodbye_wave, focused_listen)
      else {
        if (Boolean(wearHeadphonesRef.current) || (activeMovement as string) === 'dj_headphones') {
          // Signature happy curved smiling arch eyes ^ ^ from user reference image
          const eyeW = 42;
          const eyeH = 34 * Math.max(0.1, blinkValue);
          [leftEyeX, rightEyeX].forEach((cx) => {
            ctx.beginPath();
            ctx.lineWidth = 18;
            ctx.lineCap = 'round';
            ctx.moveTo(cx - eyeW, eyeY + 12);
            ctx.quadraticCurveTo(cx, eyeY - eyeH, cx + eyeW, eyeY + 12);
            ctx.stroke();
          });
        } else {
          [leftEyeX, rightEyeX].forEach((cx) => {
            ctx.beginPath();
            ctx.ellipse(cx, eyeY, 32, 46 * Math.max(0.08, blinkValue), 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#cffafe';
            ctx.beginPath();
            ctx.ellipse(cx - 3, eyeY - 8, 18, 26 * Math.max(0.08, blinkValue), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isAmber ? '#f59e0b' : '#38bdf8';
          });
        }
      }

      // Mouth Display:
      // In quiet resting poses, NO mouth line (clean robot aesthetic).
      // Only when speaking, mouth articulates cleanly to voice volume!
      if (curState === 'speaking' || volume > 0.05) {
        ctx.beginPath();
        const mouthY = 270;
        const openH = Math.max(14, volume * 42);
        ctx.lineWidth = 10;
        ctx.moveTo(210, mouthY);
        ctx.quadraticCurveTo(256, mouthY + openH, 302, mouthY);
        ctx.quadraticCurveTo(256, mouthY - openH * 0.4, 210, mouthY);
        ctx.fillStyle = isAmber ? '#fde68a' : '#67e8f9';
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      faceTexture.needsUpdate = true;
    };

    // Draw dynamic data on the Hologram Screen
    const drawHoloScreen = (time: number) => {
      holoCtx.clearRect(0, 0, holoCanvas.width, holoCanvas.height);
      holoCtx.fillStyle = 'rgba(8, 28, 48, 0.85)';
      holoCtx.fillRect(0, 0, holoCanvas.width, holoCanvas.height);

      holoCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      holoCtx.lineWidth = 1;
      for (let x = 0; x < holoCanvas.width; x += 40) {
        holoCtx.beginPath();
        holoCtx.moveTo(x, 0);
        holoCtx.lineTo(x, holoCanvas.height);
        holoCtx.stroke();
      }
      for (let y = 0; y < holoCanvas.height; y += 40) {
        holoCtx.beginPath();
        holoCtx.moveTo(0, y);
        holoCtx.lineTo(holoCanvas.width, y);
        holoCtx.stroke();
      }

      holoCtx.fillStyle = '#38bdf8';
      holoCtx.font = 'bold 20px monospace';
      holoCtx.fillText('CAMPUS INTELLIGENCE // AI LIVE', 30, 45);

      const bars = [65, 88, 72, 94, 82, 90];
      bars.forEach((val, idx) => {
        const barX = 40 + idx * 72;
        const barH = (val * (0.8 + Math.sin(time * 3 + idx) * 0.2)) * 1.3;
        const grad = holoCtx.createLinearGradient(0, 240, 0, 240 - barH);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#38bdf8');
        holoCtx.fillStyle = grad;
        holoCtx.fillRect(barX, 240 - barH, 44, barH);

        holoCtx.fillStyle = '#94a3b8';
        holoCtx.font = '12px monospace';
        holoCtx.fillText(`WK${idx + 1}`, barX + 8, 260);
      });

      const scanY = ((time * 80) % holoCanvas.height);
      holoCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      holoCtx.lineWidth = 3;
      holoCtx.beginPath();
      holoCtx.moveTo(0, scanY);
      holoCtx.lineTo(holoCanvas.width, scanY);
      holoCtx.stroke();

      holoCtx.fillStyle = '#10b981';
      holoCtx.font = 'bold 15px sans-serif';
      holoCtx.fillText('● SYSTEM METRICS NORMAL', 30, 310);

      holoTexture.needsUpdate = true;
    };

    // 7. Mouse Gaze Tracking, Drag-to-Rotate & Interactive Direct Click
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let userOrbitRotation = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    let clickStartTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        userOrbitRotation += deltaX * 0.006;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      clickStartTime = Date.now();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const duration = Date.now() - clickStartTime;
      const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);

      // If clicked without dragging, trigger funny interactive reaction!
      if (duration < 320 && dist < 10) {
        const rect = container.getBoundingClientRect();
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        if (ny > 0.22) {
          // Clicked Head / Antennas -> Boop sound & playful dizzy stars!
          robotAudio.boop();
          if (onMovementChangeRef.current) {
            onMovementChangeRef.current('dizzy_stars');
            setTimeout(() => onMovementChangeRef.current?.('auto'), 2800);
          }
        } else if (ny <= 0.22 && ny >= -0.22) {
          // Clicked Chest Core Light -> Core energy surge & thumbs up!
          robotAudio.energySurge();
          if (onMovementChangeRef.current) {
            onMovementChangeRef.current('thumbs_up');
            setTimeout(() => onMovementChangeRef.current?.('auto'), 2800);
          }
        } else {
          // Clicked Belly / Lap -> Tickle giggle dance!
          robotAudio.tickleGiggle();
          if (onMovementChangeRef.current) {
            onMovementChangeRef.current('laughing_cheer');
            setTimeout(() => onMovementChangeRef.current?.('auto'), 2800);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 8. Main Animation Loop with Alive Rest Fidgets & Explaining Dynamics
    let clock = new THREE.Clock();
    let animationFrameId: number;
    let shadesDropY = 0.55;
    let shadesDropVel = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const curState = stateRef.current;
      const volume = speechRef.current;
      const userMovement = movementRef.current;

      // Smart Explaining Choreography:
      let effectiveMovement: RobotMovement = userMovement;
      if (userMovement === 'explain_ponder') effectiveMovement = 'confused_question';
      if (userMovement === 'explain_celebrate') effectiveMovement = 'cheer_both';
      if (userMovement === 'love_heart') effectiveMovement = 'hug_heart';

      // When robot is actively thinking / synthesizing, ALWAYS show this signature Thinking reaction with Question Mark!
      if (curState === 'thinking') {
        effectiveMovement = 'confused_question';
      } else if (userMovement === 'auto') {
        if (curState === 'idle') {
          effectiveMovement = 'rest';
        } else if (curState === 'listening') {
          effectiveMovement = 'confused_question';
        } else if (curState === 'alert') {
          effectiveMovement = 'alert_warning';
        } else if (curState === 'success') {
          effectiveMovement = 'party_confetti';
        } else if (curState === 'speaking') {
          // Dynamic teacher & buddy explaining choreography:
          const cycle = Math.floor(elapsedTime / 3.6) % 6;
          if (cycle === 0) effectiveMovement = 'aha_idea';
          else if (cycle === 1) effectiveMovement = 'explain_hands';
          else if (cycle === 2) effectiveMovement = 'explain_hologram';
          else if (cycle === 3) effectiveMovement = 'point_direction';
          else if (cycle === 4) effectiveMovement = 'explain_book';
          else effectiveMovement = 'thumbs_up';
        } else {
          effectiveMovement = 'rest';
        }
      }

      const isRestStance = effectiveMovement === 'rest';

      // A. Floating Physics with movement-specific kinetics
      let hoverSpeed = 2.0;
      let hoverAmp = 0.05;
      let rootPosY = 0;
      let rootRotZ = 0;
      let rootRotX = 0;
      let rootPosX = 0;

      if (isRestStance) {
        hoverSpeed = 1.6;
        hoverAmp = 0.035;
      } else if (effectiveMovement === 'cheer_both' || effectiveMovement === 'flying_jump') {
        hoverSpeed = 5.5;
        hoverAmp = 0.12;
        rootPosY = 0.25;
      } else if (effectiveMovement === 'relaxed_chill') {
        hoverSpeed = 1.2;
        hoverAmp = 0.02;
        rootPosY = -0.32;
        rootRotZ = 0.65;
      } else if (effectiveMovement === 'sleeping_zzz') {
        hoverSpeed = 0.8;
        hoverAmp = 0.015;
        rootPosY = -0.42;
        rootRotZ = 1.42;
      } else if (effectiveMovement === 'peek_corner') {
        hoverSpeed = 1.5;
        hoverAmp = 0.025;
        rootPosX = 0.22;
        rootRotZ = 0.42;
      } else if (effectiveMovement === 'skateboard') {
        hoverSpeed = 3.6;
        hoverAmp = 0.04;
        rootPosY = 0.05;
        rootRotZ = Math.sin(elapsedTime * 2.8) * 0.12;
      } else if (effectiveMovement === 'dj_headphones') {
        hoverSpeed = 6.5;
        hoverAmp = 0.07;
      } else if (effectiveMovement === 'superhero_cape') {
        hoverSpeed = 3.0;
        hoverAmp = 0.06;
        rootPosY = 0.14;
        rootRotX = 0.24;
      } else if (effectiveMovement === 'zen_meditation') {
        hoverSpeed = 1.0;
        hoverAmp = 0.035;
        rootPosY = 0.24;
      }

      const hoverY = Math.sin(elapsedTime * hoverSpeed) * hoverAmp;
      robotRoot.position.y = THREE.MathUtils.lerp(robotRoot.position.y, rootPosY + hoverY, 0.08);
      robotRoot.position.x = THREE.MathUtils.lerp(robotRoot.position.x, rootPosX, 0.08);
      robotRoot.rotation.z = THREE.MathUtils.lerp(robotRoot.rotation.z, rootRotZ, 0.08);
      robotRoot.rotation.x = THREE.MathUtils.lerp(robotRoot.rotation.x, rootRotX, 0.08);

      shadowMesh.scale.setScalar(Math.max(0.4, 1.0 - hoverY * 0.6));

      if (!isDragging) {
        userOrbitRotation = THREE.MathUtils.lerp(userOrbitRotation, 0, 0.03);
      }
      robotRoot.rotation.y = userOrbitRotation;

      // B. Smooth Transitions for ALL 3D Props (Core + New Cool & Funny)
      const targetBulbScale = effectiveMovement === 'aha_idea' || effectiveMovement === 'explain_book' ? 1.0 : 0.001;
      const targetHeartScale = effectiveMovement === 'hug_heart' ? 1.0 : 0.001;
      const targetMiniHearts = effectiveMovement === 'in_love' ? 1.0 : 0.001;
      const targetQuestion = effectiveMovement === 'confused_question' ? 1.0 : 0.001;
      const targetLaptop = effectiveMovement === 'laptop_work' ? 1.0 : 0.001;
      const targetZzz = effectiveMovement === 'sleeping_zzz' ? 1.0 : 0.001;
      const targetWall = effectiveMovement === 'peek_corner' ? 1.0 : 0.001;
      const targetSparks = effectiveMovement === 'thumbs_up' || effectiveMovement === 'cheer_both' || effectiveMovement === 'laughing_cheer' ? 1.0 : 0.001;
      const targetHolo = effectiveMovement === 'explain_hologram' ? 1.0 : 0.001;
      const targetConfettiScale = effectiveMovement === 'party_confetti' ? 1.0 : 0.001;
      const targetDizzyStars = effectiveMovement === 'dizzy_stars' ? 1.0 : 0.001;
      const targetAngryFumes = effectiveMovement === 'angry_fumes' ? 1.0 : 0.001;
      const targetShock = effectiveMovement === 'shocked_gasp' ? 1.0 : 0.001;
      const targetTablet = effectiveMovement === 'tablet_mobile' ? 1.0 : 0.001;

      // New Cool & Funny Prop Targets:
      const isShadesActive = effectiveMovement === 'cool_shades' || Boolean(wearSunglassesRef.current);
      const targetCoolShades = isShadesActive ? 1.0 : 0.001;
      const isHeadphonesActive = Boolean(wearHeadphonesRef.current) || effectiveMovement === 'dj_headphones';
      const targetDjHeadphones = isHeadphonesActive ? 1.0 : 0.001;
      const targetMovieGlasses = effectiveMovement === 'movie_popcorn' ? 1.0 : 0.001;
      const targetPopcorn = effectiveMovement === 'movie_popcorn' ? 1.0 : 0.001;
      const targetGamepad = effectiveMovement === 'gamer_headset' ? 1.0 : 0.001;
      const targetChefHat = effectiveMovement === 'chef_cooking' ? 1.0 : 0.001;
      const targetFryingPan = effectiveMovement === 'chef_cooking' ? 1.0 : 0.001;
      const targetSleepingCat = effectiveMovement === 'sleeping_cat' ? 1.0 : 0.001;
      const targetSuperheroCape = effectiveMovement === 'superhero_cape' ? 1.0 : 0.001;
      const targetSkateboard = effectiveMovement === 'skateboard' ? 1.0 : 0.001;
      const targetGraduateCap = effectiveMovement === 'graduate_cap' ? 1.0 : 0.001;
      const targetDiploma = effectiveMovement === 'graduate_cap' ? 1.0 : 0.001;
      const targetDumbbells = effectiveMovement === 'dumbbell_gym' ? 1.0 : 0.001;
      const targetRose = effectiveMovement === 'rose_romance' ? 1.0 : 0.001;
      const targetZenLeaves = effectiveMovement === 'zen_meditation' ? 1.0 : 0.001;

      bulbGroup.scale.lerp(new THREE.Vector3(targetBulbScale, targetBulbScale, targetBulbScale), 0.12);
      heartGroup.scale.lerp(new THREE.Vector3(targetHeartScale, targetHeartScale, targetHeartScale), 0.12);
      floatingHeartsGroup.scale.lerp(new THREE.Vector3(targetMiniHearts, targetMiniHearts, targetMiniHearts), 0.12);
      questionGroup.scale.lerp(new THREE.Vector3(targetQuestion, targetQuestion, targetQuestion), 0.12);
      laptopGroup.scale.lerp(new THREE.Vector3(targetLaptop, targetLaptop, targetLaptop), 0.12);
      zzzGroup.scale.lerp(new THREE.Vector3(targetZzz, targetZzz, targetZzz), 0.12);
      cornerWallGroup.scale.lerp(new THREE.Vector3(targetWall, targetWall, targetWall), 0.12);
      energySparksGroup.scale.lerp(new THREE.Vector3(targetSparks, targetSparks, targetSparks), 0.12);
      holoBoardGroup.scale.lerp(new THREE.Vector3(targetHolo, targetHolo, targetHolo), 0.12);
      confettiGroup.scale.lerp(new THREE.Vector3(targetConfettiScale, targetConfettiScale, targetConfettiScale), 0.12);
      dizzyStarsGroup.scale.lerp(new THREE.Vector3(targetDizzyStars, targetDizzyStars, targetDizzyStars), 0.12);
      angryFumesGroup.scale.lerp(new THREE.Vector3(targetAngryFumes, targetAngryFumes, targetAngryFumes), 0.12);
      shockGroup.scale.lerp(new THREE.Vector3(targetShock, targetShock, targetShock), 0.12);
      tabletGroup.scale.lerp(new THREE.Vector3(targetTablet, targetTablet, targetTablet), 0.12);

      // Lerp New Props & Deal With It spring drop animation
      coolShadesGroup.scale.lerp(new THREE.Vector3(targetCoolShades, targetCoolShades, targetCoolShades), 0.16);

      if (isShadesActive) {
        // Smooth Deal With It spring drop physics onto robot's face
        const targetY = 0.0;
        const springForce = (targetY - shadesDropY) * 0.18;
        shadesDropVel = (shadesDropVel + springForce) * 0.72;
        shadesDropY += shadesDropVel;

        coolShadesGroup.position.y = 0.025 + shadesDropY;
        // Playful swagger tilt wobble during drop
        coolShadesGroup.rotation.z = shadesDropY * 0.22;
      } else {
        shadesDropY = 0.55;
        shadesDropVel = 0;
        coolShadesGroup.position.y = 0.55;
        coolShadesGroup.rotation.z = 0;
      }
      djHeadphonesGroup.scale.lerp(new THREE.Vector3(targetDjHeadphones, targetDjHeadphones, targetDjHeadphones), 0.14);
      musicNotesGroup.scale.lerp(new THREE.Vector3(targetDjHeadphones, targetDjHeadphones, targetDjHeadphones), 0.14);
      movieGlassesGroup.scale.lerp(new THREE.Vector3(targetMovieGlasses, targetMovieGlasses, targetMovieGlasses), 0.14);
      popcornGroup.scale.lerp(new THREE.Vector3(targetPopcorn, targetPopcorn, targetPopcorn), 0.14);
      gamepadGroup.scale.lerp(new THREE.Vector3(targetGamepad, targetGamepad, targetGamepad), 0.14);
      chefHatGroup.scale.lerp(new THREE.Vector3(targetChefHat, targetChefHat, targetChefHat), 0.14);
      fryingPanGroup.scale.lerp(new THREE.Vector3(targetFryingPan, targetFryingPan, targetFryingPan), 0.14);
      sleepingCatGroup.scale.lerp(new THREE.Vector3(targetSleepingCat, targetSleepingCat, targetSleepingCat), 0.14);
      superheroCapeGroup.scale.lerp(new THREE.Vector3(targetSuperheroCape, targetSuperheroCape, targetSuperheroCape), 0.14);
      skateboardGroup.scale.lerp(new THREE.Vector3(targetSkateboard, targetSkateboard, targetSkateboard), 0.14);
      graduateCapGroup.scale.lerp(new THREE.Vector3(targetGraduateCap, targetGraduateCap, targetGraduateCap), 0.14);
      diplomaGroup.scale.lerp(new THREE.Vector3(targetDiploma, targetDiploma, targetDiploma), 0.14);
      dumbbellGroup.scale.lerp(new THREE.Vector3(targetDumbbells, targetDumbbells, targetDumbbells), 0.14);
      roseGroup.scale.lerp(new THREE.Vector3(targetRose, targetRose, targetRose), 0.14);
      zenLeavesGroup.scale.lerp(new THREE.Vector3(targetZenLeaves, targetZenLeaves, targetZenLeaves), 0.14);

      bulbLight.intensity = THREE.MathUtils.lerp(bulbLight.intensity, targetBulbScale > 0.5 ? 2.5 : 0, 0.1);
      holoLight.intensity = THREE.MathUtils.lerp(holoLight.intensity, targetHolo > 0.5 ? 2.2 : 0, 0.1);

      // Micro-animations for props:
      if (targetDjHeadphones > 0.05) {
        const beatPulse = 2.4 + Math.sin(elapsedTime * 5.0) * 0.8 + (volume * 4.0);
        headphoneNeonMat.emissiveIntensity = beatPulse;

        musicNoteMeshes.forEach((n) => {
          n.mesh.position.y = n.baseY + Math.sin(elapsedTime * n.speed + n.phase) * 0.08;
          n.mesh.rotation.z = Math.sin(elapsedTime * (n.speed * 0.8) + n.phase) * 0.18;
        });
      }

      if (targetSkateboard > 0.5) {
        skateboardGroup.rotation.y = Math.sin(elapsedTime * 2.8) * 0.14;
        skateboardGroup.position.x = Math.sin(elapsedTime * 2.8) * 0.08;
      }

      if (targetFryingPan > 0.5) {
        tossedFoods.forEach((food) => {
          const t = (elapsedTime * 3.5 + food.seed * 0.2) % 1;
          food.mesh.position.y = 0.1 + Math.sin(t * Math.PI) * 0.22;
          food.mesh.rotation.x += 0.08;
        });
      }

      if (targetZenLeaves > 0.5) {
        leafMeshes.forEach((leaf) => {
          leaf.angle += 0.02 * leaf.speed;
          leaf.mesh.position.set(
            Math.cos(leaf.angle) * leaf.radius,
            leaf.yOffset + Math.sin(leaf.angle * 2) * 0.1,
            Math.sin(leaf.angle) * leaf.radius
          );
          leaf.mesh.rotation.z = leaf.angle;
        });
      }

      if (targetSuperheroCape > 0.5) {
        capeMesh.rotation.x = 0.35 + Math.sin(elapsedTime * 8) * 0.15;
        capeMesh.position.y = -0.55 + Math.cos(elapsedTime * 8) * 0.04;
      }

      if (targetRose > 0.5) {
        roseGroup.rotation.z = Math.sin(elapsedTime * 2.5) * 0.1;
      }

      if (targetDumbbells > 0.5) {
        const curlR = Math.sin(elapsedTime * 4.0) * 0.18;
        const curlL = -Math.sin(elapsedTime * 4.0) * 0.18;
        dumbbellR.position.y = -0.42 + Math.max(0, curlR);
        dumbbellL.position.y = -0.42 + Math.max(0, curlL);
      }

      if (targetSleepingCat > 0.5) {
        const catPurr = 1.0 + Math.sin(elapsedTime * 4.0) * 0.04;
        catBody.scale.set(catPurr, catPurr, catPurr);
      }

      if (targetConfettiScale > 0.5) {
        confettiPieces.forEach((p) => {
          p.mesh.position.y -= p.speed * 0.012;
          p.mesh.rotation.x += p.rotSpeed * 0.02;
          p.mesh.rotation.z += p.rotSpeed * 0.02;
          if (p.mesh.position.y < -0.7) {
            p.mesh.position.y = p.originY;
          }
        });
      }

      if (targetDizzyStars > 0.5) {
        starMeshes.forEach((s, i) => {
          const a = elapsedTime * 4.0 + (i / 4) * Math.PI * 2;
          s.position.set(Math.cos(a) * 0.65, 0.15 + Math.sin(a * 2) * 0.08, Math.sin(a) * 0.45);
          s.rotation.z = a;
        });
      }

      if (targetAngryFumes > 0.5) {
        const pulse = 1.0 + Math.sin(elapsedTime * 9) * 0.22;
        puffLeft.scale.set(pulse, pulse, pulse);
        puffRight.scale.set(pulse, pulse, pulse);
      }

      if (targetBulbScale > 0.5) {
        bulbGroup.position.y = 0.85 + Math.sin(elapsedTime * 4) * 0.03;
        sparkRays.forEach((ray, i) => {
          const pulse = 1.0 + Math.sin(elapsedTime * 6 + i) * 0.25;
          ray.scale.set(pulse, pulse, pulse);
        });
      }

      if (targetMiniHearts > 0.5) {
        miniHeart1.position.y = 0.85 + Math.sin(elapsedTime * 3) * 0.05;
        miniHeart2.position.y = 0.95 + Math.sin(elapsedTime * 3 + 1) * 0.06;
      }

      if (targetQuestion > 0.05) {
        questionGroup.position.y = 0.86 + Math.sin(elapsedTime * 2.8) * 0.04;
        questionGroup.rotation.y = 0.15 + Math.sin(elapsedTime * 1.8) * 0.12;
        questionGroup.rotation.z = -0.18 + Math.cos(elapsedTime * 2.2) * 0.04;
      }

      if (targetZzz > 0.5) {
        zzzGroup.position.y = 0.65 + Math.sin(elapsedTime * 2) * 0.04;
      }

      if (targetHolo > 0.5) {
        drawHoloScreen(elapsedTime);
        holoBoardMesh.position.y = Math.sin(elapsedTime * 2.5) * 0.04;
      }

      // =========================================================================
      // C. CLEAN ARTICULATED KINEMATICS FOR ALL 16 POSES
      // BLUE PART = SHOULDERS (anchored to chest)
      // WHITE PART = HANDS / ARMS (moving appendages)
      // =========================================================================
      const targetRotHandL = new THREE.Euler(0, 0, 0.22);
      const targetRotHandR = new THREE.Euler(0, 0, -0.22);
      let targetHeadRotY = mouseX * 0.25;
      let targetHeadRotX = -mouseY * 0.20;
      let targetHeadRotZ = Math.sin(elapsedTime * 1.5) * 0.02 + mouseX * -0.04;

      // 1. Alive Rest Stance (R1,C1) with charming micro-behaviors & idle fidgets
      if (isRestStance) {
        const restBreath = Math.sin(elapsedTime * 1.6) * 0.015;
        targetRotHandL.set(0, 0, 0.22 + restBreath);
        targetRotHandR.set(0, 0, -0.22 - restBreath);
        targetHeadRotX = -mouseY * 0.16 + Math.sin(elapsedTime * 0.9) * 0.02;
        targetHeadRotY = mouseX * 0.20 + Math.sin(elapsedTime * 0.6) * 0.03;
        targetHeadRotZ = Math.sin(elapsedTime * 0.7) * 0.02;

        // Periodic Alive Rest Fidgets:
        // Every 8.5 seconds, perform a cute micro-fidget for 2.2 seconds!
        const fidgetCycle = 8.5;
        const fidgetTime = elapsedTime % fidgetCycle;
        const fidgetIndex = Math.floor(elapsedTime / fidgetCycle) % 5;

        if (fidgetTime < 2.2) {
          const t = fidgetTime / 2.2;
          const curve = Math.sin(t * Math.PI); // smooth in-out curve 0 -> 1 -> 0

          if (fidgetIndex === 0) {
            // Curious puppy head-tilt & ear twitch
            targetHeadRotZ = 0.32 * curve;
            targetHeadRotX = -0.14 * curve;
            leftAntenna.rotation.z = 0.35 + Math.sin(elapsedTime * 14) * 0.15 * curve;
          } else if (fidgetIndex === 1) {
            // Quick friendly finger-gun / casual wave
            targetRotHandR.set(-1.15 * curve, 0.25 * curve, -0.65 * curve);
            targetHeadRotZ = -0.14 * curve;
          } else if (fidgetIndex === 2) {
            // Rhythm beat bobbing / hovering groove
            targetHeadRotX = Math.sin(elapsedTime * 9) * 0.09 * curve;
            rootPosY = Math.sin(elapsedTime * 9) * 0.04 * curve;
          } else if (fidgetIndex === 3) {
            // Gentle stretch & yawn
            targetRotHandL.set(-0.5 * curve, -0.2 * curve, 0.6 * curve);
            targetRotHandR.set(-0.5 * curve, 0.2 * curve, -0.6 * curve);
            targetHeadRotX = -0.22 * curve;
          } else if (fidgetIndex === 4) {
            // Curious side-to-side inspection
            targetHeadRotY = mouseX * 0.2 + Math.sin(t * Math.PI * 2) * 0.35;
            targetHeadRotZ = Math.cos(t * Math.PI * 2) * 0.08;
          }
        }
      }
      // 2. Friendly Hello Wave (R1,C2)
      else if (effectiveMovement === 'wave_hello') {
        const waveAngle = Math.sin(elapsedTime * 5.0) * 0.32;
        targetRotHandR.set(0.2, 0.1, -2.15 + waveAngle);
        targetRotHandL.set(0, 0, 0.22);
        targetHeadRotZ = -0.12;
      }
      // 3. Thumbs-Up & Wink (R1,C3)
      else if (effectiveMovement === 'thumbs_up') {
        targetRotHandR.set(-1.25, 0.25, -0.75);
        targetRotHandL.set(0, 0, 0.22);
        targetHeadRotZ = 0.16;
        targetHeadRotX = -0.08;
      }
      // 4. Both Hands Cheering (R1,C4)
      else if (effectiveMovement === 'cheer_both') {
        const bounce = Math.sin(elapsedTime * 8) * 0.08;
        targetRotHandL.set(0.2, -0.1, 2.35 + bounce);
        targetRotHandR.set(0.2, 0.1, -2.35 - bounce);
        targetHeadRotX = -0.15;
      }
      // 5. In Love & Blushing (R2,C1)
      else if (effectiveMovement === 'in_love') {
        targetRotHandR.set(-1.45, 0.45, -0.92);
        targetRotHandL.set(-0.35, -0.25, 0.32);
        targetHeadRotZ = 0.32;
        targetHeadRotX = 0.12;
      }
      // 6. Confused / Question / Thinking (Reference Image Kinematics)
      else if (effectiveMovement === 'confused_question') {
        const chinThink = Math.sin(elapsedTime * 2.5) * 0.025;
        // Right arm raised, hand touching chin/face thoughtfully
        targetRotHandR.set(-1.75, 0.42, -0.68 + chinThink);
        // Left arm folded horizontally across belly/lower chest
        targetRotHandL.set(-1.18, -0.62, 0.68);
        // Head tilted towards robot's left (viewer's right, towards the floating question mark)
        targetHeadRotZ = 0.22 + Math.sin(elapsedTime * 1.8) * 0.02;
        targetHeadRotX = -0.12; // Inquiring upward gaze
        targetHeadRotY = 0.08;
      }
      // 7. Working on Laptop (R2,C3)
      else if (effectiveMovement === 'laptop_work') {
        const typeL = Math.sin(elapsedTime * 9) * 0.04;
        const typeR = Math.cos(elapsedTime * 9) * 0.04;
        targetRotHandL.set(-1.18 + typeL, -0.22, 0.32);
        targetRotHandR.set(-1.18 + typeR, 0.22, -0.32);
        targetHeadRotX = 0.32;
      }
      // 8. Direction Pointer (R2,C4)
      else if (effectiveMovement === 'point_direction') {
        targetRotHandR.set(0.05, 0.15, -1.55);
        targetRotHandL.set(0, 0, 0.22);
        targetHeadRotY = 0.38;
        targetHeadRotX = -0.05;
      }
      // 9. Aha! Idea (R3,C1)
      else if (effectiveMovement === 'aha_idea') {
        targetRotHandR.set(-0.95, 0.25, -0.72);
        targetRotHandL.set(0, 0, 0.22);
        targetHeadRotX = -0.18;
        targetHeadRotZ = -0.1;
      }
      // 10. Arms Crossed / Deadpan (R3,C2)
      else if (effectiveMovement === 'arms_crossed') {
        targetRotHandL.set(-0.95, -0.85, 0.75);
        targetRotHandR.set(-0.95, 0.85, -0.75);
        targetHeadRotX = -0.14;
        targetHeadRotZ = 0;
      }
      // 11. Flying Jump (R3,C3)
      else if (effectiveMovement === 'flying_jump') {
        targetRotHandL.set(0.25, -0.25, 1.75);
        targetRotHandR.set(0.25, 0.25, -1.75);
        targetHeadRotX = -0.22;
      }
      // 12. Peek Around Corner (R3,C4)
      else if (effectiveMovement === 'peek_corner') {
        targetRotHandR.set(-0.65, 0.25, -0.35);
        targetRotHandL.set(-0.2, 0, 0.3);
        targetHeadRotZ = 0.25;
        targetHeadRotY = -0.2;
      }
      // 13. Relaxed Lounging (R4,C1)
      else if (effectiveMovement === 'relaxed_chill') {
        targetRotHandL.set(-1.25, -0.45, 0.65);
        targetRotHandR.set(-0.35, 0.2, -0.45);
        targetHeadRotZ = -0.15;
      }
      // 14. Sleeping & Snoozing (R4,C2)
      else if (effectiveMovement === 'sleeping_zzz') {
        targetRotHandL.set(-0.85, -0.5, 0.6);
        targetRotHandR.set(-0.85, 0.5, -0.6);
        targetHeadRotX = 0.15;
      }
      // 15. Hugging Heart (R4,C3)
      else if (effectiveMovement === 'hug_heart') {
        targetRotHandL.set(-0.85, -0.65, 0.45);
        targetRotHandR.set(-0.85, 0.65, -0.45);
        targetHeadRotX = 0.14;
      }
      // 16. Goodbye Low Wave (R4,C4)
      else if (effectiveMovement === 'goodbye_wave') {
        const waveAngle = Math.sin(elapsedTime * 4.0) * 0.22;
        targetRotHandR.set(0.1, 0.1, -1.35 + waveAngle);
        targetRotHandL.set(0, 0, 0.22);
      }
      // 17. Party Confetti (R5,C5)
      else if (effectiveMovement === 'party_confetti') {
        const bounce = Math.sin(elapsedTime * 9) * 0.1;
        targetRotHandL.set(0.2, -0.15, 2.45 + bounce);
        targetRotHandR.set(0.2, 0.15, -2.45 - bounce);
        targetHeadRotX = -0.15;
      }
      // 18. Sad Crying (R3,C1)
      else if (effectiveMovement === 'sad_crying') {
        targetRotHandL.set(0.1, 0.1, 0.12);
        targetRotHandR.set(0.1, -0.1, -0.12);
        targetHeadRotX = 0.28;
        targetHeadRotZ = 0.05;
      }
      // 19. Angry Fumes (R3,C3)
      else if (effectiveMovement === 'angry_fumes') {
        targetRotHandL.set(-0.85, 0.35, 0.45);
        targetRotHandR.set(-0.85, -0.35, -0.45);
        targetHeadRotX = -0.18;
      }
      // 20. Dizzy Swirls (R3,C5)
      else if (effectiveMovement === 'dizzy_stars') {
        targetRotHandL.set(-0.35, -0.2, 0.55);
        targetRotHandR.set(-0.35, 0.2, -0.55);
        targetHeadRotZ = Math.sin(elapsedTime * 3.5) * 0.28;
        targetHeadRotX = Math.cos(elapsedTime * 3.5) * 0.15;
      }
      // 21. Shocked Gasp (R2,C5)
      else if (effectiveMovement === 'shocked_gasp') {
        targetRotHandL.set(-1.42, -0.52, 0.68);
        targetRotHandR.set(-1.42, 0.52, -0.68);
        targetHeadRotX = -0.12;
      }
      // 22. Tablet / Mobile (R4,C3)
      else if (effectiveMovement === 'tablet_mobile') {
        targetRotHandL.set(-1.22, -0.32, 0.38);
        targetRotHandR.set(-1.22, 0.32, -0.38);
        targetHeadRotX = 0.32;
      }
      // 23. Polite Bow (R5,C6)
      else if (effectiveMovement === 'polite_bow') {
        targetRotHandL.set(-0.52, -0.32, 0.22);
        targetRotHandR.set(-0.52, 0.32, -0.22);
        targetHeadRotX = 0.25;
      }
      // 24. Frustrated Headache (R5,C3)
      else if (effectiveMovement === 'frustrated_headache') {
        targetRotHandL.set(-1.72, -0.38, 0.65);
        targetRotHandR.set(-1.72, 0.38, -0.65);
        targetHeadRotX = 0.15;
      }
      // 25. Scared Tremble (R5,C2)
      else if (effectiveMovement === 'scared_tremble') {
        const jitter = Math.sin(elapsedTime * 45) * 0.08;
        targetRotHandL.set(-0.6 + jitter, -0.2, 0.45);
        targetRotHandR.set(-0.6 - jitter, 0.2, -0.45);
        targetHeadRotZ = jitter * 0.5;
      }
      // 26. Laughing Cheerful (R1,C5)
      else if (effectiveMovement === 'laughing_cheer') {
        const giggle = Math.sin(elapsedTime * 12) * 0.06;
        targetRotHandL.set(-1.15 + giggle, -0.3, 0.4);
        targetRotHandR.set(-1.15 - giggle, 0.3, -0.4);
        targetHeadRotX = -0.08 + giggle;
      }
      // 27. Thinking Suspicious Dots (R2,C4)
      else if (effectiveMovement === 'thinking_dots') {
        targetRotHandR.set(-1.42, 0.32, -0.58);
        targetRotHandL.set(-0.48, -0.25, 0.42);
        targetHeadRotZ = 0.18;
      }
      // 28. Cool Swagger Sunglasses (cool_shades)
      else if (effectiveMovement === 'cool_shades') {
        const beat = Math.sin(elapsedTime * 3.8);
        // Cool lean-back posture with rhythmic nodding swagger
        targetHeadRotX = -0.16 + beat * 0.03;
        targetHeadRotZ = -0.11 + Math.sin(elapsedTime * 1.9) * 0.02;
        targetHeadRotY = 0.08 + mouseX * 0.15;
        // Right hand: classic cool shades rim tap / finger-gun swagger
        targetRotHandR.set(-1.48, 0.42 + beat * 0.05, -0.65);
        // Left hand: relaxed hip / finger-gun swagger
        targetRotHandL.set(-0.85, -0.38 - beat * 0.04, 0.48);
      }
      // 29. DJ Beats & Headphones (dj_headphones)
      else if (effectiveMovement === 'dj_headphones') {
        const beatHead = Math.sin(elapsedTime * 9.0) * 0.1;
        targetRotHandL.set(-1.55, -0.4, 0.65);
        targetRotHandR.set(-1.55, 0.4, -0.65);
        targetHeadRotX = -0.05 + beatHead;
        targetHeadRotZ = Math.sin(elapsedTime * 4.5) * 0.08;
      }
      // 30. Movie Popcorn Snacking (movie_popcorn)
      else if (effectiveMovement === 'movie_popcorn') {
        const eatHand = Math.sin(elapsedTime * 3.5) * 0.3;
        targetRotHandL.set(-1.15, -0.25, 0.35);
        targetRotHandR.set(-1.1 + eatHand, 0.3, -0.38);
        targetHeadRotX = 0.08;
      }
      // 31. Pro Gamer Gamepad (gamer_headset)
      else if (effectiveMovement === 'gamer_headset') {
        const twitch = Math.sin(elapsedTime * 15) * 0.04;
        targetRotHandL.set(-1.18 + twitch, -0.25, 0.35);
        targetRotHandR.set(-1.18 - twitch, 0.25, -0.35);
        targetHeadRotX = 0.22;
      }
      // 32. Chef Cooking Frying Pan (chef_cooking)
      else if (effectiveMovement === 'chef_cooking') {
        const panFlip = Math.sin(elapsedTime * 4.0) * 0.22;
        targetRotHandR.set(-1.15 + panFlip, 0.25, -0.28);
        targetRotHandL.set(-0.65, -0.35, 0.4);
        targetHeadRotX = 0.15;
      }
      // 33. Sleeping Cat Companion (sleeping_cat)
      else if (effectiveMovement === 'sleeping_cat') {
        targetRotHandL.set(-0.85, -0.45, 0.5);
        targetRotHandR.set(-0.85, 0.45, -0.5);
        targetHeadRotX = 0.18;
        targetHeadRotZ = 0.12;
      }
      // 34. Superhero Soar (superhero_cape)
      else if (effectiveMovement === 'superhero_cape') {
        targetRotHandR.set(0.15, 0.1, -2.4);
        targetRotHandL.set(0.2, -0.15, 0.65);
        targetHeadRotX = -0.28;
      }
      // 35. Skater Cruising (skateboard)
      else if (effectiveMovement === 'skateboard') {
        const carveArm = Math.sin(elapsedTime * 2.8) * 0.15;
        targetRotHandL.set(0.15, -0.25, 1.25 + carveArm);
        targetRotHandR.set(0.15, 0.25, -1.25 - carveArm);
        targetHeadRotX = -0.08;
        targetHeadRotZ = Math.sin(elapsedTime * 2.8) * 0.12;
      }
      // 36. Graduate Honors (graduate_cap)
      else if (effectiveMovement === 'graduate_cap') {
        targetRotHandL.set(-1.05, -0.25, 0.42);
        targetRotHandR.set(-1.65, 0.35, -0.75);
        targetHeadRotX = -0.14;
        targetHeadRotZ = -0.08;
      }
      // 37. Gym Bodybuilder (dumbbell_gym)
      else if (effectiveMovement === 'dumbbell_gym') {
        const bicepL = Math.sin(elapsedTime * 4.0) * 0.35;
        const bicepR = -Math.sin(elapsedTime * 4.0) * 0.35;
        targetRotHandL.set(-1.25 + bicepL, -0.35, 0.45);
        targetRotHandR.set(-1.25 + bicepR, 0.35, -0.45);
        targetHeadRotX = -0.12;
      }
      // 38. Romantic Rose (rose_romance)
      else if (effectiveMovement === 'rose_romance') {
        targetRotHandR.set(-1.32, 0.22, -0.18);
        targetRotHandL.set(-0.85, -0.45, 0.42);
        targetHeadRotZ = 0.22;
        targetHeadRotX = 0.05;
      }
      // 39. Zen Meditation (zen_meditation)
      else if (effectiveMovement === 'zen_meditation') {
        targetRotHandL.set(-0.72, -0.48, 0.38);
        targetRotHandR.set(-0.72, 0.48, -0.38);
        targetHeadRotX = 0.08;
        targetHeadRotZ = 0;
      }
      // Extra Explaining Presentation Sweeps (Keynote speaker & teacher)
      else if (effectiveMovement === 'explain_hands') {
        const wavePeriod = elapsedTime * 3.0;
        const speechAmp = Math.min(1.2, 0.6 + volume * 0.9);
        targetRotHandR.set(-1.15 + Math.cos(wavePeriod) * 0.28 * speechAmp, 0.35 + Math.sin(wavePeriod * 0.5) * 0.1, -0.25);
        targetRotHandL.set(-1.15 + Math.sin(wavePeriod) * 0.28 * speechAmp, -0.35 - Math.sin(wavePeriod * 0.5) * 0.1, 0.25);
        targetHeadRotX = -0.06 + Math.sin(wavePeriod * 0.7) * 0.05 * speechAmp;
        targetHeadRotY = mouseX * 0.15 + Math.sin(wavePeriod * 0.5) * 0.12;
      } else if (effectiveMovement === 'explain_hologram') {
        const sweep = Math.sin(elapsedTime * 2.4) * 0.22;
        const speechAmp = Math.min(1.2, 0.7 + volume * 0.6);
        targetRotHandR.set(-1.32 + sweep * 0.15, 0.28 + sweep * 0.3, -0.12);
        targetRotHandL.set(-0.75 + Math.sin(sweep) * 0.1 * speechAmp, -0.35, 0.32);
        targetHeadRotY = 0.25 + sweep * 0.15;
      } else if (effectiveMovement === 'alert_warning') {
        targetRotHandL.set(-1.25, -0.5, 0.3);
        targetRotHandR.set(-1.25, 0.5, -0.3);
      } else if (effectiveMovement === 'explain_book') {
        targetRotHandL.set(-0.85, -0.3, 0.35);
        targetRotHandR.set(-1.35, 0.4, -0.25);
      }

      // Smooth kinematic easing for white hands
      const ease = 0.09;
      leftHandGroup.rotation.x = THREE.MathUtils.lerp(leftHandGroup.rotation.x, targetRotHandL.x, ease);
      leftHandGroup.rotation.y = THREE.MathUtils.lerp(leftHandGroup.rotation.y, targetRotHandL.y, ease);
      leftHandGroup.rotation.z = THREE.MathUtils.lerp(leftHandGroup.rotation.z, targetRotHandL.z, ease);

      rightHandGroup.rotation.x = THREE.MathUtils.lerp(rightHandGroup.rotation.x, targetRotHandR.x, ease);
      rightHandGroup.rotation.y = THREE.MathUtils.lerp(rightHandGroup.rotation.y, targetRotHandR.y, ease);
      rightHandGroup.rotation.z = THREE.MathUtils.lerp(rightHandGroup.rotation.z, targetRotHandR.z, ease);

      // Blue shoulder caps stay on body with subtle shrug
      const leftShrugZ = 0.22 + (leftHandGroup.rotation.z - 0.22) * 0.05;
      const rightShrugZ = -0.22 + (rightHandGroup.rotation.z + 0.22) * 0.05;
      leftShoulderMesh.rotation.z = THREE.MathUtils.lerp(leftShoulderMesh.rotation.z, leftShrugZ, ease);
      rightShoulderMesh.rotation.z = THREE.MathUtils.lerp(rightShoulderMesh.rotation.z, rightShrugZ, ease);

      // Head Posing
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, 0.08);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadRotZ, 0.08);

      bodyGroup.rotation.y = THREE.MathUtils.lerp(bodyGroup.rotation.y, targetHeadRotY * 0.5, 0.05);

      // Antennas
      const antFreq = isRestStance ? 1.5 : 3.0;
      const antAmp = isRestStance ? 0.02 : 0.05;
      leftAntenna.rotation.z = 0.35 + Math.sin(elapsedTime * antFreq) * antAmp;
      rightAntenna.rotation.z = -0.35 - Math.sin(elapsedTime * antFreq) * antAmp;

      // Chest core glow pulse
      const isRedAlert = effectiveMovement === 'alert_warning';
      coreRingMat.color.setHex(isRedAlert ? 0xf59e0b : 0x38bdf8);
      coreRingMat.emissive.setHex(isRedAlert ? 0xd97706 : 0x0284c7);
      const corePulse = isRestStance ? 2.0 + Math.sin(elapsedTime * 2.0) * 0.5 : 2.0 + Math.sin(elapsedTime * 4.0) * 1.0;
      coreRingMat.emissiveIntensity = corePulse;

      // Blinking Timer
      blinkTimer += 0.016;
      if (blinkTimer > 3.6) {
        blinkValue -= 0.18;
        if (blinkValue <= 0) {
          blinkValue = 0;
          if (blinkTimer > 3.8) {
            blinkTimer = 0;
            blinkValue = 1.0;
          }
        }
      } else {
        blinkValue = Math.min(1.0, blinkValue + 0.2);
      }

      drawFaceScreen(curState, volume, effectiveMovement, elapsedTime);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      faceTexture.dispose();
      holoTexture.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" title="Drag to inspect 3D Robot from any angle" />

      {/* State & Movement Overlay Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 tracking-wide flex items-center gap-2 shadow-lg z-10 whitespace-nowrap">
        <span
          className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            movement === 'alert_warning' || state === 'alert'
              ? 'bg-amber-400 ring-2 ring-amber-400/40'
              : state === 'speaking'
              ? 'bg-sky-400 ring-2 ring-sky-400/40'
              : state === 'listening'
              ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
              : state === 'thinking'
              ? 'bg-purple-400 ring-2 ring-purple-400/40'
              : 'bg-cyan-400'
          }`}
        />
        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold">
          {movement === 'rest' || (state === 'idle' && movement === 'auto')
            ? '💤 Rest Stance (Ready for Question)'
            : state === 'listening'
            ? '🎙️ Listening to your question...'
            : state === 'thinking'
            ? '🧠 Thinking & Reason...'
            : state === 'speaking'
            ? '🗣️ Explaining with Movements...'
            : movement === 'wave_hello'
            ? '👋 Friendly Hello Wave'
            : movement === 'thumbs_up'
            ? '👍 Thumbs-Up & Wink'
            : movement === 'cheer_both'
            ? '🙌 Both Hands Cheering'
            : movement === 'in_love'
            ? '💖 In Love & Blushing'
            : movement === 'confused_question'
            ? '❓ Puzzled & Question'
            : movement === 'laptop_work'
            ? '💻 Typing on Laptop'
            : movement === 'point_direction'
            ? '👉 Direction Pointer'
            : movement === 'aha_idea'
            ? '💡 Aha! Idea Lightbulb'
            : movement === 'arms_crossed'
            ? '😤 Arms Crossed (Sassy)'
            : movement === 'flying_jump'
            ? '🚀 Flying Up Levitation'
            : movement === 'peek_corner'
            ? '👀 Peeking Corner Wall'
            : movement === 'relaxed_chill'
            ? '😎 Relaxed Lounging'
            : movement === 'sleeping_zzz'
            ? '😴 Sleeping & Snoozing (Zzz)'
            : movement === 'hug_heart'
            ? '❤️ Hugging 3D Heart'
            : movement === 'goodbye_wave'
            ? '👋 Gentle Goodbye Wave'
            : movement === 'cool_shades' || wearSunglasses
            ? '😎 Cool Swagger (Deal With It)'
            : movement === 'dj_headphones'
            ? '🎧 DJ Beats & Grooving'
            : movement === 'movie_popcorn'
            ? '🍿 Movie Popcorn & 3D Specs'
            : movement === 'gamer_headset'
            ? '🎮 Pro Gamer Console'
            : movement === 'chef_cooking'
            ? '🍳 Master Chef Cooking'
            : movement === 'sleeping_cat'
            ? '🐱 Cat Nap Pillow'
            : movement === 'superhero_cape'
            ? '🦸 Superhero Cape Soar'
            : movement === 'skateboard'
            ? '🛹 Neon Skater Cruise'
            : movement === 'graduate_cap'
            ? '🎓 Graduate Honors & Diploma'
            : movement === 'dumbbell_gym'
            ? '💪 Gym Bicep Flex'
            : movement === 'rose_romance'
            ? '🌹 Romantic Rose Wink'
            : movement === 'zen_meditation'
            ? '🧘 Zen Lotus Hover'
            : movement === 'explain_hands'
            ? '👐 Keynote Presentation Sweeps'
            : movement === 'explain_hologram'
            ? '📊 Holographic Data Pointer'
            : movement === 'explain_book'
            ? '📖 Academic Book Insights'
            : '🤖 CampusAI 3D Companion'}
        </span>
      </div>
    </div>
  );
};
