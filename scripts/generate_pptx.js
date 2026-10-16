import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";

async function generatePresentation() {
  const pres = new pptxgen();

  pres.layout = "LAYOUT_16x9";
  pres.author = "SafeStack Engineering Team";
  pres.company = "SafeStack Weather Guard";
  pres.title = "SafeStack Weather Guard Technical Presentation";

  // Define Colors
  const BG_DARK = "0B1120"; // slate-950
  const CARD_DARK = "1E293B"; // slate-800
  const ACCENT_AMBER = "F59E0B";
  const ACCENT_CYAN = "06B6D4";
  const ACCENT_EMERALD = "10B981";
  const ACCENT_ROSE = "F43F5E";
  const TEXT_LIGHT = "F8FAFC";
  const TEXT_MUTED = "94A3B8";

  // Helper function to set dark slide background
  function createDarkSlide() {
    const slide = pres.addSlide();
    slide.background = { color: BG_DARK };
    // Header line
    slide.addShape(pres.ShapeType.rect, {
      x: 0.5,
      y: 0.4,
      w: 12.33,
      h: 0.05,
      fill: { color: ACCENT_AMBER },
    });
    // Footer text
    slide.addText("SafeStack Weather Guard  |  Autonomous Construction Yard Aerodynamic Safety", {
      x: 0.5,
      y: 7.1,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      color: TEXT_MUTED,
      fontFace: "Arial",
    });
    return slide;
  }

  // ==========================================
  // SLIDE 1: Title Slide (with Nano-Banana Hero Visual)
  // ==========================================
  const slide1 = pres.addSlide();
  slide1.background = { color: BG_DARK };

  // Add Hero Nano-Banana Image on right half
  const heroImgPath = path.resolve("src/assets/images/construction_safety_hero_1792117992203.jpg");
  if (fs.existsSync(heroImgPath)) {
    slide1.addImage({
      path: heroImgPath,
      x: 7.2,
      y: 0.8,
      w: 5.3,
      h: 3.4,
      rounding: true,
    });
  }

  slide1.addText("AUTONOMOUS AERODYNAMIC RISK MANAGEMENT", {
    x: 0.8,
    y: 0.8,
    w: 6.2,
    h: 0.35,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
    fontFace: "Arial",
  });

  slide1.addText("SafeStack Weather Guard", {
    x: 0.8,
    y: 1.2,
    w: 6.2,
    h: 1.2,
    fontSize: 36,
    color: TEXT_LIGHT,
    bold: true,
    fontFace: "Arial",
  });

  slide1.addText("Real-Time Construction Yard Aerodynamic Safety & Dynamic Weather Risk Intelligence Platform", {
    x: 0.8,
    y: 2.5,
    w: 6.2,
    h: 0.8,
    fontSize: 15,
    color: TEXT_MUTED,
    fontFace: "Arial",
  });

  // Feature summary cards on Title
  slide1.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.5,
    w: 3.6,
    h: 2.1,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_AMBER, width: 1 },
    rectRadius: 0.1,
  });
  slide1.addText("LIVE WEATHER PIPELINE\nKMA Ultra-Short-Term API\n24-Hour Predictive Gust Models\nGPS Multi-Hub Site Switching", {
    x: 1.0,
    y: 4.7,
    w: 3.2,
    h: 1.7,
    fontSize: 11,
    color: TEXT_LIGHT,
    fontFace: "Arial",
  });

  slide1.addShape(pres.ShapeType.roundRect, {
    x: 4.7,
    y: 4.5,
    w: 3.6,
    h: 2.1,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_CYAN, width: 1 },
    rectRadius: 0.1,
  });
  slide1.addText("5 PHYSICS RISK ENGINES\nNASA Aerodynamic Drag & Lift\nSliding, Toppling & Uplift FS\nDual-Height Edge Fall Protection", {
    x: 4.9,
    y: 4.7,
    w: 3.2,
    h: 1.7,
    fontSize: 11,
    color: TEXT_LIGHT,
    fontFace: "Arial",
  });

  slide1.addShape(pres.ShapeType.roundRect, {
    x: 8.6,
    y: 4.5,
    w: 3.9,
    h: 2.1,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_EMERALD, width: 1 },
    rectRadius: 0.1,
  });
  slide1.addText("MOBILE PATROL & AI\nGemini 3.8 Flash Vision Intake\nSub-Second Camera QR Decoding\n5-Entry Safety Audit Trail", {
    x: 8.8,
    y: 4.7,
    w: 3.5,
    h: 1.7,
    fontSize: 11,
    color: TEXT_LIGHT,
    fontFace: "Arial",
  });

  // ==========================================
  // SLIDE 2: Industry Problem Statement
  // ==========================================
  const slide2 = createDarkSlide();
  slide2.addText("THE HIGH-RISE WIND HAZARD GAP", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_ROSE,
    bold: true,
  });
  slide2.addText("Why Conventional Staging Protocols Fail in High Winds", {
    x: 0.8,
    y: 0.9,
    w: 11.0,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const problems = [
    {
      title: "1. Elevation Wind Amplification (Boundary Layer z/z0)",
      desc: "Ground winds of 10 m/s amplify to over 16-22 m/s at 45m (12F) due to zero ground friction and structural corner vortices. Ground inspectors cannot visually gauge this critical threshold.",
      color: ACCENT_ROSE,
    },
    {
      title: "2. The Guardrail Overtopping Trap (Dual-Elevation)",
      desc: "Materials stacked to 2.2m behind standard 1.2m perimeter railings create an aerodynamic pivot. Toppling cargo leverages over the rail and plunges 45m into street levels below.",
      color: ACCENT_ROSE,
    },
    {
      title: "3. Delayed Physical Action Window",
      desc: "When sudden squalls strike, safety staff cannot manually inspect 20+ scattered yard locations to check which bundles lack ratchet straps or rubber friction pads.",
      color: ACCENT_AMBER,
    },
    {
      title: "4. Unverifiable Compliance Audit Paperwork",
      desc: "KOSHA and OSHA regulations mandate quantitative audit trails for windproofing, but construction sites still rely on retrospective, subjective paper logs.",
      color: ACCENT_AMBER,
    },
  ];

  problems.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.9;
    const y = 1.7 + row * 2.5;

    slide2.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 5.6,
      h: 2.2,
      fill: { color: CARD_DARK },
      line: { color: p.color, width: 1 },
      rectRadius: 0.1,
    });

    slide2.addText(p.title, {
      x: x + 0.2,
      y: y + 0.2,
      w: 5.2,
      h: 0.4,
      fontSize: 14,
      color: p.color,
      bold: true,
    });

    slide2.addText(p.desc, {
      x: x + 0.2,
      y: y + 0.7,
      w: 5.2,
      h: 1.3,
      fontSize: 11,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 3: KMA Live Meteorological Integration
  // ==========================================
  const slide3 = createDarkSlide();
  slide3.addText("METEOROLOGICAL BACKBONE", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide3.addText("Real-Time KMA Open API Pipeline & 24h Predictive Timeline", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const kmaItems = [
    {
      title: "Live Observation API",
      items: [
        "Direct connection to Korea Meteorological Administration Ultra-Short-Term API",
        "Pulls 10-minute mean wind (V_mean) and instantaneous peak gust (V_gust)",
        "Tracks barometric pressure, precipitation, and wind vector angles",
      ],
    },
    {
      title: "Multi-Hub Regional Presets & GPS",
      items: [
        "Songdo Landmark Tower (Incheon): Coastal gale exposure",
        "Gangnam Highrise (Seoul): Urban canyon wind vortexing",
        "Haeundae Marine Complex (Busan): Maritime typhoon gusts",
        "HTML5 GPS automatic local grid coordinate (nx, ny) assignment",
      ],
    },
    {
      title: "Virtual Wind Simulator Bench",
      items: [
        "Interactive test slider from 0 to 35 m/s",
        "Simulates typhoon and seasonal gust escalations in real-time",
        "Automatic siren & notification triggering at threshold (>= 14.0 m/s)",
      ],
    },
  ];

  kmaItems.forEach((item, idx) => {
    const x = 0.8 + idx * 3.9;
    slide3.addShape(pres.ShapeType.roundRect, {
      x,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_CYAN, width: 1 },
      rectRadius: 0.1,
    });

    slide3.addText(item.title, {
      x: x + 0.2,
      y: 2.0,
      w: 3.3,
      h: 0.5,
      fontSize: 14,
      color: ACCENT_CYAN,
      bold: true,
    });

    const bulletText = item.items.map((it) => "• " + it).join("\n\n");
    slide3.addText(bulletText, {
      x: x + 0.2,
      y: 2.7,
      w: 3.3,
      h: 3.7,
      fontSize: 11,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 4: The 5 Physical Hazards Engine
  // ==========================================
  const slide4 = createDarkSlide();
  slide4.addText("CLASSICAL MECHANICS & AERODYNAMICS", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide4.addText("The 5 Physical Failure Modes Formulation", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const hazards = [
    {
      name: "1. Sliding (미끄러짐)",
      formula: "FS = [μ·(M·g + F_strap - F_lift)] / [0.5·ρ·V²·Cd·A]",
      desc: "Static friction vs stagnation aerodynamic drag force. Rubber pads raise μ from 0.35 to 0.65; ratchet straps add downward normal force.",
    },
    {
      name: "2. Toppling (전도)",
      formula: "FS = [(M·g + F_strap - F_lift)·(W/2) + M_strap] / [F_drag·(H/2)]",
      desc: "Wind overturning moment at geometric center of pressure (H/2) vs restoring moment from base dunnage width (W_support) and strap anchoring.",
    },
    {
      name: "3. Uplift (들림)",
      formula: "FS = [M·g + F_strap] / [0.5·ρ·V²·Cl·A_top]",
      desc: "Aerodynamic Bernoulli lift over top surfaces with positive Cl (> 0.3). Critical for stacked plywood, formwork panels, and insulation boards.",
    },
    {
      name: "4. Edge Fall (추락/낙하)",
      formula: "FS_fall = (d_edge / 2.0) · min(FS_s, FS_t) · f(H_rail, H_stack)",
      desc: "Dual-elevation rule: If stack height exceeds railing (+ΔH), protection factor drops to 0.65. Missing railing drops protection to 0.40.",
    },
    {
      name: "5. Scattering (비산)",
      formula: "V_crit = √[ (2·σ·g) / (ρ·Cd) ], where σ = M/A",
      desc: "Threshold wind speed for loose sheets. Unstrapped EPS insulation flies at gusts as low as 8.8 m/s unless tightly strapped or netted.",
    },
  ];

  hazards.forEach((h, idx) => {
    const y = 1.7 + idx * 1.0;
    slide4.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 11.7,
      h: 0.9,
      fill: { color: CARD_DARK },
      line: { color: idx === 3 ? ACCENT_ROSE : ACCENT_AMBER, width: 1 },
      rectRadius: 0.08,
    });

    slide4.addText(h.name, {
      x: 1.0,
      y: y + 0.1,
      w: 2.8,
      h: 0.35,
      fontSize: 12,
      color: idx === 3 ? ACCENT_ROSE : ACCENT_AMBER,
      bold: true,
    });

    slide4.addText(h.formula, {
      x: 3.8,
      y: y + 0.1,
      w: 8.5,
      h: 0.35,
      fontSize: 10,
      color: ACCENT_CYAN,
      fontFace: "Courier New",
      bold: true,
    });

    slide4.addText(h.desc, {
      x: 1.0,
      y: y + 0.45,
      w: 11.3,
      h: 0.4,
      fontSize: 10,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 5: 3D CFD Aerodynamic Wind Tunnel
  // ==========================================
  const slide5 = createDarkSlide();
  slide5.addText("VISUAL AERODYNAMIC DIAGNOSTICS", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide5.addText("Real-Time 3D CFD Aerodynamic Wind Tunnel Visualization", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  // Add 3D CFD Nano-Banana Image on left
  const cfdImgPath = path.resolve("src/assets/images/aerodynamic_wind_tunnel_1792118019118.jpg");
  if (fs.existsSync(cfdImgPath)) {
    slide5.addImage({
      path: cfdImgPath,
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      rounding: true,
    });
  } else {
    slide5.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_CYAN, width: 1 },
      rectRadius: 0.1,
    });
  }

  slide5.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_AMBER, width: 1 },
    rectRadius: 0.1,
  });
  slide5.addText("ELEVATION SHEAR & TERRAIN PROFILE", {
    x: 7.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide5.addText("• Elevation Adjustment: Effective gust scaled by power-law exponent (α = 0.22 for open rooftop; α = 0.18 for enclosed core).\n• Corner Vortex Factor: 1.15x multiplier for storage yards located within 3m of perimeter slab corners.\n• Venturi Funneling: 1.20x multiplier for unprotected slab openings.\n• Dynamic display of effective wind speed superimposed directly onto diagnostics.", {
    x: 7.0,
    y: 2.6,
    w: 5.3,
    h: 3.6,
    fontSize: 12,
    color: TEXT_LIGHT,
  });

  // ==========================================
  // SLIDE 6: Automated Safety Alarm & Siren
  // ==========================================
  const slide6 = createDarkSlide();
  slide6.addText("AUTONOMOUS WARNING SYSTEM", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_ROSE,
    bold: true,
  });
  slide6.addText("Multi-Channel Automated Alarm & Web Audio Siren Synthesizer", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const alarmCards = [
    {
      title: "Automated Triggers",
      color: ACCENT_ROSE,
      text: "• Trigger 1: Instantaneous gust >= 20.0 m/s\n• Trigger 2: Observed mean wind >= 14.0 m/s\n• Trigger 3: Active DANGER count >= 3 yards\n• Immediate visual banner with pulsing hazard countdown.",
    },
    {
      title: "Web Audio Synthesizer",
      color: ACCENT_AMBER,
      text: "• 100% Client-side dual oscillator audio engine\n• Frequency modulation sweep (850Hz <-> 450Hz)\n• Zero external MP3 downloads or lag\n• One-click mute and audible drill testing.",
    },
    {
      title: "OS System Notifications",
      color: ACCENT_CYAN,
      text: "• HTML5 Notification API integration\n• Pushes background alerts to mobile devices\n• Direct vibration and smartwatch notification\n• Eliminates need for manual walkie-talkie relay.",
    },
  ];

  alarmCards.forEach((c, idx) => {
    const x = 0.8 + idx * 3.9;
    slide6.addShape(pres.ShapeType.roundRect, {
      x,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: c.color, width: 1 },
      rectRadius: 0.1,
    });
    slide6.addText(c.title, {
      x: x + 0.2,
      y: 2.0,
      w: 3.3,
      h: 0.5,
      fontSize: 14,
      color: c.color,
      bold: true,
    });
    slide6.addText(c.text, {
      x: x + 0.2,
      y: 2.7,
      w: 3.3,
      h: 3.6,
      fontSize: 12,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 7: Gemini 3.8 Flash Vision Intake
  // ==========================================
  const slide7 = createDarkSlide();
  slide7.addText("VISUAL INTELLIGENCE & OCR", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide7.addText("Gemini 3.8 Flash Multimodal Intake & Parameter Extraction", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  slide7.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_AMBER, width: 1 },
    rectRadius: 0.1,
  });
  slide7.addText("3-STEP VISION INTAKE PIPELINE", {
    x: 1.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide7.addText("1. Field Photography:\nInspector photographs incoming delivery trucks or newly staged storage stacks using mobile camera.\n\n2. Multimodal Gemini 3.8 Flash Parsing:\nAI identifies material grade, estimates quantity, counts stacking tiers, gauges packaging tightness, checks ratchet straps, and detects anomalies.\n\n3. Zero-Click Database Insertion:\nExtracted engineering schema is parsed to JSON and written directly to site database with automatic safety factor recalculation.", {
    x: 1.0,
    y: 2.5,
    w: 5.3,
    h: 3.8,
    fontSize: 11,
    color: TEXT_LIGHT,
  });

  slide7.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: "020617" },
    line: { color: ACCENT_CYAN, width: 1 },
    rectRadius: 0.1,
  });
  slide7.addText("EXTRACTED JSON ENGINEERING SCHEMA", {
    x: 7.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 12,
    color: ACCENT_CYAN,
    bold: true,
    fontFace: "Courier New",
  });
  const jsonCode = `{\n  "material_name": "Extruded EPS Insulation (100T)",\n  "category": "INSULATION",\n  "estimated_count": 36,\n  "stack_tiers": 3,\n  "bundle_state": "INDIVIDUAL_SHEETS",\n  "has_ratchet_straps": false,\n  "support_width_m": 0.8,\n  "anomalies": [\n    "Missing ratchet straps",\n    "Stack height exceeds 1.2m guardrail"\n  ],\n  "confidence_score": 0.94\n}`;
  slide7.addText(jsonCode, {
    x: 7.0,
    y: 2.5,
    w: 5.3,
    h: 3.8,
    fontSize: 11,
    color: TEXT_LIGHT,
    fontFace: "Courier New",
  });

  // ==========================================
  // SLIDE 8: Mobile Field Patrol Mode & AI Assistant
  // ==========================================
  const slide8 = createDarkSlide();
  slide8.addText("FIELD OPERABILITY & ASSISTANT", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide8.addText("Mobile Field Patrol View & Gemini AI Safety Assistant", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  // Add Mobile Patrol Nano-Banana Image on left
  const mobileImgPath = path.resolve("src/assets/images/nanobanana_mobile_patrol_1792124316883.jpg");
  if (fs.existsSync(mobileImgPath)) {
    slide8.addImage({
      path: mobileImgPath,
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      rounding: true,
    });
  } else {
    slide8.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_AMBER, width: 1 },
      rectRadius: 0.1,
    });
  }

  slide8.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_EMERALD, width: 1 },
    rectRadius: 0.1,
  });
  slide8.addText("CONVERSATIONAL GEMINI AI PATROL ASSISTANT", {
    x: 7.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_EMERALD,
    bold: true,
  });
  slide8.addText("• Real-time contextual QnA trained on live site status.\n• 1-Tap Field Query Chips:\n  - '🚨 Where is urgent danger right now?'\n  - '🔍 Which location should I inspect first?'\n  - '⚠️ Which yards have loose unstrapped cargo?'\n• Actionable Briefings: Gives 1-2 sentence decisive answers and generates a direct '[Inspect Target Yard Now]' jump link.", {
    x: 7.0,
    y: 2.6,
    w: 5.3,
    h: 3.6,
    fontSize: 12,
    color: TEXT_LIGHT,
  });

  // ==========================================
  // SLIDE 9: Camera QR Code Yard Tag Scanner
  // ==========================================
  const slide9 = createDarkSlide();
  slide9.addText("FIELD HARDWARE TELEMETRY", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide9.addText("Camera-Based QR Code Yard Tag Scanner (jsQR Engine)", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const qrFeatures = [
    {
      title: "Sub-Second Video Frame Decoding",
      text: "Runs pure client-side computer vision on the HTML5 camera video stream at 30 FPS, decoding QR payloads in under 200 milliseconds without internet latency.",
    },
    {
      title: "Tactile Audio & Laser Visual Reticle",
      text: "Includes animated laser scanning sweep, high-contrast corner reticles, and pleasant audio chime confirmation upon QR acquisition.",
    },
    {
      title: "Instant Yard Telemetry Linking",
      text: "Scanning physical pallet tags pulls up storage elevation, live safety factor (FS), material cross-section, and maintenance history immediately.",
    },
    {
      title: "Built-In Tag Simulation Bench",
      text: "Interactive sample tag buttons allow seamless live demonstration and testing on laptops without active camera permissions.",
    },
  ];

  qrFeatures.forEach((q, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.9;
    const y = 1.8 + row * 2.5;

    slide9.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 5.6,
      h: 2.2,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_CYAN, width: 1 },
      rectRadius: 0.1,
    });
    slide9.addText(q.title, {
      x: x + 0.2,
      y: y + 0.2,
      w: 5.2,
      h: 0.4,
      fontSize: 13,
      color: ACCENT_CYAN,
      bold: true,
    });
    slide9.addText(q.text, {
      x: x + 0.2,
      y: y + 0.7,
      w: 5.2,
      h: 1.3,
      fontSize: 11,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 10: Location Safety Maintenance History Log
  // ==========================================
  const slide10 = createDarkSlide();
  slide10.addText("AUDIT TRAIL & VERIFIABILITY", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_EMERALD,
    bold: true,
  });
  slide10.addText("5-Entry Location Safety Maintenance History Audit Log", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  slide10.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 11.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_EMERALD, width: 1 },
    rectRadius: 0.1,
  });

  slide10.addText("PERSISTENT 5-ENTRY AUDIT COMPLIANCE PER YARD", {
    x: 1.1,
    y: 2.0,
    w: 11.0,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_EMERALD,
    bold: true,
  });

  const logSamples = [
    {
      time: "2026-10-15 13:40",
      user: "Lead Safety Officer Kim",
      status: "SAFE",
      notes: "Dunnage leveled with spirit level; ratchet strap tension verified at 2.5kN on rooftop pallet.",
    },
    {
      time: "2026-10-15 09:15",
      user: "Site Inspector Park",
      status: "ACTION TAKEN",
      notes: "Re-fastened upper ratchet straps after KMA strong wind advisory was issued.",
    },
    {
      time: "2026-10-14 16:30",
      user: "Structural Field Inspector Lee",
      status: "SAFE",
      notes: "Relocated top insulation bundle 3.0m inward away from slab edge; guardrail clearance restored.",
    },
  ];

  logSamples.forEach((log, idx) => {
    const y = 2.6 + idx * 1.1;
    slide10.addShape(pres.ShapeType.roundRect, {
      x: 1.1,
      y,
      w: 11.1,
      h: 0.95,
      fill: { color: "020617" },
      line: { color: "334155", width: 1 },
      rectRadius: 0.08,
    });
    slide10.addText(`${log.time}  |  ${log.user}  |  [${log.status}]`, {
      x: 1.3,
      y: y + 0.1,
      w: 10.7,
      h: 0.35,
      fontSize: 11,
      color: ACCENT_AMBER,
      bold: true,
    });
    slide10.addText(log.notes, {
      x: 1.3,
      y: y + 0.45,
      w: 10.7,
      h: 0.4,
      fontSize: 11,
      color: TEXT_LIGHT,
    });
  });

  // ==========================================
  // SLIDE 11: Real-Time Mitigation Simulation
  // ==========================================
  const slide11 = createDarkSlide();
  slide11.addText("PREDICTIVE MITIGATION DECISION", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide11.addText("Real-Time What-If Mitigation Simulation (Before vs. After)", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  // Add Mitigation Engineering Nano-Banana Image on left
  const mitImgPath = path.resolve("src/assets/images/nanobanana_mitigation_engineering_1792124316759.jpg");
  if (fs.existsSync(mitImgPath)) {
    slide11.addImage({
      path: mitImgPath,
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      rounding: true,
    });
  } else {
    slide11.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_AMBER, width: 1 },
      rectRadius: 0.1,
    });
  }

  slide11.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_EMERALD, width: 1 },
    rectRadius: 0.1,
  });
  slide11.addText("BEFORE VS. AFTER DELTA RECALCULATION", {
    x: 7.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_EMERALD,
    bold: true,
  });
  slide11.addText("• Sliding Safety Factor:\n  0.42 (DANGER)  ->  1.68 (SAFE)  [Δ +1.26]\n\n• Overturning Safety Factor:\n  0.88 (DANGER)  ->  2.15 (SAFE)  [Δ +1.27]\n\n• Perimeter Fall Factor:\n  0.65 (DANGER)  ->  1.84 (SAFE)  [Δ +1.19]\n\n• 1-Click Commit: Writes the verified mitigation state directly to site database with zero human transcription error.", {
    x: 7.0,
    y: 2.6,
    w: 5.3,
    h: 3.6,
    fontSize: 12,
    color: TEXT_LIGHT,
  });

  // ==========================================
  // SLIDE 12: Nationwide Hubs & Bilingual Architecture
  // ==========================================
  const slide12 = createDarkSlide();
  slide12.addText("ENTERPRISE MULTI-LOCALE", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide12.addText("Nationwide Site Presets & 100% Dual-Language System", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  slide12.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_CYAN, width: 1 },
    rectRadius: 0.1,
  });
  slide12.addText("100% COMPLETE BILINGUAL PARITY", {
    x: 1.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide12.addText("• Complete dictionary parity across 220+ technical keys in i18n service.\n• Seamless instantaneous KO <-> EN switching.\n• Zero state reset, zero formula loss, zero page reload.\n• Empowers multinational field workers and foreign safety auditors with identical aerodynamic telemetry.", {
    x: 1.0,
    y: 2.6,
    w: 5.3,
    h: 3.6,
    fontSize: 12,
    color: TEXT_LIGHT,
  });

  slide12.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    fill: { color: CARD_DARK },
    line: { color: ACCENT_AMBER, width: 1 },
    rectRadius: 0.1,
  });
  slide12.addText("NATIONWIDE HUB PROFILES", {
    x: 7.0,
    y: 2.0,
    w: 5.3,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide12.addText("• Pre-calibrated terrain roughness profiles, coastal proximity factors, and building elevation heights for major Korean industrial corridors:\n  - Incheon Songdo (Coastal gale profile)\n  - Seoul Gangnam (Dense urban boundary profile)\n  - Busan Haeundae (Maritime typhoon profile)\n  - Gangwon Pyeongchang (Mountain ridge profile)", {
    x: 7.0,
    y: 2.6,
    w: 5.3,
    h: 3.6,
    fontSize: 12,
    color: TEXT_LIGHT,
  });

  // ==========================================
  // SLIDE 13: Technical Architecture & Production Quality
  // ==========================================
  const slide13 = createDarkSlide();
  slide13.addText("SYSTEM SPECIFICATION", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_AMBER,
    bold: true,
  });
  slide13.addText("High-Performance Client-Authoritative Stack", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const stackItems = [
    { title: "React 19 & Vite 8", desc: "60 FPS reactive UI with sub-second HMR and instant state re-rendering." },
    { title: "TypeScript 5 Strict", desc: "Zero runtime type coercion errors across physical aerodynamic math." },
    { title: "Gemini 3.8 Flash SDK", desc: "State-of-the-art vision and streaming QnA assistant integration." },
    { title: "jsQR Computer Vision", desc: "30 FPS client-side video frame decoding with zero external API calls." },
  ];

  stackItems.forEach((s, idx) => {
    const x = 0.8 + idx * 2.95;
    slide13.addShape(pres.ShapeType.roundRect, {
      x,
      y: 1.8,
      w: 2.8,
      h: 2.2,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_AMBER, width: 1 },
      rectRadius: 0.1,
    });
    slide13.addText(s.title, {
      x: x + 0.15,
      y: 2.0,
      w: 2.5,
      h: 0.4,
      fontSize: 13,
      color: ACCENT_AMBER,
      bold: true,
    });
    slide13.addText(s.desc, {
      x: x + 0.15,
      y: 2.5,
      w: 2.5,
      h: 1.3,
      fontSize: 11,
      color: TEXT_LIGHT,
    });
  });

  slide13.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.4,
    w: 11.7,
    h: 2.2,
    fill: { color: "020617" },
    line: { color: ACCENT_CYAN, width: 1 },
    rectRadius: 0.1,
  });
  slide13.addText("PRODUCTION RESILIENCE HIGHLIGHTS", {
    x: 1.1,
    y: 4.6,
    w: 11.0,
    h: 0.35,
    fontSize: 13,
    color: ACCENT_CYAN,
    bold: true,
  });
  slide13.addText("• Sub-2ms Physics Execution: All aerodynamic formulas run client-side without network bottlenecks.\n• LocalStorage Persistence: Yard configurations, inspection logs, and custom regions survive browser restarts.\n• Responsive Zero-Overflow Design: Validated across 4K displays down to 360px mobile viewports.", {
    x: 1.1,
    y: 5.1,
    w: 11.0,
    h: 1.3,
    fontSize: 11,
    color: TEXT_LIGHT,
  });

  // ==========================================
  // SLIDE 14: Conclusion & Operational Impact
  // ==========================================
  const slide14 = createDarkSlide();
  slide14.addText("VERIFIABLE VALUE", {
    x: 0.8,
    y: 0.6,
    w: 10.0,
    h: 0.3,
    fontSize: 12,
    color: ACCENT_EMERALD,
    bold: true,
  });
  slide14.addText("Transforming Yard Wind Safety into an Exact Science", {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    color: TEXT_LIGHT,
    bold: true,
  });

  const kpis = [
    { num: ">90%", label: "Reduction in Wind Accidents", desc: "Eliminates toppling and perimeter drop catastrophes through proactive FS checks." },
    { num: "45 Min", label: "Time Saved per Shift", desc: "Replaces manual walkie-talkie checks and paper calculation with 0.2s QR telemetry." },
    { num: "100%", label: "Verifiable Digital Audit Trail", desc: "Provides continuous compliance with KDS structural and KOSHA safety guidelines." },
  ];

  kpis.forEach((k, idx) => {
    const x = 0.8 + idx * 3.9;
    slide14.addShape(pres.ShapeType.roundRect, {
      x,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_DARK },
      line: { color: ACCENT_EMERALD, width: 1 },
      rectRadius: 0.1,
    });

    slide14.addText(k.num, {
      x: x + 0.2,
      y: 2.2,
      w: 3.3,
      h: 0.8,
      fontSize: 36,
      color: ACCENT_EMERALD,
      bold: true,
      align: "center",
    });

    slide14.addText(k.label, {
      x: x + 0.2,
      y: 3.2,
      w: 3.3,
      h: 0.5,
      fontSize: 14,
      color: TEXT_LIGHT,
      bold: true,
      align: "center",
    });

    slide14.addText(k.desc, {
      x: x + 0.2,
      y: 3.9,
      w: 3.3,
      h: 2.2,
      fontSize: 12,
      color: TEXT_MUTED,
      align: "center",
    });
  });

  // Ensure public directory exists
  const publicDir = path.resolve("public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, "SafeStack_Weather_Guard_Presentation.pptx");
  await pres.writeFile({ fileName: outputPath });
  console.log(`Successfully generated PPTX file at: ${outputPath}`);
}

generatePresentation().catch((err) => {
  console.error("Failed to generate PPTX:", err);
  process.exit(1);
});
