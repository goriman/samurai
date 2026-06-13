(function () {
  "use strict";

  const COLORS = {
    black: "#000000",
    orange: "#ff8a00",
    orangeDim: "#3a210b",
    fire: "#ff5a1f",
    fireSub: "#ffb347",
    ice: "#6fd3ff",
    iceSub: "#d6f4ff",
    lightning: "#ffe45c",
    lightningSub: "#fff6a3",
    wind: "#7ee787",
    windSub: "#5eead4",
    absorb: "#c084fc",
    absorbSub: "#f0abfc",
    monsterBloodMain: "#4f7f2a",
    monsterBloodDark: "#244a23",
    monsterBloodWet: "#6f9f34",
    monsterBloodPulse: "#a6d94a"
  };
  const ORANGE = COLORS.orange;
  const LIGHT_ORANGE = COLORS.orangeDim;
  const BLACK = COLORS.black;
  const TITLE_HOT = COLORS.fire;
  const TITLE_LIGHT = COLORS.fireSub;
  const BLOOD = COLORS.monsterBloodMain;
  const BLOOD_DARK = COLORS.monsterBloodDark;
  const BLOOD_WET = COLORS.monsterBloodWet;
  const BLOOD_BRIGHT = COLORS.monsterBloodPulse;
  const UI_HEIGHT = 64;
  const GRID_SIZE = 64;
  const RENDER_SCALE = 1;
  const BLOOD_SUBCELL_SIZE = 8;
  const SHAPE_RENDER_CONFIG = {
    targetAreaRatio: 0.5,
    targetWidthRatio: 0.78,
    targetHeightRatio: 0.86,
    minCellSize: 7,
    maxCellSize: 34,
    padding: 24
  };
  const FULL_SPIN = Math.PI * 2;
  const DEBUG_ATTACK_AREA = false;
  const ELEMENT_ITEMS = ["fire", "ice", "lightning", "wind", "absorb"];
  const CONSUMABLE_ITEMS = ["collectAllExp", "damageAllEnemies"];
  const ELEMENT_LABELS = {
    fire: "炎",
    ice: "氷",
    lightning: "雷",
    wind: "風",
    absorb: "吸"
  };
  const ATTRIBUTE_DEFINITIONS = {
    fire: {
      displayName: "炎",
      milestones: { 5: "火花", 10: "炎上", 15: "爆ぜ斬り", 20: "火柱" }
    },
    ice: {
      displayName: "氷",
      milestones: { 5: "霜斬り", 10: "凍結", 15: "砕氷", 20: "氷刃" }
    },
    lightning: {
      displayName: "雷",
      milestones: { 5: "感電", 10: "連鎖雷", 15: "雷鳴", 20: "落雷" }
    },
    wind: {
      displayName: "風",
      milestones: { 5: "突風", 10: "旋風", 15: "壁砕き", 20: "竜巻斬り" }
    },
    absorb: {
      displayName: "吸収",
      milestones: { 5: "優先吸収", 10: "連鎖吸収", 15: "斬撃回収", 20: "大渦" }
    }
  };
  const ATTRIBUTE_COLORS = {
    fire: { main: COLORS.fire, sub: COLORS.fireSub },
    ice: { main: COLORS.ice, sub: COLORS.iceSub },
    lightning: { main: COLORS.lightning, sub: COLORS.lightningSub },
    wind: { main: COLORS.wind, sub: COLORS.windSub },
    absorb: { main: COLORS.absorb, sub: COLORS.absorbSub }
  };
  const EFFECT_QUALITY = {
    maxParticles: 360,
    killParticles: 24,
    heavyKillParticles: 34,
    hitParticles: 7,
    xpParticles: 3,
    levelParticles: 30,
    maxBursts: 44,
    maxLegacyEffects: 150
  };
  const SFX_MASTER_VOLUME = 0.32;
  const SFX_MAX_VOICES = 22;
  const CRITICAL_DEFAULTS = {
    chance: 0.08,
    multiplier: 1.75,
    knockbackMultiplier: 1.55,
    dismemberChanceBonus: 0.24
  };
  const COMBO_BLOOD_BONUS = {
    minHits: 5,
    base: 4,
    perHit: 0.48,
    sqrt: 1.85,
    max: 110
  };
  const BASE_PARTS = ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const WEAPON_PARTS = {
    farmer: [],
    spear: ["weaponMain"],
    sword: ["weaponMain"],
    archer: ["weaponMain"],
    midBoss: ["weaponMain", "weaponSub"],
    midBossArcher: ["weaponMain", "weaponSub"],
    levelBoss: ["weaponMain", "weaponSub", "horn"],
    blinkNinja: ["weaponMain"]
  };
  const BLOOD_GOAL_PRESETS = Array.isArray(window.BLOOD_GOAL_PRESETS) && window.BLOOD_GOAL_PRESETS.length > 0
    ? window.BLOOD_GOAL_PRESETS
    : [{ name: "仮血紋", rows: ["OOOO", "OHHH", "OAAO", "OOOO"] }];

  const ENEMY_TYPES = {
    farmer: {
      label: "F",
      hp: 12,
      speed: 48,
      damage: 5,
      radius: 7,
      xp: 3,
      contactRange: 13,
      attackRange: 13,
      attackCooldown: 0.75,
      knockbackResist: 1.2,
      weapon: "body"
    },
    spear: {
      label: "P",
      hp: 16,
      speed: 36,
      damage: 4,
      radius: 8,
      xp: 5,
      contactRange: 12,
      attackRange: 34,
      attackCooldown: 1.9,
      knockbackResist: 0.85,
      weapon: "spear"
    },
    sword: {
      label: "S",
      hp: 18,
      speed: 44,
      damage: 6,
      radius: 8,
      xp: 6,
      contactRange: 12,
      attackRange: 22,
      attackCooldown: 1.55,
      knockbackResist: 0.75,
      weapon: "sword"
    },
    archer: {
      label: "R",
      hp: 14,
      speed: 40,
      damage: 4,
      radius: 8,
      xp: 7,
      contactRange: 11,
      attackRange: 122,
      attackCooldown: 1.7,
      knockbackResist: 0.95,
      weapon: "bow"
    },
    scout: {
      label: "D",
      hp: 10,
      speed: 72,
      damage: 4,
      radius: 7,
      xp: 4,
      contactRange: 10,
      attackRange: 15,
      attackCooldown: 0.8,
      knockbackResist: 1.05,
      weapon: "dagger"
    },
    shield: {
      label: "G",
      hp: 34,
      speed: 32,
      damage: 5,
      radius: 10,
      xp: 9,
      contactRange: 13,
      attackRange: 18,
      attackCooldown: 1.35,
      knockbackResist: 0.55,
      weapon: "shield"
    },
    brute: {
      label: "H",
      hp: 72,
      speed: 24,
      damage: 12,
      radius: 13,
      xp: 16,
      contactRange: 16,
      attackRange: 24,
      attackCooldown: 1.9,
      knockbackResist: 0.32,
      weapon: "club"
    },
    monk: {
      label: "M",
      hp: 24,
      speed: 30,
      damage: 8,
      radius: 9,
      xp: 10,
      contactRange: 12,
      attackRange: 50,
      attackCooldown: 2.1,
      knockbackResist: 0.7,
      weapon: "monk"
    },
    armor: {
      label: "A",
      hp: 58,
      speed: 27,
      damage: 7,
      radius: 11,
      xp: 12,
      contactRange: 14,
      attackRange: 18,
      attackCooldown: 1.75,
      knockbackResist: 0.35,
      weapon: "armor"
    },
    midBoss: {
      label: "B",
      hp: 180,
      speed: 30,
      damage: 13,
      radius: 18,
      xp: 24,
      contactRange: 18,
      attackRange: 42,
      attackCooldown: 1.35,
      knockbackResist: 0.18,
      weapon: "boss"
    },
    midBossArcher: {
      label: "Y",
      hp: 150,
      speed: 38,
      damage: 10,
      radius: 17,
      xp: 22,
      contactRange: 16,
      attackRange: 150,
      attackCooldown: 1.1,
      knockbackResist: 0.22,
      weapon: "archerBoss"
    },
    levelBoss: {
      label: "X",
      hp: 320,
      speed: 28,
      damage: 18,
      radius: 24,
      xp: 45,
      contactRange: 22,
      attackRange: 56,
      attackCooldown: 1.15,
      knockbackResist: 0.1,
      weapon: "levelBoss"
    },
    blinkNinja: {
      label: "N",
      hp: 26,
      speed: 82,
      damage: 9,
      radius: 8,
      xp: 14,
      contactRange: 12,
      attackRange: 20,
      attackCooldown: 0.95,
      knockbackResist: 0.95,
      weapon: "ninja"
    }
  };

  class SfxManager {
    constructor() {
      this.context = null;
      this.masterGain = null;
      this.enabled = true;
      this.muted = false;
      this.activeVoices = 0;
      this.maxVoices = SFX_MAX_VOICES;
      this.masterVolume = SFX_MASTER_VOLUME;
      this.unlocked = false;
      this.unlockChimed = false;
      this.pendingUnlockChime = false;
      this.resumePromise = null;
      this.resumeError = "";
      this.resumeErrorName = "";
      this.lastUnlockEvent = "none";
      this.lastUnlockAt = 0;
      this.lastContextState = "none";
      this.primedOutput = false;
      this.lastPlayed = new Map();
      this.noiseBuffers = new Map();
      this.pending = {
        hit: 0,
        kill: 0,
        killCombo: 1,
        killHeavy: false,
        killCritical: false,
        critical: 0,
        xp: 0,
        dismember: 0,
        dismemberPower: 0,
        dismemberMetal: false,
        dismemberBoss: false,
        wall: 0,
        wallPower: 0,
        absorb: 0,
        absorbLevel: 0,
        bloodSpray: 0,
        bloodImpact: 0,
        bloodImpactLevel: 0,
        elements: {}
      };
      this.xpCombo = 0;
      this.lastXpAt = 0;
      this.cooldowns = {
        swing: 0.09,
        hit: 0.035,
        kill: 0.052,
        xp: 0.028,
        levelUp: 0.28,
        hurt: 0.13,
        item: 0.12,
        boss: 0.45,
        dismember: 0.055,
        wall: 0.08,
        absorb: 0.04,
        bloodSpray: 0.032,
        bloodImpact: 0.045,
        element: 0.035,
        critical: 0.05,
        bloodComplete: 0.6,
        gameOver: 1.2,
        gameOverDrone: 1.35
      };
    }

    update() {
      if (this.pending.hit > 0) {
        this.playHitBatch(this.pending.hit);
        this.pending.hit = 0;
      }
      if (this.pending.kill > 0) {
        this.playKillBatch(this.pending.kill, this.pending.killCombo, this.pending.killHeavy, this.pending.killCritical);
        this.pending.kill = 0;
        this.pending.killCombo = 1;
        this.pending.killHeavy = false;
        this.pending.killCritical = false;
      }
      if (this.pending.critical > 0) {
        this.playCriticalBatch(this.pending.critical);
        this.pending.critical = 0;
      }
      if (this.pending.xp > 0) {
        this.playXpBatch(this.pending.xp);
        this.pending.xp = 0;
      }
      if (this.pending.dismember > 0) {
        this.playDismemberBatch(this.pending.dismember, this.pending.dismemberPower, this.pending.dismemberMetal, this.pending.dismemberBoss);
        this.pending.dismember = 0;
        this.pending.dismemberPower = 0;
        this.pending.dismemberMetal = false;
        this.pending.dismemberBoss = false;
      }
      if (this.pending.wall > 0) {
        this.playWallBatch(this.pending.wall, this.pending.wallPower);
        this.pending.wall = 0;
        this.pending.wallPower = 0;
      }
      if (this.pending.absorb > 0) {
        this.playAbsorbBatch(this.pending.absorb, this.pending.absorbLevel);
        this.pending.absorb = 0;
        this.pending.absorbLevel = 0;
      }
      if (this.pending.bloodSpray > 0) {
        this.playBloodSprayBatch(this.pending.bloodSpray);
        this.pending.bloodSpray = 0;
      }
      if (this.pending.bloodImpact > 0) {
        this.playBloodImpactBatch(this.pending.bloodImpact, this.pending.bloodImpactLevel);
        this.pending.bloodImpact = 0;
        this.pending.bloodImpactLevel = 0;
      }
      for (const kind of Object.keys(this.pending.elements)) {
        this.playElementBatch(kind, this.pending.elements[kind]);
      }
      this.pending.elements = {};
    }

    queueHit() {
      this.pending.hit = Math.min(8, this.pending.hit + 1);
    }

    queueKill(combo = 1, heavy = false, critical = false) {
      this.pending.kill = Math.min(6, this.pending.kill + 1);
      this.pending.killCombo = Math.max(this.pending.killCombo, combo);
      this.pending.killHeavy = this.pending.killHeavy || heavy;
      this.pending.killCritical = this.pending.killCritical || critical;
    }

    queueCritical() {
      this.pending.critical = Math.min(4, this.pending.critical + 1);
    }

    queueXp() {
      this.pending.xp = Math.min(10, this.pending.xp + 1);
    }

    queueDismember(part = "", boss = false) {
      const metallic = part && (part.startsWith("weapon") || part === "horn");
      const heavyPart = part === "head" || part === "body" || metallic;
      const power = (boss ? 1.75 : 1) + (metallic ? 0.45 : 0) + (heavyPart ? 0.28 : 0);
      this.pending.dismember = Math.min(5, this.pending.dismember + 1);
      this.pending.dismemberPower = Math.max(this.pending.dismemberPower, power);
      this.pending.dismemberMetal = this.pending.dismemberMetal || metallic;
      this.pending.dismemberBoss = this.pending.dismemberBoss || boss;
    }

    queueWall(power = 1) {
      this.pending.wall = Math.min(4, this.pending.wall + 1);
      this.pending.wallPower = Math.max(this.pending.wallPower, power);
    }

    queueAbsorb(count = 1, level = 1) {
      this.pending.absorb = Math.min(12, this.pending.absorb + count);
      this.pending.absorbLevel = Math.max(this.pending.absorbLevel, level);
    }

    queueBloodSpray(count = 1) {
      this.pending.bloodSpray = Math.min(10, this.pending.bloodSpray + count);
    }

    queueBloodImpact(count = 1, level = 1) {
      this.pending.bloodImpact = Math.min(14, this.pending.bloodImpact + count);
      this.pending.bloodImpactLevel = Math.max(this.pending.bloodImpactLevel, level);
    }

    queueElement(kind) {
      this.pending.elements[kind] = Math.min(5, (this.pending.elements[kind] || 0) + 1);
    }

    audioReady() {
      const ready = !!this.context && this.context.state === "running";
      this.unlocked = ready;
      this.lastContextState = this.context ? this.context.state : "none";
      return ready;
    }

    unlock(playChime = false, allowCreate = true, eventType = "manual") {
      if (playChime) this.pendingUnlockChime = true;
      this.lastUnlockEvent = eventType;
      this.lastUnlockAt = performance.now();
      const ctx = this.ensureContext(allowCreate);
      if (!ctx) return Promise.resolve(false);
      this.lastContextState = ctx.state;
      if (ctx.state === "running") {
        this.unlocked = true;
        this.resumeError = "";
        this.resumeErrorName = "";
        this.primeOutput();
        if (this.pendingUnlockChime) {
          this.pendingUnlockChime = false;
          this.playUnlockChime();
        }
        return Promise.resolve(true);
      }
      if (ctx.state !== "suspended") return Promise.resolve(false);
      if (this.resumePromise) return this.resumePromise;
      this.resumePromise = ctx.resume()
        .then(() => {
          this.unlocked = ctx.state === "running";
          this.lastContextState = ctx.state;
          this.resumeError = "";
          this.resumeErrorName = "";
          if (this.unlocked) this.primeOutput();
          if (this.unlocked && this.pendingUnlockChime) {
            this.pendingUnlockChime = false;
            this.playUnlockChime();
          }
          return this.unlocked;
        })
        .catch((error) => {
          this.unlocked = false;
          this.lastContextState = ctx.state;
          this.resumeErrorName = error && error.name ? error.name : "AudioResumeError";
          this.resumeError = error && error.message ? error.message : "resume failed";
          console.warn("[audio] WebAudio resume failed", {
            eventType,
            name: this.resumeErrorName,
            message: this.resumeError,
            state: ctx.state,
            userAgent: navigator.userAgent
          });
          return false;
        })
        .finally(() => {
          this.resumePromise = null;
        });
      return this.resumePromise;
    }

    ensureContext(allowCreate = false) {
      if (!this.enabled || this.muted) return null;
      if (!this.context) {
        if (!allowCreate) return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          this.enabled = false;
          this.resumeErrorName = "AudioContextUnavailable";
          this.resumeError = "WebAudio unsupported";
          console.warn("[audio] WebAudio is unavailable", { userAgent: navigator.userAgent });
          return null;
        }
        try {
          this.context = new AudioContextClass();
        } catch (error) {
          this.enabled = false;
          this.resumeErrorName = error && error.name ? error.name : "AudioContextCreateError";
          this.resumeError = error && error.message ? error.message : "AudioContext create failed";
          console.warn("[audio] AudioContext create failed", {
            name: this.resumeErrorName,
            message: this.resumeError,
            userAgent: navigator.userAgent
          });
          return null;
        }
        this.lastContextState = this.context.state;
        this.masterGain = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -22;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.006;
        this.compressor.release.value = 0.18;
        this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.context.destination);
      }
      return this.context;
    }

    primeOutput() {
      if (this.primedOutput || !this.context || !this.masterGain) return;
      try {
        const buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        gain.gain.value = 0.0001;
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(0);
        source.stop(this.context.currentTime + 0.03);
        this.primedOutput = true;
      } catch (error) {
        this.resumeError = error && error.message ? error.message : "prime failed";
      }
    }

    playUnlockChime() {
      if (this.unlockChimed || !this.context) return;
      this.unlockChimed = true;
      this.playTone(660, 0.055, { type: "triangle", volume: 0.045, priority: true });
      this.playTone(990, 0.07, { type: "square", volume: 0.035, delay: 0.04, priority: true });
    }

    debugState() {
      const state = this.context ? this.context.state : "none";
      const detail = this.resumeErrorName ? ` ${this.resumeErrorName}` : "";
      return `音声:${state}${detail} 入力:${this.lastUnlockEvent}`;
    }

    canPlay(name, priority = false) {
      const ctx = this.context;
      if (!ctx || ctx.state !== "running") {
        this.unlocked = false;
        this.lastContextState = ctx ? ctx.state : "none";
        return false;
      }
      const now = ctx.currentTime;
      const last = this.lastPlayed.get(name) || -999;
      if (now - last < (this.cooldowns[name] || 0)) return false;
      if (!priority && this.activeVoices >= this.maxVoices) return false;
      this.lastPlayed.set(name, now);
      return true;
    }

    beginVoice(priority = false) {
      if (!priority && this.activeVoices >= this.maxVoices) return false;
      this.activeVoices += 1;
      return true;
    }

    endVoice() {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }

    playTone(freq, duration, options = {}) {
      const ctx = this.ensureContext(false);
      if (!ctx || !this.beginVoice(options.priority)) return;
      const start = ctx.currentTime + (options.delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const volume = options.volume || 0.05;
      osc.type = options.type || "square";
      osc.frequency.setValueAtTime(freq, start);
      if (options.endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFreq), start + duration);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + duration + 0.02);
      osc.onended = () => this.endVoice();
    }

    playNoise(duration, options = {}) {
      const ctx = this.ensureContext(false);
      if (!ctx || !this.beginVoice(options.priority)) return;
      const start = ctx.currentTime + (options.delay || 0);
      const key = Math.round(duration * 1000);
      let buffer = this.noiseBuffers.get(key);
      if (!buffer) {
        const samples = Math.max(1, Math.floor(ctx.sampleRate * duration));
        buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < samples; i += 1) {
          const fade = 1 - i / samples;
          data[i] = (Math.random() * 2 - 1) * fade;
        }
        this.noiseBuffers.set(key, buffer);
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = options.filterType || "bandpass";
      filter.frequency.value = options.frequency || 1000;
      filter.Q.value = options.q || 1.1;
      gain.gain.setValueAtTime(options.volume || 0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(start);
      source.onended = () => this.endVoice();
    }

    swing() {
      if (!this.canPlay("swing")) return;
      const jitter = 0.94 + Math.random() * 0.13;
      this.playNoise(0.065, { volume: 0.042, frequency: 2300 * jitter, q: 0.72 });
      this.playTone(980 * jitter, 0.055, { type: "sawtooth", volume: 0.024, endFreq: 360 * jitter });
      this.playTone(2100 * jitter, 0.018, { type: "triangle", volume: 0.018, delay: 0.004, endFreq: 1500 * jitter });
    }

    playHitBatch(count) {
      if (!this.canPlay("hit")) return;
      const strength = Math.min(1.45, 1 + (count - 1) * 0.08);
      this.playTone(92, 0.026, { type: "square", volume: 0.06 * strength, endFreq: 58 });
      this.playNoise(0.052, { volume: 0.082 * strength, frequency: 1180 + count * 60, q: 2.4 });
      this.playTone(1220 + count * 70, 0.036, { type: "triangle", volume: 0.038 * strength, delay: 0.008, endFreq: 1740 + count * 80 });
    }

    playKillBatch(count, combo = 1, heavy = false, critical = false) {
      const originalCooldown = this.cooldowns.kill;
      this.cooldowns.kill = combo > 1 ? 0.035 : originalCooldown;
      const playable = this.canPlay("kill", true);
      this.cooldowns.kill = originalCooldown;
      if (!playable) return;
      const pitch = 1 + Math.min(0.5, (combo - 1) * 0.055 + (count - 1) * 0.035);
      const force = Math.min(1.62, 1 + count * 0.08 + (heavy ? 0.18 : 0) + (critical ? 0.22 : 0));
      this.playTone(58 * pitch, 0.075, { type: "square", volume: 0.1 * force, endFreq: 36 * pitch, priority: true });
      this.playNoise(0.105, { volume: 0.105 * force, frequency: 620 * pitch, q: 0.95, priority: true });
      this.playNoise(0.048, { volume: 0.072 * force, frequency: 2100 * pitch, q: 2.2, delay: 0.012, priority: true });
      this.playTone(420 * pitch, 0.07, { type: "sawtooth", volume: 0.062 * force, delay: 0.015, endFreq: 900 * pitch, priority: true });
      this.playTone(1480 * pitch, 0.06, { type: "triangle", volume: 0.052 * force, delay: 0.04, endFreq: 2100 * pitch, priority: true });
    }

    playCriticalBatch(count) {
      if (!this.canPlay("critical", true)) return;
      const force = Math.min(1.35, 1 + count * 0.08);
      this.playTone(72, 0.055, { type: "square", volume: 0.08 * force, endFreq: 42, priority: true });
      this.playNoise(0.052, { volume: 0.07 * force, frequency: 1800, q: 2.8, priority: true });
      this.playTone(1760, 0.05, { type: "triangle", volume: 0.055 * force, delay: 0.012, endFreq: 2400, priority: true });
    }

    playXpBatch(count) {
      if (!this.canPlay("xp")) return;
      const ctx = this.context;
      const now = ctx ? ctx.currentTime : 0;
      this.xpCombo = now - this.lastXpAt < 0.25 ? Math.min(9, this.xpCombo + count) : 0;
      this.lastXpAt = now;
      const base = 560 + this.xpCombo * 44;
      this.playTone(base, 0.043, { type: "square", volume: 0.03 + Math.min(0.02, count * 0.003), endFreq: base * 1.34 });
      if (count >= 4) this.playTone(base * 1.5, 0.035, { type: "triangle", volume: 0.025, delay: 0.025, endFreq: base * 1.8 });
    }

    playDismemberBatch(count, power = 1, metallic = false, boss = false) {
      if (!this.canPlay("dismember", true)) return;
      const strength = Math.min(2.15, 0.88 + count * 0.11 + power * 0.26 + (boss ? 0.3 : 0));
      this.playTone(boss ? 64 : 92, 0.07, { type: "square", volume: 0.078 * strength, endFreq: boss ? 42 : 54, priority: true });
      this.playNoise(0.062, { volume: 0.092 * strength, frequency: metallic ? 1900 : 1280, q: metallic ? 3.1 : 2.0, priority: true });
      this.playTone(metallic ? 1560 : 320, 0.052, { type: metallic ? "triangle" : "sawtooth", volume: 0.056 * strength, delay: 0.01, endFreq: metallic ? 840 : 150, priority: true });
      this.playTone(1320 + count * 55, 0.042, { type: "triangle", volume: 0.044 * strength, delay: 0.028, endFreq: metallic ? 2160 : 780, priority: true });
      if (boss || count >= 3) {
        this.playNoise(0.095, { volume: 0.054 * strength, frequency: 420, q: 0.75, delay: 0.03, priority: true });
      }
    }

    playWallBatch(count, power) {
      if (!this.canPlay("wall", true)) return;
      const strength = Math.min(1.55, 0.9 + count * 0.12 + power * 0.28);
      this.playTone(48, 0.105, { type: "square", volume: 0.115 * strength, endFreq: 34, priority: true });
      this.playNoise(0.09, { volume: 0.095 * strength, frequency: 310 + power * 90, q: 1.0, priority: true });
      this.playTone(180 + power * 40, 0.055, { type: "sawtooth", volume: 0.055 * strength, delay: 0.018, endFreq: 90, priority: true });
    }

    playAbsorbBatch(count, level) {
      if (!this.canPlay("absorb")) return;
      const pitch = 1 + Math.min(0.55, count * 0.045 + level * 0.012);
      this.playNoise(0.055, { volume: 0.035, frequency: 1700 * pitch, q: 0.65 });
      this.playTone(620 * pitch, 0.052, { type: "triangle", volume: 0.042, endFreq: 980 * pitch });
      if (count >= 3) this.playTone(1100 * pitch, 0.045, { type: "square", volume: 0.03, delay: 0.03, endFreq: 1500 * pitch });
    }

    playBloodSprayBatch(count) {
      if (!this.canPlay("bloodSpray")) return;
      const force = Math.min(1.8, 0.9 + count * 0.12);
      this.playNoise(0.075, { volume: 0.085 * force, frequency: 420, q: 0.8 });
      this.playNoise(0.038, { volume: 0.055 * force, frequency: 1450, q: 1.4, delay: 0.012 });
    }

    playBloodImpactBatch(count, level) {
      if (!this.canPlay("bloodImpact")) return;
      const pitch = 1 + Math.min(0.72, count * 0.045 + level * 0.018);
      const force = Math.min(1.7, 0.85 + count * 0.08 + level * 0.025);
      this.playTone(210 * pitch, 0.09, { type: "sawtooth", volume: 0.07 * force, endFreq: 420 * pitch });
      this.playNoise(0.08, { volume: 0.052 * force, frequency: 780 * pitch, q: 0.75, delay: 0.018 });
      this.playTone(92, 0.075, { type: "square", volume: 0.056 * force, delay: 0.052, endFreq: 58 });
      if (level >= 8) this.playTone(1240 * pitch, 0.075, { type: "triangle", volume: 0.05, delay: 0.075, endFreq: 1740 * pitch });
    }

    playElementBatch(kind, count) {
      if (!this.canPlay("element")) return;
      const boost = Math.min(1.25, 1 + count * 0.06);
      if (kind === "fire") {
        this.playNoise(0.05, { volume: 0.04 * boost, frequency: 620, q: 0.8 });
        this.playTone(170, 0.04, { type: "square", volume: 0.03 * boost, endFreq: 250 });
      } else if (kind === "ice") {
        this.playTone(1500, 0.045, { type: "triangle", volume: 0.045 * boost, endFreq: 980 });
        this.playTone(2100, 0.025, { type: "square", volume: 0.026 * boost, delay: 0.018, endFreq: 1900 });
      } else if (kind === "lightning") {
        this.playTone(1800, 0.035, { type: "sawtooth", volume: 0.045 * boost, endFreq: 620 });
        this.playNoise(0.035, { volume: 0.025 * boost, frequency: 2500, q: 2.6 });
      } else if (kind === "wind") {
        this.playNoise(0.07, { volume: 0.038 * boost, frequency: 1350, q: 0.55 });
        this.playTone(360, 0.06, { type: "triangle", volume: 0.028 * boost, endFreq: 180 });
      }
    }

    levelUp() {
      if (!this.canPlay("levelUp", true)) return;
      this.playTone(130, 0.11, { type: "square", volume: 0.09, endFreq: 196, priority: true });
      [392, 523, 659, 784, 1046, 1318].forEach((freq, index) => {
        this.playTone(freq, 0.105, { type: index < 2 ? "square" : "triangle", volume: 0.072, delay: 0.035 + index * 0.034, priority: true });
      });
      this.playNoise(0.12, { volume: 0.046, frequency: 2200, q: 0.8, delay: 0.16, priority: true });
      this.playTone(1568, 0.12, { type: "triangle", volume: 0.06, delay: 0.23, endFreq: 2093, priority: true });
    }

    bloodComplete() {
      if (!this.canPlay("bloodComplete", true)) return;
      this.playTone(48, 0.32, { type: "sawtooth", volume: 0.13, endFreq: 36, priority: true });
      this.playNoise(0.18, { volume: 0.1, frequency: 360, q: 0.7, priority: true });
      this.playTone(96, 0.14, { type: "square", volume: 0.11, delay: 0.12, endFreq: 72, priority: true });
      this.playTone(1568, 0.09, { type: "triangle", volume: 0.075, delay: 0.24, endFreq: 2352, priority: true });
      [330, 440, 660, 880, 1320].forEach((freq, index) => {
        this.playTone(freq, 0.13, { type: index < 2 ? "sawtooth" : "triangle", volume: 0.064, delay: 0.38 + index * 0.075, priority: true });
      });
      this.playTone(70, 0.18, { type: "square", volume: 0.1, delay: 0.74, endFreq: 52, priority: true });
      this.playNoise(0.28, { volume: 0.05, frequency: 980, q: 0.55, delay: 0.82, priority: true });
    }

    hurt() {
      if (!this.canPlay("hurt", true)) return;
      this.playTone(74, 0.13, { type: "square", volume: 0.125, endFreq: 42, priority: true });
      this.playNoise(0.09, { volume: 0.085, frequency: 260, q: 0.85, priority: true });
      this.playTone(210, 0.055, { type: "sawtooth", volume: 0.054, delay: 0.012, endFreq: 96, priority: true });
    }

    item() {
      if (!this.canPlay("item", true)) return;
      this.playTone(720, 0.065, { type: "triangle", volume: 0.055, priority: true });
      this.playTone(1080, 0.09, { type: "square", volume: 0.045, delay: 0.045, priority: true });
    }

    boss() {
      if (!this.canPlay("boss", true)) return;
      this.playTone(92, 0.16, { type: "sawtooth", volume: 0.075, endFreq: 58, priority: true });
      this.playTone(138, 0.12, { type: "square", volume: 0.045, delay: 0.08, endFreq: 104, priority: true });
    }

    gameOver() {
      if (!this.canPlay("gameOver", true)) return;
      this.playTone(96, 0.22, { type: "square", volume: 0.13, endFreq: 54, priority: true });
      this.playNoise(0.24, { volume: 0.08, frequency: 170, q: 0.8, delay: 0.04, priority: true });
      this.playTone(72, 0.42, { type: "sawtooth", volume: 0.095, delay: 0.18, endFreq: 38, priority: true });
      this.playTone(48, 0.62, { type: "square", volume: 0.075, delay: 0.5, endFreq: 32, priority: true });
      this.playNoise(0.42, { volume: 0.04, frequency: 520, q: 0.55, delay: 0.86, priority: true });
    }

    gameOverDrone() {
      if (!this.canPlay("gameOverDrone", true)) return;
      this.playTone(42, 0.55, { type: "sawtooth", volume: 0.045, endFreq: 36, priority: true });
      this.playNoise(0.22, { volume: 0.026, frequency: 260, q: 0.65, delay: 0.08, priority: true });
    }

    setMuted(muted) {
      this.muted = muted;
      if (this.masterGain) this.masterGain.gain.value = muted ? 0 : this.masterVolume;
    }
  }

  class EffectManager {
    constructor() {
      this.maxParticles = EFFECT_QUALITY.maxParticles;
      this.particles = Array.from({ length: this.maxParticles }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 1,
        gravity: 0,
        drag: 0,
        color: ORANGE
      }));
      this.nextParticle = 0;
      this.maxBursts = EFFECT_QUALITY.maxBursts;
      this.bursts = Array.from({ length: this.maxBursts }, () => ({ active: false, life: 0, maxLife: 1, type: "" }));
      this.nextBurst = 0;
    }

    update(dt) {
      const offX = window.innerWidth + 80;
      const offY = window.innerHeight + 80;
      for (let i = 0; i < this.maxParticles; i += 1) {
        const p = this.particles[i];
        if (!p.active) continue;
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.max(0, 1 - p.drag * dt);
        p.vy = p.vy * Math.max(0, 1 - p.drag * dt) + p.gravity * dt;
        if (p.life <= 0 || p.x < -80 || p.x > offX || p.y < -80 || p.y > offY) p.active = false;
      }
      for (let i = 0; i < this.maxBursts; i += 1) {
        const burst = this.bursts[i];
        if (!burst.active) continue;
        burst.life -= dt;
        if (burst.life <= 0) burst.active = false;
      }
    }

    particle(x, y, vx, vy, life, size, gravity = 0, drag = 3.2, color = ORANGE) {
      const p = this.particles[this.nextParticle];
      this.nextParticle = (this.nextParticle + 1) % this.maxParticles;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = life;
      p.maxLife = life;
      p.size = size;
      p.gravity = gravity;
      p.drag = drag;
      p.color = color;
    }

    burst(effect) {
      const burst = this.bursts[this.nextBurst];
      this.nextBurst = (this.nextBurst + 1) % this.maxBursts;
      for (const key of Object.keys(burst)) {
        if (key !== "active") delete burst[key];
      }
      Object.assign(burst, effect, { active: true });
    }

    hit(x, y, dir, power) {
      const side = { x: -dir.y, y: dir.x };
      const count = EFFECT_QUALITY.hitParticles + Math.min(4, Math.floor(power / 5));
      for (let i = 0; i < count; i += 1) {
        const spread = (Math.random() - 0.5) * 130;
        const speed = 90 + Math.random() * 145 + power;
        this.particle(
          x + side.x * spread * 0.035,
          y + side.y * spread * 0.035,
          dir.x * speed + side.x * spread,
          dir.y * speed + side.y * spread,
          0.18 + Math.random() * 0.16,
          2 + Math.random() * 3,
          40,
          6
        );
      }
      this.burst({ type: "hitSpark", x, y, dir, life: 0.14, maxLife: 0.14, size: 20 + power * 0.25 });
    }

    criticalHit(x, y, dir, width) {
      const side = { x: -dir.y, y: dir.x };
      for (let i = 0; i < 10; i += 1) {
        const spread = (Math.random() - 0.5) * 170;
        const speed = 160 + Math.random() * 180;
        this.particle(x, y, dir.x * speed + side.x * spread, dir.y * speed + side.y * spread, 0.16 + Math.random() * 0.16, 3 + (i % 3), 40, 5.5);
      }
      this.burst({ type: "criticalHit", x, y, dir, life: 0.2, maxLife: 0.2, size: 22 + width * 1.5 });
    }

    attributeHit(kind, x, y, dir, level) {
      const main = attributeColor(kind, "main");
      const sub = attributeColor(kind, "sub");
      const side = { x: -dir.y, y: dir.x };
      const count = Math.min(10, 4 + Math.floor(level / 3));
      for (let i = 0; i < count; i += 1) {
        const spread = (Math.random() - 0.5) * 90;
        const speed = 55 + Math.random() * 95 + level * 5;
        let vx = dir.x * speed + side.x * spread;
        let vy = dir.y * speed + side.y * spread;
        if (kind === "ice") {
          vx = side.x * spread * 0.75;
          vy = side.y * spread * 0.75 - 28 - Math.random() * 38;
        } else if (kind === "lightning") {
          vx = (Math.random() - 0.5) * 180;
          vy = -80 - Math.random() * 120;
        } else if (kind === "absorb") {
          vx = -dir.x * speed * 0.8 + side.x * spread * 0.4;
          vy = -dir.y * speed * 0.8 + side.y * spread * 0.4;
        }
        this.particle(x, y, vx, vy, 0.12 + Math.random() * 0.12, 2 + (i % 3), kind === "fire" ? 45 : 0, 5.5, i % 3 === 0 ? sub : main);
      }
      this.burst({ type: "attributeSpark", kind, x, y, dir, life: kind === "lightning" ? 0.12 : 0.18, maxLife: kind === "lightning" ? 0.12 : 0.18, size: 14 + Math.min(20, level * 2) });
    }

    burnTick(x, y, radius = 10, remaining = 0) {
      const main = attributeColor("fire", "main");
      const sub = attributeColor("fire", "sub");
      const count = Math.min(9, 4 + Math.floor(radius / 8));
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const speed = 38 + Math.random() * 84 + Math.min(26, remaining * 6);
        const side = (Math.random() - 0.5) * radius * 4;
        this.particle(
          x + (Math.random() - 0.5) * radius * 0.8,
          y + radius * 0.28,
          Math.cos(angle) * speed + side,
          Math.sin(angle) * speed,
          0.18 + Math.random() * 0.14,
          2 + (i % 3),
          28,
          4.5,
          i % 3 === 0 ? sub : main
        );
      }
      this.burst({ type: "burnTick", x, y, life: 0.2, maxLife: 0.2, size: 16 + Math.min(22, radius * 0.9) });
    }

    kill(x, y, dir, combo, heavy, criticalKill = false) {
      const side = { x: -dir.y, y: dir.x };
      const boost = Math.min(1.85, 1 + combo * 0.06 + (heavy ? 0.35 : 0));
      const baseCount = heavy ? EFFECT_QUALITY.heavyKillParticles : EFFECT_QUALITY.killParticles;
      const count = criticalKill ? Math.min(58, Math.floor((baseCount + combo * 2) * boost)) : Math.min(18, Math.floor(baseCount * 0.45));
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * FULL_SPIN;
        const radial = { x: Math.cos(angle), y: Math.sin(angle) };
        const forwardBias = Math.random() < 0.58 ? dir : radial;
        const spray = Math.random() < 0.45 ? side : radial;
        const speed = (70 + Math.random() * 260) * boost;
        const size = 1 + Math.random() * (heavy ? 6 : 4);
        this.particle(
          x + radial.x * Math.random() * 5,
          y + radial.y * Math.random() * 5,
          forwardBias.x * speed + spray.x * (Math.random() - 0.5) * 220,
          forwardBias.y * speed + spray.y * (Math.random() - 0.5) * 220,
          0.24 + Math.random() * 0.34,
          size + (i % 7 === 0 ? 2 : 0),
          120 + Math.random() * 120,
          2.5
        );
      }
      const streaks = criticalKill ? heavy ? 12 : 9 : 4;
      for (let i = 0; i < streaks; i += 1) {
        const offset = (i - streaks / 2) * 8;
        this.particle(x + side.x * offset, y + side.y * offset, dir.x * (260 + i * 22), dir.y * (260 + i * 22), 0.16 + i * 0.01, 4 + (i % 3), 55, 4.2);
      }
      if (criticalKill) this.burst({ type: "killBurst", x, y, dir, combo, heavy, life: 0.42, maxLife: 0.42, size: 26 + combo * 2 + (heavy ? 28 : 0) });
      else this.burst({ type: "collapse", x, y, life: 0.2, maxLife: 0.2, size: 18 + (heavy ? 14 : 0) });
      if (criticalKill) this.burst({ type: "slashAfter", x, y, dir, life: 0.3, maxLife: 0.3, size: 52 + combo * 3 + (heavy ? 36 : 0) });
      this.burst({ type: "collapse", x, y, life: 0.18, maxLife: 0.18, size: 20 + (heavy ? 20 : 0) });
    }

    xp(x, y, progress) {
      const count = progress > 0.8 ? EFFECT_QUALITY.xpParticles + 2 : EFFECT_QUALITY.xpParticles;
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * FULL_SPIN;
        const speed = 24 + Math.random() * 65;
        this.particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 0.18 + Math.random() * 0.18, 2, 0, 6);
      }
    }

    dismember(x, y, dir, part) {
      const side = { x: -dir.y, y: dir.x };
      const bias = part.includes("left") ? -1 : 1;
      const upward = part === "head";
      const centerBurst = part === "body";
      const metallic = part && part.startsWith("weapon");
      const count = centerBurst ? 16 : metallic ? 10 : 12;
      for (let i = 0; i < count; i += 1) {
        const spread = (Math.random() - 0.5) * (centerBurst ? 260 : 180);
        const speed = 90 + Math.random() * (metallic ? 230 : 190);
        const out = upward ? { x: dir.x * 0.35, y: -1 } : centerBurst ? { x: Math.cos(i / count * FULL_SPIN), y: Math.sin(i / count * FULL_SPIN) } : dir;
        this.particle(x + side.x * bias * 5, y + side.y * bias * 5, out.x * speed + side.x * spread, out.y * speed + side.y * spread, 0.18 + Math.random() * 0.26, metallic ? 3 + (i % 2) : 2 + (i % 4), upward ? 40 : 100, 3.5);
      }
      this.burst({ type: "dismember", x, y, dir, part, life: 0.22, maxLife: 0.22, size: 22 });
    }

    bossDismember(x, y, dir, part, scale = 1) {
      const side = { x: -dir.y, y: dir.x };
      const weaponBreak = part && part.startsWith("weapon");
      const count = Math.floor((weaponBreak ? 18 : 34) * scale);
      for (let i = 0; i < count; i += 1) {
        const angle = weaponBreak ? Math.PI / 2 + (Math.random() - 0.5) * 0.55 : Math.atan2(dir.y, dir.x) + (Math.random() - 0.5) * 2.8;
        const speed = weaponBreak ? 70 + Math.random() * 145 * scale : 130 + Math.random() * 310 * scale;
        const size = i % 3 === 0 ? 5 : 3;
        this.particle(
          x + side.x * (Math.random() - 0.5) * (weaponBreak ? 10 : 18) * scale,
          y + side.y * (Math.random() - 0.5) * (weaponBreak ? 10 : 18) * scale,
          Math.cos(angle) * speed + side.x * (Math.random() - 0.5) * (weaponBreak ? 70 : 170),
          Math.sin(angle) * speed + (weaponBreak ? 70 : side.y * (Math.random() - 0.5) * 170),
          weaponBreak ? 0.18 + Math.random() * 0.26 : 0.24 + Math.random() * 0.42,
          size,
          90,
          4.2
        );
      }
      this.burst({ type: "bossDismember", x, y, dir, part, life: 0.62, maxLife: 0.62, size: 44 * scale });
      this.burst({ type: "bossDismemberText", x, y: y - 42 * scale, part, life: 0.86, maxLife: 0.86, size: scale });
    }

    wallImpact(x, y, normal, power) {
      const side = { x: -normal.y, y: normal.x };
      const count = 12 + Math.min(14, Math.floor(power * 8));
      for (let i = 0; i < count; i += 1) {
        const spread = (Math.random() - 0.5) * 210;
        const speed = 100 + Math.random() * 190 + power * 45;
        this.particle(x, y, normal.x * speed + side.x * spread, normal.y * speed + side.y * spread, 0.2 + Math.random() * 0.32, 2 + (i % 5), 80, 3.2);
      }
      this.burst({ type: "wallImpact", x, y, normal, life: 0.28, maxLife: 0.28, size: 30 + power * 10 });
    }

    absorbLine(x, y, targetX, targetY, level) {
      this.burst({ type: "absorbLine", x, y, targetX, targetY, level, life: 0.16, maxLife: 0.16, size: 1 });
    }

    levelUp(x, y, upgrade, compact = false) {
      this.burst({ type: "levelRing", x, y, upgrade, life: 0.9, maxLife: 0.9, size: 26 });
      this.burst({ type: "levelText", x, y: y - (compact ? 92 : 58), upgrade, compact, life: 1.15, maxLife: 1.15, size: 1 });
      for (let i = 0; i < EFFECT_QUALITY.levelParticles; i += 1) {
        const angle = (FULL_SPIN / EFFECT_QUALITY.levelParticles) * i;
        const speed = 110 + Math.random() * 80;
        this.particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 0.35 + Math.random() * 0.35, 2 + (i % 3), 0, 3.4);
      }
    }

    draw(ctx) {
      let currentColor = "";
      for (let i = 0; i < this.maxParticles; i += 1) {
        const p = this.particles[i];
        if (!p.active) continue;
        if (p.color !== currentColor) {
          currentColor = p.color;
          ctx.fillStyle = currentColor;
        }
        const t = clamp(p.life / p.maxLife, 0, 1);
        rect(ctx, p.x - p.size / 2, p.y - p.size / 2, Math.max(1, p.size * t), Math.max(1, p.size * t));
      }
      for (let i = 0; i < this.maxBursts; i += 1) {
        const b = this.bursts[i];
        if (b.active) this.drawBurst(ctx, b);
      }
    }

    drawBurst(ctx, burst) {
      const t = clamp(burst.life / burst.maxLife, 0, 1);
      const grow = 1 - t;
      ctx.fillStyle = ORANGE;
      if (burst.type === "hitSpark") {
        const dir = burst.dir;
        const side = { x: -dir.y, y: dir.x };
        const size = burst.size * t;
        thickLinePixels(ctx, burst.x - side.x * size, burst.y - side.y * size, burst.x + side.x * size, burst.y + side.y * size, 3);
        thickLinePixels(ctx, burst.x - dir.x * size * 0.6, burst.y - dir.y * size * 0.6, burst.x + dir.x * size * 0.9, burst.y + dir.y * size * 0.9, 2);
      } else if (burst.type === "criticalHit") {
        const dir = burst.dir;
        const side = { x: -dir.y, y: dir.x };
        const size = burst.size * t;
        thickLinePixels(ctx, burst.x - side.x * size, burst.y - side.y * size, burst.x + side.x * size, burst.y + side.y * size, 5);
        thickLinePixels(ctx, burst.x - dir.x * size * 0.45, burst.y - dir.y * size * 0.45, burst.x + dir.x * size * 0.65, burst.y + dir.y * size * 0.65, 4);
        rect(ctx, burst.x - 5, burst.y - 5, 10, 10);
      } else if (burst.type === "attributeSpark") {
        const dir = burst.dir || { x: 1, y: 0 };
        const side = { x: -dir.y, y: dir.x };
        const size = burst.size * t;
        ctx.fillStyle = attributeColor(burst.kind, "main");
        if (burst.kind === "fire") {
          thickLinePixels(ctx, burst.x - side.x * size * 0.45, burst.y - side.y * size * 0.45, burst.x + dir.x * size * 0.8, burst.y + dir.y * size * 0.8, 3);
          ctx.fillStyle = attributeColor(burst.kind, "sub");
          rect(ctx, burst.x - 2, burst.y - size * 0.6, 4, 5);
        } else if (burst.kind === "ice") {
          linePixels(ctx, burst.x - size, burst.y, burst.x + size, burst.y);
          linePixels(ctx, burst.x, burst.y - size, burst.x, burst.y + size);
          ctx.fillStyle = attributeColor(burst.kind, "sub");
          linePixels(ctx, burst.x - size * 0.65, burst.y - size * 0.65, burst.x + size * 0.65, burst.y + size * 0.65);
        } else if (burst.kind === "lightning") {
          thickLinePixels(ctx, burst.x - side.x * size * 0.35, burst.y - side.y * size * 0.35, burst.x + dir.x * size * 0.35, burst.y + dir.y * size * 0.35, 2);
          ctx.fillStyle = attributeColor(burst.kind, "sub");
          linePixels(ctx, burst.x + dir.x * size * 0.35, burst.y + dir.y * size * 0.35, burst.x - dir.x * size * 0.1 + side.x * size * 0.5, burst.y - dir.y * size * 0.1 + side.y * size * 0.5);
        } else if (burst.kind === "wind") {
          for (let i = 0; i < 3; i += 1) {
            const offset = (i - 1) * size * 0.28;
            dashedLinePixels(ctx, burst.x - dir.x * size * 0.6 + side.x * offset, burst.y - dir.y * size * 0.6 + side.y * offset, burst.x + dir.x * size, burst.y + dir.y * size, 3, 7);
          }
        } else if (burst.kind === "absorb") {
          rect(ctx, burst.x - 2, burst.y - 2, 4, 4);
          dashedLinePixels(ctx, burst.x - size, burst.y - size * 0.55, burst.x - 4, burst.y - 2, 3, 6);
          dashedLinePixels(ctx, burst.x + size, burst.y + size * 0.55, burst.x + 4, burst.y + 2, 3, 6);
        }
      } else if (burst.type === "burnTick") {
        const size = burst.size * (0.35 + grow * 0.8);
        ctx.fillStyle = attributeColor("fire", "main");
        rect(ctx, burst.x - size * 0.45, burst.y - 2, size * 0.9, 4);
        rect(ctx, burst.x - 2, burst.y - size * 0.7, 4, size * 1.1);
        ctx.fillStyle = attributeColor("fire", "sub");
        rect(ctx, burst.x - size * 0.22, burst.y - size * 0.42, Math.max(2, size * 0.44), 3);
      } else if (burst.type === "killBurst") {
        const size = burst.size * (0.4 + grow * 1.6);
        rect(ctx, burst.x - size, burst.y - 2, size * 2, 4);
        rect(ctx, burst.x - 2, burst.y - size, 4, size * 2);
        for (let i = 0; i < 8; i += 1) {
          const angle = FULL_SPIN * i / 8 + grow * 0.8;
          linePixels(ctx, burst.x, burst.y, burst.x + Math.cos(angle) * size * 1.3, burst.y + Math.sin(angle) * size * 1.3);
        }
      } else if (burst.type === "slashAfter") {
        const dir = burst.dir;
        const side = { x: -dir.y, y: dir.x };
        const size = burst.size * t;
        dashedLinePixels(ctx, burst.x - side.x * size * 0.9 - dir.x * size * 0.25, burst.y - side.y * size * 0.9 - dir.y * size * 0.25, burst.x + side.x * size * 0.9 + dir.x * size * 0.45, burst.y + side.y * size * 0.9 + dir.y * size * 0.45, 5, 8);
      } else if (burst.type === "collapse") {
        const size = burst.size * t;
        for (let i = 0; i < 5; i += 1) {
          const w = size * (1 - i * 0.12);
          rect(ctx, burst.x - w / 2 + Math.sin(i * 2 + t * 8) * 4, burst.y - size * 0.5 + i * size * 0.24, w, 2);
        }
      } else if (burst.type === "levelRing") {
        const size = burst.size + grow * 110;
        rect(ctx, burst.x - size, burst.y - size, size * 2, 2);
        rect(ctx, burst.x - size, burst.y + size, size * 2, 2);
        rect(ctx, burst.x - size, burst.y - size, 2, size * 2);
        rect(ctx, burst.x + size, burst.y - size, 2, size * 2);
        for (let i = 0; i < 12; i += 1) {
          const angle = FULL_SPIN * i / 12 + grow * 2;
          rect(ctx, burst.x + Math.cos(angle) * size - 3, burst.y + Math.sin(angle) * size - 3, 6, 6);
        }
      } else if (burst.type === "levelText") {
        ctx.font = `${burst.compact ? 18 : 22}px Courier New, monospace`;
        ctx.fillText("レベルアップ", burst.x - (burst.compact ? 52 : 62), burst.y - grow * 18);
        ctx.font = `${burst.compact ? 12 : 14}px Courier New, monospace`;
        ctx.fillText(burst.upgrade, burst.x - burst.upgrade.length * 4, burst.y + 26 - grow * 18);
      } else if (burst.type === "dismember") {
        const size = burst.size * t;
        const dir = burst.dir;
        const side = { x: -dir.y, y: dir.x };
        thickLinePixels(ctx, burst.x, burst.y, burst.x + dir.x * size + side.x * 6, burst.y + dir.y * size + side.y * 6, 4);
        rect(ctx, burst.x + dir.x * size - 4, burst.y + dir.y * size - 4, burst.part && burst.part.includes("Leg") ? 5 : 8, burst.part && burst.part.includes("Leg") ? 8 : 5);
        dashedLinePixels(ctx, burst.x - side.x * size * 0.4, burst.y - side.y * size * 0.4, burst.x + side.x * size * 0.4, burst.y + side.y * size * 0.4, 3, 6);
      } else if (burst.type === "bossDismember") {
        const dir = burst.dir;
        const side = { x: -dir.y, y: dir.x };
        const weaponBreak = burst.part && burst.part.startsWith("weapon");
        const size = burst.size * (0.42 + t * 0.72);
        const drop = (1 - t) * burst.size * 0.42;
        ctx.fillStyle = ORANGE;
        if (weaponBreak) {
          const shardLength = burst.size * (0.22 + t * 0.46);
          const fall = (1 - t) * burst.size * 0.85;
          const baseX = burst.x + dir.x * burst.size * 0.18;
          const baseY = burst.y + fall;
          thickLinePixels(ctx, baseX - side.x * shardLength * 0.45, baseY - side.y * shardLength * 0.45, baseX + side.x * shardLength * 0.45, baseY + side.y * shardLength * 0.45, Math.max(2, 4 * t));
          thickLinePixels(ctx, baseX - dir.x * shardLength * 0.38, baseY - dir.y * shardLength * 0.38, baseX + dir.x * shardLength * 0.26, baseY + dir.y * shardLength * 0.26, Math.max(2, 3 * t));
          ctx.fillStyle = LIGHT_ORANGE;
          for (let i = 0; i < 5; i += 1) {
            const offset = (i - 2) * burst.size * 0.08;
            const shardSize = Math.max(1, Math.round((3 - Math.abs(i - 2) * 0.4) * t));
            rect(ctx, baseX + side.x * offset - shardSize / 2, baseY + fall * 0.25 + i * 2 - shardSize / 2, shardSize, shardSize);
          }
          return;
        }
        thickLinePixels(ctx, burst.x - side.x * size * 0.62 - dir.x * size * 0.28, burst.y - side.y * size * 0.62 - dir.y * size * 0.28, burst.x + side.x * size * 0.62 + dir.x * size * 0.34, burst.y + side.y * size * 0.62 + dir.y * size * 0.34, Math.max(2, 5 * t));
        thickLinePixels(ctx, burst.x - dir.x * size * 0.58 + side.x * size * 0.18, burst.y - dir.y * size * 0.58 + side.y * size * 0.18, burst.x + dir.x * size * 0.5 - side.x * size * 0.16, burst.y + dir.y * size * 0.5 - side.y * size * 0.16, Math.max(2, 3 * t));
        ctx.fillStyle = LIGHT_ORANGE;
        for (let i = 0; i < 8; i += 1) {
          const angle = FULL_SPIN * i / 8 + 0.35;
          const distanceOut = burst.size * (0.3 + (1 - t) * 0.72);
          const shardSize = Math.max(1, Math.round(4 * t));
          const sx = burst.x + Math.cos(angle) * distanceOut + dir.x * (1 - t) * burst.size * 0.28;
          const sy = burst.y + Math.sin(angle) * distanceOut + drop;
          linePixels(ctx, burst.x + Math.cos(angle) * size * 0.16, burst.y + Math.sin(angle) * size * 0.16, sx, sy);
          rect(ctx, sx - shardSize / 2, sy - shardSize / 2, shardSize, shardSize);
        }
      } else if (burst.type === "bossDismemberText") {
        const label = bossPartLabel(burst.part);
        ctx.fillStyle = ORANGE;
        ctx.font = `${Math.round((17 + t * 3) * burst.size)}px Courier New, monospace`;
        ctx.fillText(`${label}破壊`, burst.x - label.length * 9 - 18, burst.y - (1 - t) * 12);
        if (burst.size >= 1.3) {
          ctx.fillStyle = LIGHT_ORANGE;
          ctx.font = `${Math.round(12 * burst.size)}px Courier New, monospace`;
          ctx.fillText("弱体", burst.x - 18, burst.y + 26 - (1 - t) * 12);
        }
      } else if (burst.type === "wallImpact") {
        const size = burst.size * (0.4 + grow);
        const normal = burst.normal;
        const side = { x: -normal.y, y: normal.x };
        thickLinePixels(ctx, burst.x - side.x * size, burst.y - side.y * size, burst.x + side.x * size, burst.y + side.y * size, 4);
        for (let i = 0; i < 5; i += 1) {
          linePixels(ctx, burst.x, burst.y, burst.x + normal.x * size * (0.7 + i * 0.18) + side.x * (i - 2) * 9, burst.y + normal.y * size * (0.7 + i * 0.18) + side.y * (i - 2) * 9);
        }
      } else if (burst.type === "absorbLine") {
        ctx.fillStyle = attributeColor("absorb", "main");
        const size = 2 + Math.min(5, burst.level);
        dashedLinePixels(ctx, burst.x, burst.y, burst.targetX, burst.targetY, size, 8);
      }
    }
  }

  class ScreenShake {
    constructor() {
      this.time = 0;
      this.duration = 0;
      this.strength = 0;
    }

    add(strength, duration) {
      this.clear();
    }

    update(dt) {
      this.clear();
    }

    clear() {
      this.time = 0;
      this.duration = 0;
      this.strength = 0;
    }

    offset() {
      return { x: 0, y: 0 };
    }
  }

  class ComboManager {
    constructor() {
      this.count = 0;
      this.timer = 0;
      this.displayTimer = 0;
      this.window = 1.15;
      this.lastKillX = 0;
      this.lastKillY = 0;
    }

    update(dt, game) {
      const wasActive = this.count > 0 && this.timer > 0;
      this.timer = Math.max(0, this.timer - dt);
      this.displayTimer = Math.max(0, this.displayTimer - dt);
      if (wasActive && this.timer <= 0) this.end(game, "timeout");
    }

    registerKill(x = 0, y = 0) {
      this.count = this.timer > 0 ? this.count + 1 : 1;
      this.timer = this.window;
      this.displayTimer = 0.95;
      this.lastKillX = x;
      this.lastKillY = y;
      return this.count;
    }

    end(game, reason = "break") {
      if (this.count <= 0) return 0;
      const endedCount = this.count;
      const origin = { x: this.lastKillX, y: this.lastKillY };
      this.count = 0;
      this.timer = 0;
      if (game && reason === "timeout") game.applyComboBloodBonus(endedCount, origin, reason);
      return endedCount;
    }

    draw(ctx, width, height = 0) {
      if (this.displayTimer <= 0 || this.count < 2) return;
      const t = clamp(this.displayTimer / 0.95, 0, 1);
      const pulse = 1 + (1 - t) * 0.16;
      const text = `${this.count}連斬`;
      if (width < 560) {
        const badgeW = Math.min(126, Math.max(78, text.length * 13 + 28));
        const x = 14;
        const y = Math.max(UI_HEIGHT + 64, Math.min(height - 92, UI_HEIGHT + 92));
        ctx.save();
        ctx.globalAlpha = clamp(t * 1.4, 0, 1);
        ctx.fillStyle = BLACK;
        rect(ctx, x, y, badgeW, 34);
        ctx.fillStyle = LIGHT_ORANGE;
        rect(ctx, x, y, badgeW, 2);
        rect(ctx, x, y + 32, badgeW, 2);
        rect(ctx, x, y, 2, 34);
        ctx.fillStyle = ORANGE;
        ctx.font = "18px Courier New, monospace";
        ctx.fillText(text, x + 13, y + 6);
        ctx.fillStyle = LIGHT_ORANGE;
        rect(ctx, x + 10, y + 27, Math.max(4, (badgeW - 20) * clamp(this.timer / this.window, 0, 1)), 2);
        ctx.restore();
        return;
      }
      const x = Math.round(width / 2 - text.length * 7 * pulse);
      const y = UI_HEIGHT + 16;
      ctx.fillStyle = BLACK;
      rect(ctx, x - 16, y - 8, text.length * 14 * pulse + 32, 38);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x - 16, y - 8, text.length * 14 * pulse + 32, 2);
      rect(ctx, x - 16, y + 28, text.length * 14 * pulse + 32, 2);
      ctx.fillStyle = ORANGE;
      ctx.font = `${Math.round(22 * pulse)}px Courier New, monospace`;
      ctx.fillText(text, x, y);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x - 10, y + 25, Math.max(4, (text.length * 12 + 20) * clamp(this.timer / this.window, 0, 1)), 3);
    }
  }

  class AttributeManager {
    constructor(owner) {
      this.owner = owner;
      this.levels = {};
      for (const id of ELEMENT_ITEMS) this.levels[id] = 0;
    }

    get(id) {
      return this.levels[id] || 0;
    }

    add(id, game) {
      if (!ATTRIBUTE_DEFINITIONS[id]) return null;
      this.levels[id] = this.get(id) + 1;
      const level = this.levels[id];
      const milestone = ATTRIBUTE_DEFINITIONS[id].milestones[level] || null;
      if (milestone && game) {
        game.notice = `${ATTRIBUTE_DEFINITIONS[id].displayName} ${level}段: ${milestone}`;
        game.noticeTimer = 2.0;
        game.effectManager.levelUp(this.owner.x, this.owner.y, `${ATTRIBUTE_DEFINITIONS[id].displayName} ${milestone}`);
        game.sfx.levelUp();
      }
      return { id, level, milestone };
    }

    absorbLimit() {
      const level = this.get("absorb");
      if (level <= 0) return 0;
      return 1 + Math.floor(level / 2) + Math.floor(level / 5);
    }

    absorbSpeed() {
      return 360 + this.get("absorb") * 34;
    }

    hasMilestone(id, level) {
      return this.get(id) >= level;
    }

    milestoneText(id) {
      const level = this.get(id);
      const active = Object.keys(ATTRIBUTE_DEFINITIONS[id].milestones)
        .map(Number)
        .filter((milestoneLevel) => level >= milestoneLevel)
        .pop();
      return active ? ATTRIBUTE_DEFINITIONS[id].milestones[active] : "-";
    }
  }

  class DropManager {
    constructor(game) {
      this.game = game;
      this.midBossBonusChance = 0.28;
      this.attributeWeight = 0.7;
    }

    dropEnemyLoot(enemy) {
      this.dropExperience(enemy.x, enemy.y, enemy.def.xp);
      if (enemy.type === "levelBoss") {
        this.game.addAttributePity(100, enemy.x, enemy.y);
        this.dropBonusRewards(enemy.x, enemy.y, 2);
        return;
      }
      if (enemy.type === "midBoss" || enemy.type === "midBossArcher") {
        this.game.addAttributePity(50, enemy.x, enemy.y);
        if (Math.random() < this.midBossBonusChance) this.dropBonusRewards(enemy.x, enemy.y, 1);
        return;
      }
      if (enemy.type === "blinkNinja") {
        this.game.addAttributePity(100, enemy.x, enemy.y);
        this.dropAttribute(enemy.x, enemy.y, true);
        if (enemy.tier >= 3 && Math.random() < 0.38 + enemy.tier * 0.06) this.dropBonusRewards(enemy.x, enemy.y, 1);
        return;
      }
      this.game.addAttributePity(enemy.tier >= 2 ? 2 : 1, enemy.x, enemy.y);
      this.dropNormalItem(enemy.x, enemy.y);
    }

    dropExperience(x, y, value) {
      this.game.orbs.push(new ExperienceOrb(x, y, value));
    }

    dropNormalItem(x, y) {
      if (Math.random() > 0.05) return;
      this.game.items.push(new Item(Math.random() < 0.08 ? "speed" : "heal", x, y));
    }

    dropBonusRewards(x, y, count) {
      for (let i = 0; i < count; i += 1) {
        const angle = count === 1 ? Math.random() * FULL_SPIN : (FULL_SPIN / count) * i + Math.random() * 0.35;
        const spread = count === 1 ? 10 : 22;
        const px = x + Math.cos(angle) * spread;
        const py = y + Math.sin(angle) * spread;
        if (Math.random() < this.attributeWeight) this.dropAttribute(px, py);
        else this.dropConsumable(px, py);
      }
      this.game.effects.push({ type: "rareDrop", x, y, life: 0.9, maxLife: 0.9, size: 38 + count * 8 });
    }

    dropAttribute(x, y, guaranteed = false) {
      const kind = this.game.chooseAttributeKind ? this.game.chooseAttributeKind() : ELEMENT_ITEMS[Math.floor(Math.random() * ELEMENT_ITEMS.length)];
      if (this.game.rememberAttribute) this.game.rememberAttribute(kind);
      this.game.items.push(new Item(kind, x, y));
      this.game.effects.push({ type: "rareDrop", x, y, life: guaranteed ? 1.05 : 0.9, maxLife: guaranteed ? 1.05 : 0.9, size: guaranteed ? 44 : 34 });
    }

    dropConsumable(x, y) {
      const kind = CONSUMABLE_ITEMS[Math.floor(Math.random() * CONSUMABLE_ITEMS.length)];
      this.game.items.push(new Item(kind, x, y));
      this.game.effects.push({ type: "rareDrop", x, y, life: 0.9, maxLife: 0.9, size: 42 });
    }
  }

  class BloodCanvasGoal {
    constructor(playArea, avoidName = "") {
      const candidates = BLOOD_GOAL_PRESETS.filter((preset) => (preset.nameJa || preset.name || preset.id) !== avoidName);
      const pool = candidates.length > 0 ? candidates : BLOOD_GOAL_PRESETS;
      this.preset = pool[Math.floor(Math.random() * pool.length)];
      this.cells = [];
      this.unfinished = [];
      this.filledKeys = new Set();
      this.complete = false;
      this.completedAt = 0;
      this.requiredFill = 3;
      this.totalBlood = 0;
      this.criticalBlood = 0;
      this.bossBlood = 0;
      this.comboBlood = 0;
      this.cellSize = BLOOD_SUBCELL_SIZE;
      this.originX = 0;
      this.originY = 0;
      this.patternWidth = 1;
      this.patternHeight = 1;
      this.progressValue = 0;
      this.layer = null;
      this.dirty = true;
      this.nextBlinkRedraw = 0;
      this.relayout(playArea);
    }

    displayName() {
      return this.preset.nameJa || this.preset.name || this.preset.id || "無題";
    }

    relayout(playArea) {
      const previous = new Map(this.cells.map((cell) => [cell.patternKey, cell.fillAmount]));
      const patternRows = this.preset.pattern || this.preset.rows;
      const bounds = this.patternBounds(patternRows);
      const hasExplicitSize = Number.isFinite(this.preset.width) && Number.isFinite(this.preset.height);
      this.patternHeight = hasExplicitSize ? this.preset.height : bounds.height;
      this.patternWidth = hasExplicitSize ? this.preset.width : bounds.width;
      this.cellSize = this.computeCellSize(playArea, this.patternWidth, this.patternHeight);
      const shapeW = this.patternWidth * this.cellSize;
      const shapeH = this.patternHeight * this.cellSize;
      this.originX = playArea.left + Math.round((playArea.width - shapeW) / 2);
      this.originY = playArea.top + Math.round((playArea.height - shapeH) / 2);
      this.cells = [];
      for (let py = 0; py < patternRows.length; py += 1) {
        for (let px = 0; px < patternRows[py].length; px += 1) {
          const mark = patternRows[py][px];
          if (mark === ".") continue;
          const localX = hasExplicitSize ? px : px - bounds.minX;
          const localY = hasExplicitSize ? py : py - bounds.minY;
          const patternKey = `${px},${py}`;
          const fillAmount = previous.get(patternKey) || 0;
          this.cells.push({
            patternKey,
            mark,
            col: localX,
            row: localY,
            x: this.originX + localX * this.cellSize,
            y: this.originY + localY * this.cellSize,
            cx: this.originX + localX * this.cellSize + this.cellSize / 2,
            cy: this.originY + localY * this.cellSize + this.cellSize / 2,
            requiredFill: this.requiredForMark(mark),
            stage: this.stageForMark(mark),
            fillAmount,
            fill: clamp(fillAmount / this.requiredForMark(mark), 0, 1)
          });
        }
      }
      this.layer = document.createElement("canvas");
      this.layer.width = Math.max(1, Math.ceil(shapeW));
      this.layer.height = Math.max(1, Math.ceil(shapeH));
      this.dirty = true;
      this.refreshCompletion();
    }

    patternBounds(rows) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let y = 0; y < rows.length; y += 1) {
        for (let x = 0; x < rows[y].length; x += 1) {
          if (rows[y][x] === ".") continue;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
      if (!Number.isFinite(minX)) return { minX: 0, minY: 0, width: 1, height: 1 };
      return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
    }

    computeCellSize(playArea, patternWidth, patternHeight) {
      const cfg = SHAPE_RENDER_CONFIG;
      const targetW = Math.max(1, playArea.width * cfg.targetWidthRatio);
      const targetH = Math.max(1, playArea.height * cfg.targetHeightRatio);
      const areaCell = Math.sqrt((playArea.width * playArea.height * cfg.targetAreaRatio) / Math.max(1, patternWidth * patternHeight));
      const fitCell = Math.max(2, Math.min(
        (playArea.width - cfg.padding * 2) / patternWidth,
        (playArea.height - cfg.padding * 2) / patternHeight,
        targetW / patternWidth,
        targetH / patternHeight
      ));
      const desired = Math.min(Math.max(areaCell, cfg.minCellSize), fitCell, cfg.maxCellSize);
      return Math.max(2, Math.floor(desired));
    }

    refreshCompletion() {
      this.unfinished = this.cells.filter((cell) => cell.fillAmount < cell.requiredFill);
      this.completedCount = this.cells.length - this.unfinished.length;
      this.filledKeys = new Set(this.cells.filter((cell) => cell.fillAmount > 0).map((cell) => `${cell.col},${cell.row}`));
      this.progressValue = this.cells.length === 0 ? 0 : this.cells.reduce((sum, cell) => sum + clamp(cell.fill, 0, 1), 0) / this.cells.length;
      const importantDone = this.cells.every((cell) => (cell.mark !== "H" && cell.mark !== "A") || cell.fillAmount >= cell.requiredFill);
      const ratio = this.cells.length > 0 ? this.completedCount / this.cells.length : 0;
      this.complete = this.cells.length > 0 && (this.completedCount >= this.cells.length || (importantDone && ratio >= 0.95) || this.unfinished.length <= 8);
      if (this.complete) this.finishAllCells();
      this.dirty = true;
    }

    finishAllCells() {
      for (const cell of this.cells) {
        cell.fillAmount = cell.requiredFill;
        cell.fill = 1;
      }
      this.unfinished = [];
      this.completedCount = this.cells.length;
      this.progressValue = 1;
      this.dirty = true;
    }

    splatter(x, y, { heavy = false, critical = false, boss = false, rare = false, tier = 0, comboBonusBlood = 0, comboCount = 0, source = "kill" } = {}) {
      if (this.complete || this.cells.length === 0) return { completed: false, cells: [], bloodUnits: 0, changedCount: 0 };
      const isComboBonus = comboBonusBlood > 0;
      const bloodSource = isComboBonus ? "combo" : boss ? "boss" : critical ? "critical" : source;
      const radius = isComboBonus
        ? 132 + Math.min(210, comboCount * 3)
        : 80 + (heavy ? 58 : 0) + (critical ? 42 : 0) + (boss ? 72 : 0);
      const maxCells = isComboBonus
        ? Math.min(18, 5 + Math.floor(Math.sqrt(comboCount)) + Math.floor(comboBonusBlood / 13))
        : boss ? 22 : heavy ? 12 : critical ? 9 : rare ? 8 : Math.max(3, 3 + Math.floor(Math.max(0, tier) / 2));
      const bloodUnits = isComboBonus
        ? comboBonusBlood
        : boss ? 78 + Math.max(0, tier) * 9 + (critical ? 34 : 0)
          : heavy ? 28 + Math.max(0, tier) * 5 + (critical ? 12 : 0)
            : rare ? 22 + Math.max(0, tier) * 4 + (critical ? 10 : 0)
              : 4 + Math.floor(Math.max(0, tier) * 1.5) + (critical ? 7 : 0);
      const candidates = [];
      const endgamePull = this.progressValue > 0.82;
      for (const cell of this.unfinished) {
        const dist = distance(x, y, cell.cx, cell.cy);
        const effectiveDist = endgamePull ? dist * 0.35 : dist;
        if (endgamePull || dist <= radius) candidates.push({ cell, dist: effectiveDist, score: this.cellScore(cell, effectiveDist, bloodSource) });
      }
      if (candidates.length === 0) {
        let nearest = null;
        for (const cell of this.unfinished) {
          const dist = distance(x, y, cell.cx, cell.cy);
          if (!nearest || dist < nearest.dist) nearest = { cell, dist, score: this.cellScore(cell, dist, bloodSource) };
        }
        if (nearest) candidates.push(nearest);
      }
      candidates.sort((a, b) => a.score - b.score);
      const selected = candidates.slice(0, maxCells);
      let remaining = bloodUnits;
      const changed = [];
      let index = 0;
      while (remaining > 0 && selected.length > 0) {
        const cell = selected[index % selected.length].cell;
        const before = cell.fillAmount;
        if (before < cell.requiredFill) {
          cell.fillAmount = Math.min(cell.requiredFill, cell.fillAmount + 1);
          cell.fill = clamp(cell.fillAmount / cell.requiredFill, 0, 1);
          if (!changed.includes(cell)) changed.push(cell);
          remaining -= 1;
          this.totalBlood += 1;
          if (critical) this.criticalBlood += 1;
          if (boss || heavy) this.bossBlood += 1;
          if (isComboBonus) this.comboBlood += 1;
        } else {
          remaining -= 1;
        }
        index += 1;
        if (index > selected.length * 10) break;
      }
      const wasComplete = this.complete;
      this.refreshCompletion();
      return { completed: !wasComplete && this.complete, cells: changed, bloodUnits, changedCount: changed.length };
    }

    requiredForMark(mark) {
      if (mark === "H" || mark === "A") return 2;
      if (mark === "O" || mark === "S") return 3;
      if (mark === "M") return 3;
      return this.requiredFill;
    }

    stageForMark(mark) {
      if (mark === "O") return 0;
      if (mark === "S") return 1;
      if (mark === "M") return 2;
      if (mark === "H" || mark === "A") return 3;
      return 2;
    }

    cellScore(cell, dist, source = "kill") {
      let score = dist;
      const progress = this.progressValue;
      const targetStage = progress < 0.25 ? 0 : progress < 0.55 ? 1 : progress < 0.82 ? 2 : 3;
      score += Math.abs(cell.stage - targetStage) * 34;
      if (source === "combo" && this.hasFilledNeighbor(cell)) score -= 42;
      if (source === "boss" && (cell.mark === "M" || cell.mark === "S")) score -= 26;
      if (source === "critical" && (cell.mark === "H" || cell.mark === "A")) score -= 38;
      if (cell.mark === "H" || cell.mark === "A") score -= progress > 0.68 || source === "critical" ? 28 : 4;
      if (cell.mark === "O" || cell.mark === "S") score -= progress < 0.55 ? 18 : 8;
      if (cell.mark === "M") score -= 4;
      if (cell.fillAmount > 0) score -= 18;
      if (this.hasFilledNeighbor(cell)) score -= 22;
      if (cell.fillAmount >= cell.requiredFill - 1) score -= 12;
      return score + Math.random() * 10;
    }

    hasFilledNeighbor(cell) {
      return this.filledKeys.has(`${cell.col + 1},${cell.row}`)
        || this.filledKeys.has(`${cell.col - 1},${cell.row}`)
        || this.filledKeys.has(`${cell.col},${cell.row + 1}`)
        || this.filledKeys.has(`${cell.col},${cell.row - 1}`);
    }

    drawPreview(ctx, x, y, scale = 2) {
      if (this.cells.length === 0) return;
      const minCol = Math.min(...this.cells.map((cell) => cell.col));
      const minRow = Math.min(...this.cells.map((cell) => cell.row));
      for (const cell of this.cells) {
        const px = x + (cell.col - minCol) * scale;
        const py = y + (cell.row - minRow) * scale;
        ctx.fillStyle = this.bloodTone(cell, 1, true);
        rect(ctx, px, py, scale, scale);
      }
    }

    drawCenteredArtwork(ctx, frameX, frameY, frameW, frameH, t = 0) {
      if (this.cells.length === 0) return;
      const pad = Math.max(18, Math.min(frameW, frameH) * 0.11);
      const baseScale = Math.max(2, Math.floor(Math.min((frameW - pad * 2) / this.patternWidth, (frameH - pad * 2) / this.patternHeight)));
      const appear = clamp(t / 0.7, 0, 1);
      const pulse = 1 + Math.sin(Math.min(1.2, t) * Math.PI) * 0.08 * (1 - clamp((t - 1.2) / 1.4, 0, 1));
      const scale = Math.max(2, Math.floor(baseScale * (0.86 + appear * 0.14) * pulse));
      const artW = this.patternWidth * scale;
      const artH = this.patternHeight * scale;
      const ox = Math.round(frameX + (frameW - artW) / 2);
      const oy = Math.round(frameY + (frameH - artH) / 2 + Math.min(28, frameH * 0.05));
      ctx.save();
      ctx.fillStyle = BLACK;
      ctx.globalAlpha = 0.44;
      rect(ctx, ox - scale, oy + scale, artW + scale * 2, artH + scale * 2);
      ctx.globalAlpha = 1;
      for (const cell of this.cells) {
        const lx = ox + cell.col * scale;
        const ly = oy + cell.row * scale;
        const effect = this.completionCellEffect(cell, t);
        ctx.fillStyle = effect.bright ? BLOOD_BRIGHT : effect.wet ? BLOOD_WET : this.bloodTone(cell, 1, true);
        rect(ctx, lx, ly, scale, scale);
        if (scale >= 6 && effect.bright) rect(ctx, lx + Math.floor(scale * 0.25), ly + Math.floor(scale * 0.25), Math.max(2, Math.floor(scale * 0.5)), 2);
      }
      this.drawCompletionGlyph(ctx, ox, oy, scale, t);
      ctx.restore();
    }

    completionCellEffect(cell, t) {
      const accent = cell.mark === "H" || cell.mark === "A";
      const flash = t < 0.38 && Math.floor(t * 26 + cell.col + cell.row) % 3 === 0;
      const latePulse = accent && t > 0.45 && Math.floor((t - 0.45) * 8) % 2 === 0;
      return { bright: flash || latePulse, wet: accent || cell.mark === "M" };
    }

    drawCompletionGlyph(ctx, ox, oy, scale, t) {
      const effect = this.preset.completionEffect || "curseMark";
      const cx = ox + this.patternWidth * scale / 2;
      const cy = oy + this.patternHeight * scale / 2;
      if (t < 0.28) return;
      ctx.fillStyle = BLOOD_BRIGHT;
      if (effect === "bloodMoon") {
        const r = Math.max(8, scale * 5);
        dashedLinePixels(ctx, cx - r, cy, cx + r, cy, Math.max(2, scale / 2), Math.max(5, scale));
        dashedLinePixels(ctx, cx, cy - r, cx, cy + r, Math.max(2, scale / 2), Math.max(5, scale));
        linePixels(ctx, cx - r * 0.8, cy + r * 0.7, cx + r * 0.8, cy - r * 0.7);
      } else if (effect === "slashSeal") {
        thickLinePixels(ctx, cx - scale * 10, cy + scale * 8, cx + scale * 10, cy - scale * 8, Math.max(2, scale * 0.7));
        rect(ctx, cx + scale * 8, cy - scale * 9, scale * 2, scale * 2);
      } else {
        rect(ctx, cx - scale * 4, cy - scale * 8, scale * 8, scale);
        rect(ctx, cx - scale * 4, cy + scale * 7, scale * 8, scale);
        rect(ctx, cx - scale * 8, cy - scale * 1, scale * 3, scale);
        rect(ctx, cx + scale * 5, cy - scale * 1, scale * 3, scale);
      }
    }

    progress() {
      return this.progressValue;
    }

    draw(ctx) {
      if (!this.layer) return;
      const now = performance.now();
      if (!this.dirty && (this.complete || this.progressValue > 0.85) && now >= this.nextBlinkRedraw) this.dirty = true;
      if (this.dirty) this.redrawLayer();
      ctx.drawImage(this.layer, this.originX, this.originY);
    }

    redrawLayer() {
      const now = performance.now();
      const ctx = this.layer.getContext("2d");
      ctx.clearRect(0, 0, this.layer.width, this.layer.height);
      const pulse = this.complete && Math.floor(now / 180) % 2 === 0;
      const nearing = !this.complete && this.progress() > 0.85 && Math.floor(now / 360) % 2 === 0;
      for (const cell of this.cells) {
        const fill = clamp(cell.fill, 0, 1);
        const lx = cell.col * this.cellSize;
        const ly = cell.row * this.cellSize;
        if (fill <= 0) {
          const oldAlpha = ctx.globalAlpha;
          const visibleStage = this.progressValue < 0.25 ? cell.stage <= 1 : this.progressValue < 0.6 ? cell.stage <= 2 : true;
          ctx.globalAlpha = visibleStage ? (this.progressValue < 0.25 ? 0.22 : this.progressValue < 0.6 ? 0.36 : 0.52) : 0.12;
          ctx.fillStyle = this.progressValue > 0.85 ? (nearing ? BLOOD_WET : BLOOD_DARK) : cell.stage <= 1 ? BLOOD_DARK : LIGHT_ORANGE;
          const alphaSize = this.progressValue > 0.75 ? 0.34 : this.progressValue > 0.25 ? 0.2 : 0.14;
          const size = Math.max(2, Math.floor(this.cellSize * (cell.mark === "H" ? alphaSize + 0.08 : alphaSize)));
          rect(ctx, lx + this.cellSize / 2 - size / 2, ly + this.cellSize / 2 - size / 2, size, size);
          ctx.globalAlpha = oldAlpha;
          continue;
        }
        ctx.fillStyle = pulse && fill >= 1 ? BLOOD_BRIGHT : this.bloodTone(cell, fill, false);
        this.drawBloodCell(ctx, lx, ly, cell, fill);
        if (fill >= 0.5) {
          ctx.fillStyle = this.bloodTone(cell, Math.min(1, fill + 0.18), false);
          const innerInset = Math.max(1, Math.floor(this.cellSize * 0.18));
          rect(ctx, lx + innerInset * 2, ly + innerInset * 2, Math.max(2, this.cellSize - innerInset * 4), Math.max(2, this.cellSize - innerInset * 4));
        }
        if (fill < 1) {
          ctx.fillStyle = BLACK;
          const hole = Math.max(2, Math.floor(this.cellSize * 0.22));
          rect(ctx, lx + this.cellSize / 2 - hole / 2, ly + this.cellSize / 2 - hole / 2, hole, hole);
        }
      }
      this.dirty = false;
      this.nextBlinkRedraw = this.complete ? now + 180 : this.progressValue > 0.85 ? now + 360 : 0;
    }

    drawBloodCell(ctx, lx, ly, cell, fill) {
      const inset = Math.max(1, Math.round(this.cellSize * (0.42 - fill * 0.28)));
      const w = Math.max(2, this.cellSize - inset * 2);
      const h = Math.max(2, this.cellSize - inset * 2);
      const main = ctx.fillStyle;
      if (fill < 0.34) {
        rect(ctx, lx + this.cellSize * 0.42, ly + this.cellSize * 0.42, Math.max(2, w * 0.35), Math.max(2, h * 0.35));
        return;
      }
      if (fill < 0.75) {
        rect(ctx, lx + inset, ly + inset + 1, w, Math.max(2, h - 2));
        rect(ctx, lx + inset + 1, ly + inset, Math.max(2, w - 2), h);
        return;
      }
      rect(ctx, lx + inset, ly + inset, w, h);
      rect(ctx, lx + inset - 1, ly + inset + 1, w + 2, Math.max(2, h - 2));
      ctx.fillStyle = BLOOD_DARK;
      rect(ctx, lx + inset, ly + inset, w, 1);
      rect(ctx, lx + inset, ly + inset, 1, h);
      ctx.fillStyle = fill >= 0.95 && (cell.mark === "H" || cell.mark === "A") ? BLOOD_BRIGHT : BLOOD_WET;
      const glint = Math.max(2, Math.floor(this.cellSize * 0.18));
      rect(ctx, lx + inset + Math.max(1, Math.floor(w * 0.58)), ly + inset + Math.max(1, Math.floor(h * 0.22)), glint, 2);
      ctx.fillStyle = main;
    }

    bloodTone(cell, fill, preview = false) {
      if (preview) {
        if (cell.mark === "H" || cell.mark === "A") return BLOOD_BRIGHT;
        if (cell.mark === "S" || cell.mark === "O") return BLOOD_DARK;
        return BLOOD;
      }
      if (fill < 0.34) return BLOOD_DARK;
      if (fill < 0.75) return cell.mark === "H" || cell.mark === "A" ? BLOOD : BLOOD_DARK;
      if (cell.mark === "H" || cell.mark === "A") return BLOOD_WET;
      if (cell.mark === "S" || cell.mark === "O") return BLOOD_DARK;
      return BLOOD;
    }
  }

  class BloodManager {
    constructor() {
      this.trails = [];
      this.splats = [];
      this.maxTrails = 42;
      this.maxSplats = 90;
    }

    spawnKillBlood(game, enemy, { heavy = false, critical = false, boss = false, rare = false, tier = 0 } = {}) {
      const result = game.bloodGoal.splatter(enemy.x, enemy.y, { heavy, critical, boss, rare, tier, source: boss ? "boss" : critical ? "critical" : "kill" });
      const targetCells = result.cells || [];
      const bloodPower = result.bloodUnits || 2;
      const trailLimit = Math.min(targetCells.length, boss ? 12 : critical ? 9 : heavy ? 7 : Math.max(3, Math.ceil(bloodPower / 3)));
      const trailSize = boss ? 7 : critical ? 6 : heavy ? 5 : 3 + Math.min(3, Math.floor(bloodPower / 6));
      for (let i = 0; i < trailLimit; i += 1) {
        const cell = targetCells[i];
        const life = (boss ? 0.54 : 0.36) + Math.random() * 0.18;
        if (this.trails.length >= this.maxTrails) this.trails.shift();
        const sprayAngle = Math.random() * FULL_SPIN;
        const sprayDist = (boss ? 54 : heavy ? 38 : 26) + Math.random() * (boss ? 54 : 28);
        this.trails.push({
          x: enemy.x,
          y: enemy.y,
          sprayX: enemy.x + Math.cos(sprayAngle) * sprayDist,
          sprayY: enemy.y + Math.sin(sprayAngle) * sprayDist,
          tx: cell.cx,
          ty: cell.cy,
          bend: (Math.random() - 0.5) * (boss ? 86 : 54),
          delay: i * (boss ? 0.018 : 0.026),
          phase: "seek",
          life,
          maxLife: life,
          size: trailSize,
          widthStart: trailSize + (boss ? 4 : 2),
          widthEnd: Math.max(2, trailSize - 2),
          impactPulse: boss || critical || heavy ? 0.18 : 0.1,
          kind: boss ? "boss" : critical ? "critical" : heavy ? "heavy" : rare ? "rare" : "normal"
        });
      }
      const strayCount = Math.min(boss ? 22 : critical ? 16 : heavy ? 12 : rare ? 10 : 6 + Math.floor(bloodPower / 4), this.maxSplats - this.splats.length);
      for (let i = 0; i < strayCount; i += 1) {
        const angle = Math.random() * FULL_SPIN;
        const speed = 40 + Math.random() * (boss ? 220 : critical ? 170 : 105);
        const life = 0.34 + Math.random() * 0.25;
        if (this.splats.length >= this.maxSplats) this.splats.shift();
        this.splats.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          size: 2 + Math.floor(Math.random() * (boss ? 6 : critical ? 4 : 3))
        });
      }
      if (targetCells.length > 0) game.sfx.queueBloodSpray(boss ? 5 : heavy || critical ? 3 : 1);
      return result;
    }

    spawnComboBonusBlood(game, origin, comboCount, bonusBlood) {
      if (!bonusBlood || bonusBlood <= 0 || game.bloodGoal.complete) return false;
      const result = game.bloodGoal.splatter(origin.x, origin.y, { comboBonusBlood: bonusBlood, comboCount, source: "combo" });
      const targetCells = result.cells || [];
      const trailLimit = Math.min(targetCells.length, 12);
      for (let i = 0; i < trailLimit; i += 1) {
        const cell = targetCells[i];
        const life = 0.56 + Math.random() * 0.2;
        if (this.trails.length >= this.maxTrails) this.trails.shift();
        const angle = i * 0.72 + comboCount * 0.17;
        const dist = 42 + i * 4;
        this.trails.push({
          x: origin.x,
          y: origin.y,
          sprayX: origin.x + Math.cos(angle) * dist,
          sprayY: origin.y + Math.sin(angle) * dist,
          tx: cell.cx,
          ty: cell.cy,
          bend: Math.sin(angle) * 96,
          delay: i * 0.025,
          phase: "seek",
          life,
          maxLife: life,
          size: 5,
          widthStart: 8,
          widthEnd: 3,
          impactPulse: 0.2,
          kind: "combo"
        });
      }
      const strayCount = Math.min(8, this.maxSplats - this.splats.length);
      for (let i = 0; i < strayCount; i += 1) {
        const angle = Math.random() * FULL_SPIN;
        const speed = 55 + Math.random() * 130;
        const life = 0.28 + Math.random() * 0.18;
        if (this.splats.length >= this.maxSplats) this.splats.shift();
        this.splats.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          size: 2 + Math.floor(Math.random() * 3)
        });
      }
      if (targetCells.length > 0) game.sfx.queueBloodSpray(Math.min(6, 2 + Math.floor(comboCount / 4)));
      return result.completed;
    }

    update(dt, game) {
      let trailWrite = 0;
      for (let i = 0; i < this.trails.length; i += 1) {
        const trail = this.trails[i];
        trail.delay = Math.max(0, (trail.delay || 0) - dt);
        const previousT = clamp(1 - trail.life / trail.maxLife, 0, 1);
        trail.life -= dt;
        const currentT = clamp(1 - trail.life / trail.maxLife, 0, 1);
        if (!trail.playedImpact && previousT < 0.88 && currentT >= 0.88 && game && game.sfx) {
          trail.playedImpact = true;
          game.sfx.queueBloodImpact(trail.kind === "boss" ? 4 : trail.kind === "combo" ? 3 : 1, trail.kind === "boss" ? 12 : trail.kind === "critical" ? 10 : trail.kind === "combo" ? 9 : 4);
        }
        if (trail.life > 0) this.trails[trailWrite++] = trail;
      }
      this.trails.length = trailWrite;
      let splatWrite = 0;
      for (let i = 0; i < this.splats.length; i += 1) {
        const splat = this.splats[i];
        splat.life -= dt;
        splat.x += splat.vx * dt;
        splat.y += splat.vy * dt;
        splat.vx *= 0.9;
        splat.vy *= 0.9;
        if (splat.life > 0) this.splats[splatWrite++] = splat;
      }
      this.splats.length = splatWrite;
    }

    draw(ctx) {
      for (const trail of this.trails) {
        const raw = clamp(1 - trail.life / trail.maxLife, 0, 1);
        const t = trail.delay > 0 ? 0 : clamp(raw / Math.max(0.001, 1 - (trail.delay || 0)), 0, 1);
        const sprayT = clamp(t / 0.28, 0, 1);
        const seekT = clamp((t - 0.2) / 0.78, 0, 1);
        const sx = lerp(trail.x, trail.sprayX ?? trail.x, sprayT);
        const sy = lerp(trail.y, trail.sprayY ?? trail.y, sprayT);
        const startX = trail.sprayX ?? trail.x;
        const startY = trail.sprayY ?? trail.y;
        const midX = lerp(startX, trail.tx, 0.5) + trail.bend;
        const midY = lerp(startY, trail.ty, 0.5) - trail.bend * 0.28;
        const cx = lerp(lerp(startX, midX, seekT), lerp(midX, trail.tx, seekT), seekT);
        const cy = lerp(lerp(startY, midY, seekT), lerp(midY, trail.ty, seekT), seekT);
        const width = lerp(trail.widthStart || trail.size, trail.widthEnd || trail.size, seekT);
        ctx.fillStyle = trail.kind === "critical" || trail.kind === "combo" ? BLOOD_WET : BLOOD_DARK;
        thickLinePixels(ctx, trail.x, trail.y, sx, sy, Math.max(2, width * 0.65));
        ctx.fillStyle = trail.kind === "boss" || trail.kind === "combo" ? BLOOD : BLOOD_DARK;
        thickLinePixels(ctx, sx, sy, cx, cy, Math.max(2, width));
        ctx.fillStyle = seekT > 0.82 ? BLOOD_BRIGHT : trail.kind === "critical" ? BLOOD_WET : BLOOD;
        rect(ctx, cx - trail.size, cy - trail.size, trail.size * 2, trail.size * 2);
        if (seekT > 0.88) {
          const pulse = (trail.impactPulse || 0.1) * (seekT - 0.88) / 0.12;
          ctx.fillStyle = BLOOD_BRIGHT;
          rect(ctx, trail.tx - trail.size * (1 + pulse), trail.ty - 1, trail.size * 2 * (1 + pulse), 2);
          rect(ctx, trail.tx - 1, trail.ty - trail.size * (1 + pulse), 2, trail.size * 2 * (1 + pulse));
        }
      }
      ctx.fillStyle = BLOOD_DARK;
      for (const splat of this.splats) {
        const t = clamp(splat.life / splat.maxLife, 0, 1);
        rect(ctx, splat.x - splat.size / 2, splat.y - splat.size / 2, splat.size * t, splat.size * t);
      }
    }
  }

  class AttackArea {
    constructor(segments, width, ownerX, ownerY, angle, range) {
      this.segments = segments;
      this.width = width;
      this.ownerX = ownerX;
      this.ownerY = ownerY;
      this.angle = angle;
      this.range = range;
    }

    overlapsCircle(x, y, radius) {
      let best = Infinity;
      for (const segment of this.segments) {
        const dist = pointToSegmentDistance(x, y, segment.startX, segment.startY, segment.tipX, segment.tipY);
        if (dist < best) best = dist;
        if (dist <= radius + this.width) return { hit: true, dist, segment };
      }
      return { hit: false, dist: best, segment: this.segments[0] };
    }
  }

  class SpatialGrid {
    constructor(cellSize = 96) {
      this.cellSize = cellSize;
      this.cells = new Map();
    }

    clear() {
      this.cells.clear();
    }

    keyFor(x, y) {
      return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }

    insert(entity) {
      const key = this.keyFor(entity.x, entity.y);
      let bucket = this.cells.get(key);
      if (!bucket) {
        bucket = [];
        this.cells.set(key, bucket);
      }
      bucket.push(entity);
    }

    queryCircle(x, y, radius) {
      const minX = Math.floor((x - radius) / this.cellSize);
      const maxX = Math.floor((x + radius) / this.cellSize);
      const minY = Math.floor((y - radius) / this.cellSize);
      const maxY = Math.floor((y + radius) / this.cellSize);
      const results = [];
      const radiusSq = radius * radius;
      for (let cy = minY; cy <= maxY; cy += 1) {
        for (let cx = minX; cx <= maxX; cx += 1) {
          const bucket = this.cells.get(`${cx},${cy}`);
          if (!bucket) continue;
          for (const entity of bucket) {
            if (distanceSq(x, y, entity.x, entity.y) <= radiusSq) results.push(entity);
          }
        }
      }
      return results;
    }

    forEachCircle(x, y, radius, fn) {
      const minX = Math.floor((x - radius) / this.cellSize);
      const maxX = Math.floor((x + radius) / this.cellSize);
      const minY = Math.floor((y - radius) / this.cellSize);
      const maxY = Math.floor((y + radius) / this.cellSize);
      const radiusSq = radius * radius;
      for (let cy = minY; cy <= maxY; cy += 1) {
        for (let cx = minX; cx <= maxX; cx += 1) {
          const bucket = this.cells.get(`${cx},${cy}`);
          if (!bucket) continue;
          for (const entity of bucket) {
            if (distanceSq(x, y, entity.x, entity.y) <= radiusSq && fn(entity) === false) return;
          }
        }
      }
    }
  }

  class CriticalSystem {
    rollKatana(player) {
      const growthBonus = Math.min(0.08, player.katana.growthLevel() * 0.006);
      const chance = player.criticalChance + growthBonus;
      const isCritical = Math.random() < chance;
      return {
        isCritical,
        multiplier: isCritical ? player.criticalMultiplier : 1,
        knockbackMultiplier: isCritical ? player.criticalKnockbackMultiplier : 1,
        dismemberChanceBonus: isCritical ? player.criticalDismemberChanceBonus : 0
      };
    }
  }

  class DamageResult {
    constructor({ amount, isCritical, isKillingBlow, didDismember, dismemberedPart, hitPosition, hitDirection, sourceType, attributeType }) {
      this.amount = amount;
      this.isCritical = !!isCritical;
      this.isKillingBlow = !!isKillingBlow;
      this.didDismember = !!didDismember;
      this.dismemberedPart = dismemberedPart || null;
      this.hitPosition = hitPosition || null;
      this.hitDirection = hitDirection || { x: 1, y: 0 };
      this.sourceType = sourceType || "unknown";
      this.attributeType = attributeType || null;
    }
  }

  function createPartsForEnemy(type) {
    const parts = {};
    for (const part of BASE_PARTS) parts[part] = true;
    for (const part of WEAPON_PARTS[type] || []) parts[part] = true;
    return parts;
  }

  function enemyTierForLevel(level) {
    return clamp(Math.floor((Math.max(1, level) - 1) / 5), 0, 4);
  }

  function calculateComboBloodBonus(comboCount) {
    if (comboCount < COMBO_BLOOD_BONUS.minHits) return 0;
    const raw = COMBO_BLOOD_BONUS.base
      + comboCount * COMBO_BLOOD_BONUS.perHit
      + Math.sqrt(comboCount) * COMBO_BLOOD_BONUS.sqrt;
    return Math.floor(Math.min(COMBO_BLOOD_BONUS.max, raw));
  }

  function calculateXpToNext(level) {
    return Math.floor(8 + level * 4 + Math.pow(level, 1.35) * 1.8);
  }

  function isAttributeGuaranteeLevel(level) {
    return level === 3 || level === 6 || level === 9 || level === 12 || level === 15 || level === 20 || (level > 20 && (level - 20) % 4 === 0);
  }

  function isBossType(type) {
    return type === "midBoss" || type === "midBossArcher" || type === "levelBoss";
  }

  function bossPartLabel(part) {
    const labels = {
      head: "頭部",
      body: "胴",
      leftArm: "左腕",
      rightArm: "右腕",
      leftLeg: "左脚",
      rightLeg: "右脚",
      weaponMain: "主武器",
      weaponSub: "副武器",
      horn: "角"
    };
    return labels[part] || "部位";
  }

  function attributeColor(id, variant = "main") {
    const colors = ATTRIBUTE_COLORS[id];
    if (!colors) return ORANGE;
    return colors[variant] || colors.main;
  }

  function itemNotice(kind) {
    const labels = {
      heal: "回復",
      speed: "足さばき",
      fire: "炎属性",
      ice: "氷属性",
      lightning: "雷属性",
      wind: "風属性",
      absorb: "吸収属性",
      collectAllExp: "経験玉全回収",
      damageAllEnemies: "全体斬撃"
    };
    return labels[kind] || "取得";
  }

  function drawAttributeGlyph(ctx, id, x, y, scale = 1, level = 0) {
    const s = scale;
    if (id === "fire") {
      rect(ctx, x - 2 * s, y - 13 * s, 4 * s, 4 * s);
      rect(ctx, x - 5 * s, y - 8 * s, 4 * s, 8 * s);
      rect(ctx, x + 1 * s, y - 9 * s, 5 * s, 9 * s);
      rect(ctx, x - 8 * s, y - 1 * s, 16 * s, 10 * s);
      rect(ctx, x - 3 * s, y + 1 * s, 6 * s, 7 * s);
      if (level >= 5) rect(ctx, x + 9 * s, y - 7 * s, 3 * s, 3 * s);
      if (level >= 10) rect(ctx, x - 12 * s, y - 5 * s, 3 * s, 3 * s);
      return;
    }
    if (id === "ice") {
      linePixels(ctx, x - 10 * s, y, x + 10 * s, y);
      linePixels(ctx, x, y - 10 * s, x, y + 10 * s);
      linePixels(ctx, x - 7 * s, y - 7 * s, x + 7 * s, y + 7 * s);
      linePixels(ctx, x - 7 * s, y + 7 * s, x + 7 * s, y - 7 * s);
      rect(ctx, x - 2 * s, y - 2 * s, 4 * s, 4 * s);
      return;
    }
    if (id === "lightning") {
      thickLinePixels(ctx, x + 5 * s, y - 12 * s, x - 4 * s, y - 1 * s, 2 * s);
      thickLinePixels(ctx, x - 4 * s, y - 1 * s, x + 4 * s, y - 1 * s, 2 * s);
      thickLinePixels(ctx, x + 4 * s, y - 1 * s, x - 6 * s, y + 12 * s, 2 * s);
      return;
    }
    if (id === "wind") {
      const rows = [
        { y: -12, w: 24, dx: -2 },
        { y: -6, w: 18, dx: 3 },
        { y: 0, w: 14, dx: -1 },
        { y: 6, w: 9, dx: 2 },
        { y: 11, w: 4, dx: -1 }
      ];
      for (const row of rows) {
        rect(ctx, x + (row.dx - row.w / 2) * s, y + row.y * s, row.w * s, 2 * s);
      }
      if (level >= 10) rect(ctx, x + 6 * s, y - 9 * s, 4 * s, 3 * s);
      return;
    }
    if (id === "absorb") {
      rect(ctx, x - 3 * s, y + 2 * s, 6 * s, 6 * s);
      linePixels(ctx, x, y + 2 * s, x - 9 * s, y - 7 * s);
      linePixels(ctx, x - 9 * s, y - 7 * s, x - 13 * s, y - 4 * s);
      rect(ctx, x - 15 * s, y - 5 * s, 4 * s, 4 * s);
      linePixels(ctx, x, y + 1 * s, x, y - 10 * s);
      linePixels(ctx, x, y - 10 * s, x + 4 * s, y - 13 * s);
      rect(ctx, x + 3 * s, y - 15 * s, 4 * s, 4 * s);
      linePixels(ctx, x + 2 * s, y + 2 * s, x + 10 * s, y - 5 * s);
      linePixels(ctx, x + 10 * s, y - 5 * s, x + 13 * s, y - 1 * s);
      rect(ctx, x + 12 * s, y - 2 * s, 4 * s, 4 * s);
      if (level >= 10) {
        linePixels(ctx, x - 2 * s, y + 5 * s, x - 10 * s, y + 12 * s);
        linePixels(ctx, x + 2 * s, y + 5 * s, x + 10 * s, y + 12 * s);
      }
    }
  }

  function drawDropFrame(ctx, x, y, size = 12, accent = false) {
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - size, y - size, size * 2, 2);
    rect(ctx, x - size, y + size - 2, size * 2, 2);
    rect(ctx, x - size, y - size, 2, size * 2);
    rect(ctx, x + size - 2, y - size, 2, size * 2);
    if (!accent) return;
    rect(ctx, x - size - 4, y - 1, 4, 2);
    rect(ctx, x + size, y - 1, 4, 2);
    rect(ctx, x - 1, y - size - 4, 2, 4);
    rect(ctx, x - 1, y + size, 2, 4);
  }

  function drawExperienceOrbGlyph(ctx, x, y, pulse = false) {
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - 1, y - 5, 2, 2);
    rect(ctx, x - 5, y - 1, 2, 2);
    rect(ctx, x + 3, y - 1, 2, 2);
    rect(ctx, x - 1, y + 3, 2, 2);
    ctx.fillStyle = ORANGE;
    rect(ctx, x - 2, y - 2, 4, 4);
    if (pulse) {
      rect(ctx, x - 6, y - 6, 2, 2);
      rect(ctx, x + 4, y + 4, 2, 2);
    }
  }

  function drawHealDropGlyph(ctx, x, y) {
    drawDropFrame(ctx, x, y, 10, false);
    ctx.fillStyle = ORANGE;
    rect(ctx, x - 2, y - 8, 4, 16);
    rect(ctx, x - 8, y - 2, 16, 4);
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - 12, y - 1, 3, 2);
    rect(ctx, x + 9, y - 1, 3, 2);
  }

  function drawSpeedDropGlyph(ctx, x, y) {
    drawDropFrame(ctx, x, y, 10, false);
    ctx.fillStyle = ORANGE;
    rect(ctx, x - 7, y - 6, 12, 3);
    rect(ctx, x - 3, y - 3, 5, 11);
    rect(ctx, x + 2, y + 4, 8, 3);
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - 12, y - 7, 4, 2);
    rect(ctx, x - 14, y - 2, 5, 2);
    rect(ctx, x - 11, y + 4, 4, 2);
  }

  function drawCollectAllExpDropGlyph(ctx, x, y, pulse = false) {
    drawDropFrame(ctx, x, y, 14, true);
    ctx.fillStyle = ORANGE;
    rect(ctx, x - 2, y - 2, 4, 4);
    linePixels(ctx, x - 13, y - 7, x - 5, y - 2);
    linePixels(ctx, x + 13, y - 7, x + 5, y - 2);
    linePixels(ctx, x - 13, y + 7, x - 5, y + 2);
    linePixels(ctx, x + 13, y + 7, x + 5, y + 2);
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - 17, y - 9, 3, 3);
    rect(ctx, x + 14, y - 9, 3, 3);
    rect(ctx, x - 17, y + 6, 3, 3);
    rect(ctx, x + 14, y + 6, 3, 3);
    if (pulse) {
      ctx.fillStyle = ORANGE;
      rect(ctx, x - 1, y - 18, 2, 4);
      rect(ctx, x - 1, y + 14, 2, 4);
    }
  }

  function drawDamageAllEnemiesDropGlyph(ctx, x, y, pulse = false) {
    drawDropFrame(ctx, x, y, 14, true);
    ctx.fillStyle = ORANGE;
    rect(ctx, x - 7, y - 10, 14, 18);
    rect(ctx, x - 4, y - 13, 8, 4);
    ctx.fillStyle = BLACK;
    rect(ctx, x - 3, y - 5, 6, 2);
    rect(ctx, x - 1, y - 7, 2, 6);
    ctx.fillStyle = ORANGE;
    thickLinePixels(ctx, x - 13, y + 10, x + 14, y - 10, 2);
    ctx.fillStyle = LIGHT_ORANGE;
    rect(ctx, x - 18, y - 1, 4, 2);
    rect(ctx, x + 14, y - 1, 4, 2);
    rect(ctx, x - 1, y + 14, 2, 4);
    if (pulse) {
      ctx.fillStyle = ORANGE;
      rect(ctx, x - 18, y - 14, 4, 2);
      rect(ctx, x + 14, y + 12, 4, 2);
    }
  }

  class Input {
    constructor(canvas) {
      this.canvas = canvas;
      this.keys = new Map();
      this.staleKeyMs = 3200;
      this.pointer = {
        active: false,
        id: null,
        x: 0,
        y: 0,
        down: false,
        justDown: false
      };
      window.addEventListener("keydown", (event) => {
        const key = this.normalize(event);
        if (!key) return;
        this.keys.set(key, performance.now());
        if (this.shouldPreventDefault(key)) event.preventDefault();
      });
      window.addEventListener("keyup", (event) => {
        const key = this.normalize(event);
        if (!key) return;
        this.keys.delete(key);
        if (this.shouldPreventDefault(key)) event.preventDefault();
      });
      window.addEventListener("blur", () => this.clear());
      window.addEventListener("pagehide", () => this.clear());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.clear();
      });
      canvas.addEventListener("pointerdown", (event) => this.handlePointerDown(event), { passive: false });
      canvas.addEventListener("pointermove", (event) => this.handlePointerMove(event), { passive: false });
      canvas.addEventListener("pointerup", (event) => this.handlePointerEnd(event), { passive: false });
      canvas.addEventListener("pointercancel", (event) => this.handlePointerEnd(event), { passive: false });
    }

    normalize(event) {
      const byCode = {
        ArrowLeft: "arrowleft",
        ArrowRight: "arrowright",
        ArrowUp: "arrowup",
        ArrowDown: "arrowdown",
        KeyA: "a",
        KeyD: "d",
        KeyW: "w",
        KeyS: "s",
        KeyR: "r",
        Enter: "enter",
        Space: " "
      };
      if (event.code && byCode[event.code]) return byCode[event.code];
      const key = String(event.key || "").toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", "r", "enter", " "].includes(key)) return key;
      return "";
    }

    shouldPreventDefault(key) {
      return ["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " "].includes(key);
    }

    cleanupStaleKeys() {
      const now = performance.now();
      for (const [key, lastSeen] of this.keys) {
        if (now - lastSeen > this.staleKeyMs) this.keys.delete(key);
      }
    }

    clear() {
      this.keys.clear();
      this.pointer.active = false;
      this.pointer.id = null;
      this.pointer.down = false;
      this.pointer.justDown = false;
    }

    handlePointerDown(event) {
      event.preventDefault();
      this.updatePointer(event);
      this.pointer.active = true;
      this.pointer.down = true;
      this.pointer.justDown = true;
      this.pointer.id = event.pointerId;
      if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(event.pointerId);
    }

    handlePointerMove(event) {
      if (this.pointer.id !== null && event.pointerId !== this.pointer.id) return;
      event.preventDefault();
      this.updatePointer(event);
      if (this.pointer.down) this.pointer.active = true;
    }

    handlePointerEnd(event) {
      if (this.pointer.id !== null && event.pointerId !== this.pointer.id) return;
      event.preventDefault();
      this.updatePointer(event);
      this.pointer.down = false;
      this.pointer.id = null;
      if (this.canvas.releasePointerCapture) {
        try {
          this.canvas.releasePointerCapture(event.pointerId);
        } catch (_) {
          // Pointer capture may already be released by the browser.
        }
      }
    }

    updatePointer(event) {
      const rectBox = this.canvas.getBoundingClientRect();
      const scaleX = rectBox.width > 0 ? this.canvas.width / RENDER_SCALE / rectBox.width : 1;
      const scaleY = rectBox.height > 0 ? this.canvas.height / RENDER_SCALE / rectBox.height : 1;
      this.pointer.x = (event.clientX - rectBox.left) * scaleX;
      this.pointer.y = (event.clientY - rectBox.top) * scaleY;
    }

    consumePointerDown() {
      if (!this.pointer.justDown) return null;
      this.pointer.justDown = false;
      return { x: this.pointer.x, y: this.pointer.y };
    }

    currentPointerPoint() {
      return this.pointer.active ? { x: this.pointer.x, y: this.pointer.y, down: this.pointer.down } : null;
    }

    axis() {
      this.cleanupStaleKeys();
      let x = 0;
      let y = 0;
      if (this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
      if (this.keys.has("arrowright") || this.keys.has("d")) x += 1;
      if (this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
      if (this.keys.has("arrowdown") || this.keys.has("s")) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.sqrt(2);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    }

    hasMovementKeys() {
      this.cleanupStaleKeys();
      return this.keys.has("arrowleft") || this.keys.has("a")
        || this.keys.has("arrowright") || this.keys.has("d")
        || this.keys.has("arrowup") || this.keys.has("w")
        || this.keys.has("arrowdown") || this.keys.has("s");
    }

    pressed(key) {
      this.cleanupStaleKeys();
      return this.keys.has(key.toLowerCase());
    }
  }

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 7;
      this.hp = 100;
      this.maxHp = 100;
      this.speed = 112;
      this.katanaDamage = 8;
      this.knockbackPower = 130;
      this.criticalChance = CRITICAL_DEFAULTS.chance;
      this.criticalMultiplier = CRITICAL_DEFAULTS.multiplier;
      this.criticalKnockbackMultiplier = CRITICAL_DEFAULTS.knockbackMultiplier;
      this.criticalDismemberChanceBonus = CRITICAL_DEFAULTS.dismemberChanceBonus;
      this.attackInterval = 0.82;
      this.attributes = new AttributeManager(this);
      this.elements = this.attributes.levels;
      this.dir = { x: 1, y: 0 };
      this.walkPhase = 0;
      this.isMoving = false;
      this.katana = new Katana(this);
    }

    update(dt, game) {
      const axis = game.movementAxisForPlayer();
      const bounds = game.playArea;
      this.x = clamp(this.x + axis.x * this.speed * dt, bounds.left + 14, bounds.right - 14);
      this.y = clamp(this.y + axis.y * this.speed * dt, bounds.top + 14, bounds.bottom - 14);
      this.isMoving = axis.x !== 0 || axis.y !== 0;
      if (axis.x !== 0 || axis.y !== 0) this.dir = normalized(axis.x, axis.y);
      this.walkPhase += dt * (this.isMoving ? 11 : 3);
      this.katana.update(dt, game);
    }

    upgradeAttackSpeed(major = false) {
      this.attackInterval = Math.max(0.34, this.attackInterval - (major ? 0.065 : 0.045));
      this.katana.verticalPixels += major ? 3 : 2;
      return "SPEED";
    }

    upgradeAttackPower(major = false) {
      if (Math.random() < 0.5) {
        this.katana.horizontalPixels += major ? 8 : 5;
        if (major || Math.random() < 0.35) this.katana.pierceLimit += 1;
        return "LONG";
      }
      this.knockbackPower += major ? 60 : 35;
      this.katana.verticalPixels += major ? 6 : 4;
      return "THICK";
    }

    heal(amount) {
      this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    addSpeed() {
      this.speed += 18;
      return this.speed;
    }

    addElement(kind, game) {
      return this.attributes.add(kind, game);
    }

    draw(ctx) {
      const x = Math.round(this.x);
      const bob = Math.round(Math.sin(this.walkPhase) * (this.isMoving ? 2 : 1));
      const step = Math.round(Math.sin(this.walkPhase) * 3);
      const sleeve = Math.round(Math.cos(this.walkPhase) * 2);
      const y = Math.round(this.y + bob);
      const ringPulse = 1 + Math.sin(this.walkPhase * 1.3) * 0.08;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y - 4, this.radius * 1.9 * ringPulse, 0, FULL_SPIN);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = ORANGE;
      rect(ctx, x - 3, y - 12, 6, 4);
      rect(ctx, x - 5, y - 8, 10, 8);
      rect(ctx, x - 7, y - 7, 2, 10);
      rect(ctx, x + 5, y - 7, 2, 10);
      rect(ctx, x - 4, y + step, 3, 6);
      rect(ctx, x + 1, y - step, 3, 6);
      rect(ctx, x - 8, y - 5 + sleeve, 3, 6);
      rect(ctx, x + 5, y - 5 - sleeve, 3, 6);
      rect(ctx, x - 6, y - 14 + Math.round(Math.sin(this.walkPhase * 0.5)), 12, 2);
      rect(ctx, x - 2, y - 16, 4, 2);
      rect(ctx, x - 1 + Math.round(this.dir.x), y - 11 + Math.round(this.dir.y), 2, 2);
      const bladeDir = this.katana.aimDir;
      const bladeX = x + Math.round(bladeDir.x * 8);
      const bladeY = y - 6 + Math.round(bladeDir.y * 8);
      rect(ctx, bladeX - 1, bladeY - 1, Math.abs(bladeDir.x) > Math.abs(bladeDir.y) ? 10 : 2, Math.abs(bladeDir.y) >= Math.abs(bladeDir.x) ? 10 : 2);
      this.katana.draw(ctx);
    }
  }

  class Katana {
    constructor(player) {
      this.player = player;
      this.horizontalPixels = 14;
      this.verticalPixels = 5;
      this.cooldown = 0.15;
      this.swingTime = 0;
      this.swingTimeMax = 0.48;
      this.aimDir = { x: 1, y: 0 };
      this.swingDir = { x: 1, y: 0 };
      this.swingStartAngle = 0;
      this.pierceLimit = 3;
      this.hitsThisSwing = 0;
      this.absorbedThisSwing = 0;
      this.lastAttackDebug = null;
      this.hitEnemies = new Set();
      this.lingerHitTimers = new Map();
      this.attackAreaCache = null;
    }

    update(dt, game) {
      this.tickLingerHitTimers(dt);
      if (this.swingTime > 0) {
        this.swingTime -= dt;
        this.checkHits(game);
        if (this.swingTime <= 0) {
          this.swingTime = 0;
          this.cooldown = this.player.attackInterval;
          this.hitEnemies.clear();
          this.absorbedThisSwing = 0;
          this.attackAreaCache = null;
        }
        return;
      }

      this.cooldown -= dt;
      if (this.cooldown > 0) {
        this.checkLingerHits(game);
        return;
      }
      if (this.cooldown <= 0) {
        this.aimDir = { x: 1, y: 0 };
        this.swingDir = { x: 1, y: 0 };
        this.swingStartAngle = 0;
        this.swingTimeMax = Math.max(0.3, this.player.attackInterval * 0.58);
        this.swingTime = this.swingTimeMax;
        this.cooldown = 0;
        this.hitsThisSwing = 0;
        this.absorbedThisSwing = 0;
        this.hitEnemies.clear();
        this.lingerHitTimers.clear();
        this.attackAreaCache = null;
        game.sfx.swing();
        this.checkHits(game);
      }
    }

    tickLingerHitTimers(dt) {
      for (const [enemy, timer] of this.lingerHitTimers) {
        const next = timer - dt;
        if (next <= 0 || enemy.dead) this.lingerHitTimers.delete(enemy);
        else this.lingerHitTimers.set(enemy, next);
      }
    }

    range() {
      return 30 + this.horizontalPixels * 1.35;
    }

    thickness() {
      return 14 + this.verticalPixels * 1.25;
    }

    hitWidth() {
      return 4 + clamp(this.verticalPixels / 8, 1, 9);
    }

    checkHits(game) {
      const blade = this.currentBlade();
      const area = this.currentAttackArea(blade);
      let hitCount = 0;
      this.absorbedThisSwing += game.absorbCollectibles(area, this.absorbedThisSwing, false);
      const visitEnemy = (enemy) => {
        if (this.hitsThisSwing >= this.pierceLimit) return;
        if (enemy.dead || this.hitEnemies.has(enemy)) return;
        const overlap = area.overlapsCircle(enemy.x, enemy.y, enemy.radius);
        if (overlap.hit) {
          const hitSegment = overlap.segment || blade;
          const critical = game.criticalSystem.rollKatana(this.player);
          const damage = Math.ceil(this.player.katanaDamage * critical.multiplier);
          game.sfx.queueHit();
          if (critical.isCritical) game.sfx.queueCritical();
          if (critical.isCritical) game.runStats.criticalHits += 1;
          game.effectManager.hit(enemy.x, enemy.y, hitSegment.dir, this.player.katana.growthLevel() * 3);
          if (critical.isCritical) game.effectManager.criticalHit(enemy.x, enemy.y, hitSegment.dir, area.width);
          game.requestHitStop(0.022);
          const result = enemy.takeDamage(damage, game, hitSegment.dir, {
            sourceType: "katana",
            isCritical: critical.isCritical,
            dismemberChanceBonus: critical.dismemberChanceBonus,
            hitPosition: { x: enemy.x, y: enemy.y }
          });
          const windBoost = 1 + game.player.attributes.get("wind") * 0.055 + (game.player.attributes.hasMilestone("wind", 5) ? 0.22 : 0);
          enemy.applyKnockback(hitSegment.dir.x, hitSegment.dir.y, this.player.knockbackPower * windBoost * critical.knockbackMultiplier);
          game.applyElementalHit(enemy, hitSegment);
          if (critical.isCritical) {
            game.requestHitStop(result && result.isKillingBlow ? 0.065 : 0.04);
            game.screenShake.add(result && result.isKillingBlow ? 7 : 3, 0.12);
          }
          if (game.player.attributes.hasMilestone("absorb", 15)) {
            this.absorbedThisSwing += game.absorbCollectibles(area, this.absorbedThisSwing, true);
          }
          this.hitEnemies.add(enemy);
          this.hitsThisSwing += 1;
          hitCount += 1;
          game.effects.push({
            type: "slashHit",
            x: enemy.x,
            y: enemy.y,
            life: 0.22,
            maxLife: 0.22,
            size: Math.min(area.width * 2.2, 34),
            dir: { x: hitSegment.dir.x, y: hitSegment.dir.y },
            startX: hitSegment.startX,
            startY: hitSegment.startY,
            tipX: hitSegment.tipX,
            tipY: hitSegment.tipY,
            width: area.width
          });
        }
      };
      if (game.enemyGrid) {
        game.enemyGrid.forEachCircle(area.ownerX, area.ownerY, area.range + area.width + 48, (enemy) => {
          visitEnemy(enemy);
          return this.hitsThisSwing < this.pierceLimit;
        });
      } else {
        for (const enemy of game.enemies) visitEnemy(enemy);
      }
      this.lastAttackDebug = { area, hitCount, absorbed: this.absorbedThisSwing, absorbCandidates: game.lastAbsorbCandidates, absorbLevel: game.player.attributes.get("absorb") };
    }

    checkLingerHits(game) {
      if (this.cooldown <= 0 || game.gameOver || game.gameCleared) return;
      const blade = this.idleBlade();
      const area = this.lingerAttackArea(blade);
      let hitCount = 0;
      const visitEnemy = (enemy) => {
        if (hitCount >= this.lingerPierceLimit()) return false;
        if (enemy.dead || this.lingerHitTimers.has(enemy)) return true;
        const overlap = area.overlapsCircle(enemy.x, enemy.y, enemy.radius);
        if (!overlap.hit) return true;
        const hitSegment = overlap.segment || blade;
        const critical = game.criticalSystem.rollKatana(this.player);
        const damage = Math.max(1, Math.ceil(this.player.katanaDamage * 0.42 * critical.multiplier));
        game.sfx.queueHit();
        if (critical.isCritical) {
          game.sfx.queueCritical();
          game.runStats.criticalHits += 1;
        }
        game.effectManager.hit(enemy.x, enemy.y, hitSegment.dir, 3 + this.growthLevel());
        if (critical.isCritical) game.effectManager.criticalHit(enemy.x, enemy.y, hitSegment.dir, area.width);
        const result = enemy.takeDamage(damage, game, hitSegment.dir, {
          sourceType: "katana_linger",
          isCritical: critical.isCritical,
          dismemberChanceBonus: critical.dismemberChanceBonus * 0.45,
          hitPosition: { x: enemy.x, y: enemy.y }
        });
        const windBoost = 1 + game.player.attributes.get("wind") * 0.025;
        enemy.applyKnockback(hitSegment.dir.x, hitSegment.dir.y, this.player.knockbackPower * 0.34 * windBoost * critical.knockbackMultiplier);
        game.effects.push({
          type: "slashHit",
          x: enemy.x,
          y: enemy.y,
          life: 0.16,
          maxLife: 0.16,
          size: Math.min(area.width * 1.7, 24),
          dir: { x: hitSegment.dir.x, y: hitSegment.dir.y },
          startX: hitSegment.startX,
          startY: hitSegment.startY,
          tipX: hitSegment.tipX,
          tipY: hitSegment.tipY,
          width: area.width
        });
        if (critical.isCritical) {
          game.requestHitStop(result && result.isKillingBlow ? 0.045 : 0.026);
          game.screenShake.add(result && result.isKillingBlow ? 4 : 1.6, 0.08);
        } else {
          game.requestHitStop(0.012);
        }
        this.lingerHitTimers.set(enemy, this.lingerHitInterval());
        hitCount += 1;
        return hitCount < this.lingerPierceLimit();
      };
      if (game.enemyGrid) {
        game.enemyGrid.forEachCircle(area.ownerX, area.ownerY, area.range + area.width + 32, visitEnemy);
      } else {
        for (const enemy of game.enemies) {
          if (visitEnemy(enemy) === false) break;
        }
      }
    }

    lingerHitInterval() {
      return clamp(this.player.attackInterval * 0.34, 0.18, 0.34);
    }

    lingerPierceLimit() {
      return Math.max(1, Math.min(this.pierceLimit, 2 + Math.floor(this.growthLevel() / 5)));
    }

    currentAttackArea(blade = this.currentBlade()) {
      const cache = this.attackAreaCache;
      if (cache
        && cache.swingTime === this.swingTime
        && cache.x === this.player.x
        && cache.y === this.player.y
        && cache.horizontalPixels === this.horizontalPixels
        && cache.verticalPixels === this.verticalPixels
        && cache.angle === blade.angle
        && cache.progress === blade.progress) {
        return cache.area;
      }
      const growth = this.growthLevel();
      const sweep = clamp(1.0 + growth * 0.06, 1.0, 1.55);
      const steps = 6 + Math.min(5, growth);
      const segments = [];
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const angle = blade.angle - sweep + sweep * t;
        const sample = this.bladeFromAngle(angle, blade.progress);
        segments.push(sample);
      }
      const area = new AttackArea(segments, this.hitWidth(), this.player.x, this.player.y, blade.angle, this.range());
      this.attackAreaCache = {
        swingTime: this.swingTime,
        x: this.player.x,
        y: this.player.y,
        horizontalPixels: this.horizontalPixels,
        verticalPixels: this.verticalPixels,
        angle: blade.angle,
        progress: blade.progress,
        area
      };
      return area;
    }

    lingerAttackArea(blade = this.idleBlade()) {
      const lingerWidth = Math.max(this.hitWidth(), this.thickness() * 0.34);
      return new AttackArea([blade], lingerWidth, this.player.x, this.player.y, blade.angle, this.range());
    }

    currentBlade() {
      const p = this.player;
      const progress = this.swingTime > 0 && this.swingTimeMax > 0 ? 1 - this.swingTime / this.swingTimeMax : 0;
      const angle = this.swingStartAngle + progress * FULL_SPIN;
      return this.bladeFromAngle(angle, progress);
    }

    idleBlade() {
      return this.bladeFromAngle(0, 0);
    }

    bladeFromAngle(angle, progress) {
      const p = this.player;
      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      const side = { x: -dir.y, y: dir.x };
      const gripX = p.x + dir.x * 10;
      const gripY = p.y - 5 + dir.y * 10;
      const guardX = gripX + dir.x * 6;
      const guardY = gripY + dir.y * 6;
      const startX = gripX + dir.x * 10;
      const startY = gripY + dir.y * 10;
      const tipX = gripX + dir.x * this.range();
      const tipY = gripY + dir.y * this.range();
      return { dir, side, gripX, gripY, guardX, guardY, startX, startY, tipX, tipY, progress, angle };
    }

    draw(ctx) {
      const swinging = this.swingTime > 0;
      const range = this.range();
      const thickness = this.thickness();
      const blade = swinging ? this.currentBlade() : this.idleBlade();
      ctx.fillStyle = ORANGE;

      const growth = this.growthLevel();
      const bladeBulk = 1;

      if (swinging) {
        this.drawAttackAreaTrail(ctx, this.currentAttackArea(blade), growth);
      }

      this.drawBlade(ctx, blade.gripX, blade.gripY, blade.tipX, blade.tipY, blade.dir, blade.side, bladeBulk);

      if (swinging) {
        const shoutX = blade.tipX - blade.dir.x * 5;
        const shoutY = blade.tipY - blade.dir.y * 5;
        for (let i = 0; i < 2; i += 1) {
          rect(ctx, shoutX + blade.side.x * i * 4 - 1, shoutY + blade.side.y * i * 4 - 1, 2, 2);
        }
      }
    }

    drawAttackAreaTrail(ctx, area, growth) {
      for (let i = 1; i < area.segments.length; i += 1) {
        const prev = area.segments[i - 1];
        const segment = area.segments[i];
        const t = i / Math.max(1, area.segments.length - 1);
        const trailSize = clamp(area.width * (0.42 + t * 0.18), 2, 7);
        dashedLinePixels(ctx, prev.tipX, prev.tipY, segment.tipX, segment.tipY, trailSize, 7);
        if (growth > 1) {
          const innerA = {
            x: prev.gripX + prev.dir.x * (area.range * 0.72),
            y: prev.gripY + prev.dir.y * (area.range * 0.72)
          };
          const innerB = {
            x: segment.gripX + segment.dir.x * (area.range * 0.72),
            y: segment.gripY + segment.dir.y * (area.range * 0.72)
          };
          dashedLinePixels(ctx, innerA.x, innerA.y, innerB.x, innerB.y, Math.max(2, trailSize - 2), 9);
        }
        if (i % 2 === 0) {
          rect(ctx, segment.tipX - segment.dir.x * 3 - 1, segment.tipY - segment.dir.y * 3 - 1, 2, 2);
        }
      }
    }

    growthLevel() {
      return Math.floor((this.horizontalPixels - 14) / 10) + Math.floor((this.verticalPixels - 5) / 8);
    }

    drawBlade(ctx, gripX, gripY, tipX, tipY, dir, side, bladeBulk) {
      const growth = this.growthLevel();
      const guardX = gripX + dir.x * 12;
      const guardY = gripY + dir.y * 12;
      const bladeStartX = gripX + dir.x * 15;
      const bladeStartY = gripY + dir.y * 15;
      const bladeHalfWidth = clamp(1.2 + Math.max(0, this.verticalPixels - 5) * 0.32 + growth * 0.75, 1.2, 15);
      const bladeLength = distance(bladeStartX, bladeStartY, tipX, tipY);
      const curve = clamp(bladeLength / 28 + growth * 0.55, 2, 13);
      const spine = [];
      const edge = [];
      const segments = 10 + Math.min(8, growth);

      thickLinePixels(ctx, gripX - dir.x * (7 + growth * 0.3), gripY - dir.y * (7 + growth * 0.3), guardX, guardY, 1);
      for (let i = 0; i < 5 + Math.min(3, growth); i += 1) {
        const wrap = -7 - growth * 0.2 + i * 4;
        thickLinePixels(
          ctx,
          gripX + dir.x * wrap - side.x * 2,
          gripY + dir.y * wrap - side.y * 2,
          gripX + dir.x * (wrap + 2) + side.x * 2,
          gripY + dir.y * (wrap + 2) + side.y * 2,
          1
        );
      }
      thickLinePixels(ctx, guardX - side.x * (5 + growth * 0.35), guardY - side.y * (5 + growth * 0.35), guardX + side.x * (5 + growth * 0.35), guardY + side.y * (5 + growth * 0.35), 1);
      rect(ctx, guardX - 2, guardY - 2, 4, 4);
      rect(ctx, guardX + dir.x * 3 - 1, guardY + dir.y * 3 - 1, 2, 2);

      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        const taper = 1 - Math.pow(t, 2.4);
        const sori = Math.sin(t * Math.PI) * curve;
        const centerX = bladeStartX + (tipX - bladeStartX) * t + side.x * sori;
        const centerY = bladeStartY + (tipY - bladeStartY) * t + side.y * sori;
        const half = Math.max(1, bladeHalfWidth * taper + Math.sin(t * Math.PI) * growth * 0.35);
        spine.push({ x: centerX + side.x * half * 0.35, y: centerY + side.y * half * 0.35 });
        edge.push({ x: centerX - side.x * half * 0.75, y: centerY - side.y * half * 0.75 });
      }

      for (let i = 1; i < spine.length; i += 1) {
        const t = i / (spine.length - 1);
        const fillWidth = 1;
        thickLinePixels(ctx, spine[i - 1].x, spine[i - 1].y, spine[i].x, spine[i].y, fillWidth);
        thickLinePixels(ctx, edge[i - 1].x, edge[i - 1].y, edge[i].x, edge[i].y, Math.max(1, fillWidth));
        if (i % 2 === 0) {
          linePixels(ctx, spine[i].x, spine[i].y, edge[i].x, edge[i].y);
        }
        if (growth > 3 && i % 4 === 0) {
          rect(ctx, spine[i].x + side.x * (3 + growth * 0.6) - 1, spine[i].y + side.y * (3 + growth * 0.6) - 1, 2, 2);
        }
      }

      const kissakiBase = edge[edge.length - 2];
      const kissakiSpine = spine[spine.length - 2];
      thickLinePixels(ctx, kissakiBase.x, kissakiBase.y, tipX, tipY, 1);
      thickLinePixels(ctx, kissakiSpine.x, kissakiSpine.y, tipX, tipY, 1);
      rect(ctx, tipX - 1, tipY - 1, 2, 2);
      rect(ctx, tipX - dir.x * Math.min(8, 4 + growth) - 1, tipY - dir.y * Math.min(8, 4 + growth) - 1, 2, 2);
      if (growth > 2) {
        rect(ctx, tipX + side.x * (4 + growth * 0.5) - 1, tipY + side.y * (4 + growth * 0.5) - 1, 2, 2);
        rect(ctx, tipX - side.x * (4 + growth * 0.5) - 1, tipY - side.y * (4 + growth * 0.5) - 1, 2, 2);
      }
    }
  }

  class Enemy {
    constructor(type, x, y, rank = 1, enemyLevel = 1) {
      this.type = type;
      this.rank = rank;
      this.enemyLevel = enemyLevel;
      this.tier = isBossType(type) ? 0 : enemyTierForLevel(enemyLevel);
      this.def = { ...ENEMY_TYPES[type] };
      if (type === "levelBoss") {
        this.def.hp = Math.floor(this.def.hp * (1 + (rank - 1) * 0.55));
        this.def.damage = Math.floor(this.def.damage * (1 + (rank - 1) * 0.28));
        this.def.speed += (rank - 1) * 3;
        this.def.radius += (rank - 1) * 4;
        this.def.xp += (rank - 1) * 55;
        this.def.attackRange += (rank - 1) * 8;
        this.def.knockbackResist = Math.max(0.04, this.def.knockbackResist - (rank - 1) * 0.012);
      } else if (!isBossType(type)) {
        const tier = this.tier;
        const softLevel = Math.max(0, enemyLevel - 1);
        const hpScale = type === "farmer" ? 1 + tier * 0.08 + softLevel * 0.006 : 1 + tier * 0.12 + softLevel * 0.01;
        this.def.hp = Math.floor(this.def.hp * hpScale);
        this.def.damage = Math.max(1, this.def.damage + tier * 0.55);
        this.def.speed += tier * (type === "farmer" || type === "blinkNinja" ? 3 : 2);
        this.def.xp += tier * (type === "blinkNinja" ? 7 : type === "archer" ? 3 : 2) + Math.floor(enemyLevel / 5);
        this.def.attackCooldown *= Math.max(0.72, 1 - tier * 0.055);
        if (type === "spear" || type === "archer") this.def.attackRange += tier * 5;
        if (type === "sword") this.def.attackRange += tier * 2;
        if (type === "blinkNinja") this.def.attackRange += tier * 4;
      }
      this.x = x;
      this.y = y;
      this.hp = this.def.hp;
      this.radius = this.def.radius;
      this.dead = false;
      this.vx = 0;
      this.vy = 0;
      this.attackTimer = Math.random() * 0.4;
      this.flash = 0;
      this.burnTime = 0;
      this.burnTick = 0;
      this.slowTime = 0;
      this.freezeTime = 0;
      this.stunTime = 0;
      this.powerLevel = 0;
      this.parts = createPartsForEnemy(type);
      this.wallCooldown = 0;
      this.bossSpecialTimer = 1.4 + Math.random() * 1.2;
      this.bossCharge = 0;
      this.specialTimer = 0.8 + Math.random() * 1.4;
      this.lastHitElement = null;
      this.walkPhase = Math.random() * FULL_SPIN;
      this.lastMoveAmount = 0;
      this.headlessChaosTimer = 0;
      this.headlessMoveAngle = Math.random() * FULL_SPIN;
      this.headlessAttackJitter = 0;
    }

    update(dt, game) {
      const player = game.player;
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);
      const dir = dist < 0.0001 ? { x: 1, y: 0 } : { x: dx / dist, y: dy / dist };
      const stopRange = Math.max(this.def.contactRange, this.def.attackRange * 0.72);
      this.updateStatus(dt, game);
      this.wallCooldown = Math.max(0, this.wallCooldown - dt);
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.handleWallCollision(game);
      if (this.dead) return;
      let moveAmount = Math.hypot(this.vx, this.vy) * dt;
      const damping = Math.max(0, 1 - dt * 4.8);
      this.vx *= damping;
      this.vy *= damping;
      const statusMultiplier = this.freezeTime > 0 || this.stunTime > 0 ? 0 : this.slowTime > 0 ? 0.42 : 1;
      const partMultiplier = this.movementMultiplier();
      this.updateBossBehavior(dt, game, dir, dist);
      this.updateTierBehavior(dt, game, dir, dist, statusMultiplier);
      const moveDir = isBossType(this.type) && this.parts.head === false ? this.bossMoveDir(dir) : dir;
      if (dist > stopRange && statusMultiplier > 0) {
        const strafe = this.bossStrafeDir(moveDir);
        const moveX = (moveDir.x + strafe.x) * this.def.speed * statusMultiplier * partMultiplier * dt;
        const moveY = (moveDir.y + strafe.y) * this.def.speed * statusMultiplier * partMultiplier * dt;
        this.x += moveX;
        this.y += moveY;
        moveAmount += Math.hypot(moveX, moveY);
      }
      this.lastMoveAmount = moveAmount;
      this.walkPhase += dt * (2.5 + this.def.speed * 0.11) + moveAmount * 0.09;
      this.attackTimer -= dt;
      this.flash = Math.max(0, this.flash - dt);
      const usesWarningAttack = isBossType(this.type) || this.type === "archer" || this.type === "blinkNinja" || (this.tier >= 1 && (this.type === "spear" || this.type === "sword"));
      const directAttackRange = usesWarningAttack ? this.def.contactRange : this.def.attackRange;
      if (dist < directAttackRange && this.attackTimer <= 0) {
        game.damagePlayer(this.def.damage * this.attackMultiplier(), 3, 0.09, 14);
        this.attackTimer = this.def.attackCooldown / Math.max(0.5, this.attackMultiplier());
      }
    }

    updateTierBehavior(dt, game, dir, dist, statusMultiplier) {
      if (isBossType(this.type) || this.tier <= 0 || statusMultiplier <= 0) return;
      this.specialTimer -= dt;
      const side = { x: -dir.y, y: dir.x };
      if (this.tier >= 4 && Math.random() < 0.006) {
        game.effects.push({ type: "enemyPower", x: this.x, y: this.y, life: 0.08, maxLife: 0.08, size: this.radius + 5 });
      }
      if (this.type === "farmer") {
        if (this.tier >= 2) {
          this.x += side.x * Math.sin(this.walkPhase + this.enemyLevel) * this.def.speed * 0.18 * dt;
          this.y += side.y * Math.sin(this.walkPhase + this.enemyLevel) * this.def.speed * 0.18 * dt;
        }
        if (this.specialTimer <= 0 && dist < 110 && this.tier >= 2) {
          const power = this.tier >= 4 ? 180 : 120;
          this.vx += dir.x * power;
          this.vy += dir.y * power;
          this.specialTimer = 2.4 - this.tier * 0.18;
        }
        return;
      }
      if (this.type === "spear") {
        if (this.tier >= 2 && dist < this.def.attackRange * 0.9) {
          this.x -= dir.x * this.def.speed * 0.28 * dt;
          this.y -= dir.y * this.def.speed * 0.28 * dt;
        }
        if (this.specialTimer <= 0 && dist < this.def.attackRange + 18 && this.parts.weaponMain !== false) {
          game.scheduleBossLineAttack(this, dir, this.def.attackRange * (this.tier >= 4 ? 1.18 : 1), 7 + this.tier, 0.45 + this.tier * 0.04);
          this.specialTimer = 1.9 - this.tier * 0.12;
        }
        return;
      }
      if (this.type === "sword") {
        if (this.tier >= 2 && this.specialTimer < 0.35) {
          this.x += side.x * this.def.speed * 0.36 * dt;
          this.y += side.y * this.def.speed * 0.36 * dt;
        }
        if (this.specialTimer <= 0 && dist < this.def.attackRange + 12 && this.parts.weaponMain !== false) {
          game.scheduleBossLineAttack(this, dir, this.def.attackRange + 18, 9 + this.tier, 0.55);
          if (this.tier >= 3 && Math.random() < 0.35) game.scheduleBossLineAttack(this, { x: dir.x * 0.85 + side.x * 0.28, y: dir.y * 0.85 + side.y * 0.28 }, this.def.attackRange + 12, 8, 0.36);
          this.specialTimer = 1.65 - this.tier * 0.1;
        }
        return;
      }
      if (this.type === "archer") {
        if (dist < 92) {
          this.x -= dir.x * this.def.speed * 0.7 * dt;
          this.y -= dir.y * this.def.speed * 0.7 * dt;
        } else if (this.tier >= 2) {
          this.x += side.x * Math.sin(this.walkPhase * 0.8) * this.def.speed * 0.32 * dt;
          this.y += side.y * Math.sin(this.walkPhase * 0.8) * this.def.speed * 0.32 * dt;
        }
        if (this.specialTimer <= 0 && dist < this.def.attackRange && this.parts.weaponMain !== false) {
          const drift = this.parts.head === false ? 0.22 : 0;
          game.scheduleBossLineAttack(this, { x: dir.x + side.x * drift, y: dir.y + side.y * drift }, this.def.attackRange, 6, 0.38);
          if (this.tier >= 3 && Math.random() < 0.28) game.scheduleBossLineAttack(this, { x: dir.x - side.x * 0.18, y: dir.y - side.y * 0.18 }, this.def.attackRange * 0.9, 5, 0.32);
          this.specialTimer = 2.2 - this.tier * 0.15;
        }
        return;
      }
      if (this.type === "blinkNinja") {
        if (dist < 120) {
          this.x -= dir.x * this.def.speed * 0.22 * dt;
          this.y -= dir.y * this.def.speed * 0.22 * dt;
        }
        if (this.specialTimer <= 0 && dist < this.def.attackRange + 80 && this.parts.weaponMain !== false) {
          game.scheduleBossLineAttack(this, dir, 58 + this.tier * 9, 5, 0.42);
          if (this.tier >= 3) game.scheduleBossLineAttack(this, { x: dir.x * 0.88 + side.x * 0.36, y: dir.y * 0.88 + side.y * 0.36 }, 48 + this.tier * 8, 4, 0.32);
          this.specialTimer = 1.4 - this.tier * 0.08;
        }
      }
    }

    bossPartState() {
      const missingLegs = (this.parts.leftLeg ? 0 : 1) + (this.parts.rightLeg ? 0 : 1);
      const missingArms = (this.parts.leftArm ? 0 : 1) + (this.parts.rightArm ? 0 : 1);
      return {
        headBroken: this.parts.head === false,
        missingLegs,
        oneLegBroken: missingLegs === 1,
        bothLegsBroken: missingLegs >= 2,
        leftArmBroken: this.parts.leftArm === false,
        rightArmBroken: this.parts.rightArm === false,
        bothArmsBroken: missingArms >= 2,
        mainWeaponBroken: this.parts.weaponMain === false,
        subWeaponBroken: this.parts.weaponSub === false,
        hornBroken: this.parts.horn === false,
        canUseMainWeapon: this.parts.weaponMain === true && this.parts.rightArm === true,
        canUseSubWeapon: this.parts.weaponSub === true && this.parts.leftArm === true
      };
    }

    bossConfusedDir(dir, strength = 1) {
      if (this.parts.head !== false) return dir;
      const chaos = this.headlessChaosTimer > 0 ? 1.45 : 1;
      const jitter = 1 + this.headlessAttackJitter * 0.35;
      const t = this.walkPhase + this.enemyLevel * 0.37 + this.rank * 0.53 + this.headlessMoveAngle * 0.21;
      const modeRoll = Math.abs(Math.sin(t * 1.7 + Math.cos(t * 0.8)));
      let angle = Math.atan2(dir.y, dir.x);
      const power = strength * chaos * jitter;

      if (modeRoll < 0.42) {
        angle += Math.sin(t * 2.1) * 0.45 * power;
      } else if (modeRoll < 0.68) {
        angle += (Math.sin(t) > 0 ? 1 : -1) * (0.75 + 0.35 * power);
      } else if (modeRoll < 0.86) {
        angle += Math.PI + Math.sin(t * 1.3) * 0.55 * power;
      } else {
        angle = this.headlessMoveAngle + t * 2.4;
      }

      return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    bossMoveDir(dir) {
      return this.parts.head === false ? this.bossConfusedDir(dir, 0.9) : dir;
    }

    bossAimDir(dir) {
      return this.parts.head === false ? this.bossConfusedDir(dir, 1.35) : dir;
    }

    headlessAttackGate() {
      if (this.parts.head !== false) return "normal";
      const t = this.walkPhase + this.enemyLevel * 0.91 + this.rank * 0.41 + this.headlessMoveAngle;
      const roll = Math.abs(Math.sin(t * 2.7));
      if (roll < 0.18) return "skip";
      if (roll < 0.34) return "delay";
      if (roll < 0.5) return "panic";
      if (roll < 0.66) return "rush";
      return "normal";
    }

    bossHeadlessPanicAttack(game, dir) {
      const aim = this.bossAimDir(dir);
      this.bossLineAttack(game, aim, 62 + this.rank * 6, 18, 0.42);
      if (Math.random() < 0.45) {
        this.bossLineAttack(game, { x: -aim.y, y: aim.x }, 48 + this.rank * 4, 16, 0.32);
      }
      this.bossSpecialTimer = 1.3 + Math.random() * 1.2;
    }

    bossHeadlessRush(game, dir) {
      const parts = this.bossPartState();
      const rushDir = this.bossMoveDir(dir);
      let power = this.type === "levelBoss" ? 240 : 180;
      if (parts.oneLegBroken) power *= 0.55;
      if (parts.bothLegsBroken) power *= 0.22;
      this.vx += rushDir.x * power;
      this.vy += rushDir.y * power;
      this.bossCharge = 0.22;
      if (!parts.bothArmsBroken && Math.random() < 0.65) {
        this.bossLineAttack(game, rushDir, 58 + this.rank * 5, 20, 0.45);
      }
      this.bossSpecialTimer = 1.4 + Math.random() * 1.4;
    }

    bossStrafeDir(dir) {
      if (this.type === "midBossArcher") {
        const side = { x: -dir.y, y: dir.x };
        const amount = Math.sin(this.walkPhase * 0.7) * 0.42;
        return { x: side.x * amount, y: side.y * amount };
      }
      if (this.type !== "levelBoss" || this.rank < 2) return { x: 0, y: 0 };
      const side = { x: -dir.y, y: dir.x };
      const amount = Math.sin(this.walkPhase * 0.5 + this.rank) * Math.min(0.55, this.rank * 0.08);
      return { x: side.x * amount, y: side.y * amount };
    }

    updateBossBehavior(dt, game, dir, dist) {
      if (this.type !== "midBoss" && this.type !== "midBossArcher" && this.type !== "levelBoss") return;
      this.bossSpecialTimer -= dt;
      this.bossCharge = Math.max(0, this.bossCharge - dt);
      if (this.bossCharge > 0 && Math.random() < 0.28) {
        game.effects.push({ type: "enemyPower", x: this.x, y: this.y, life: 0.08, maxLife: 0.08, size: this.radius + 8 });
      }
      if (this.bossSpecialTimer > 0) return;
      const rank = this.type === "levelBoss" ? this.rank : 1;
      const hpRatio = this.hp / this.def.hp;
      const parts = this.bossPartState();
      const phaseBoost = hpRatio < 0.4 ? 0.72 : hpRatio < 0.7 ? 0.88 : 1;
      const headTiming = parts.headBroken ? 1.2 + Math.random() * 0.75 : 1;
      const weaponPenalty = parts.mainWeaponBroken ? 0.62 : 1;
      const aim = this.bossAimDir(dir);
      if (parts.headBroken) {
        const gate = this.headlessAttackGate();
        if (gate === "skip") {
          this.bossSpecialTimer = 0.55 + Math.random() * 0.7;
          return;
        }
        if (gate === "delay") {
          this.bossSpecialTimer = 1.0 + Math.random() * 1.1;
          return;
        }
        if (gate === "panic") {
          this.bossHeadlessPanicAttack(game, dir);
          return;
        }
        if (gate === "rush") {
          this.bossHeadlessRush(game, dir);
          return;
        }
      }
      if (this.type === "midBoss") {
        const chargePower = parts.oneLegBroken || parts.bothLegsBroken ? 170 : 260;
        const chargeDir = parts.headBroken ? this.bossMoveDir(dir) : dir;
        this.vx += chargeDir.x * chargePower;
        this.vy += chargeDir.y * chargePower;
        this.bossCharge = 0.25;
        this.bossLineAttack(game, aim, 78 * weaponPenalty, 16, 0.65);
        if (hpRatio < 0.45 && parts.canUseSubWeapon) this.bossLineAttack(game, { x: -aim.y, y: aim.x }, 46, 18, 0.45);
        if (dist < 70) this.bossDamagePlayer(game, 0.75);
        this.bossSpecialTimer = 2.6 * phaseBoost * headTiming;
        return;
      }
      if (this.type === "midBossArcher") {
        const moveDir = parts.headBroken ? this.bossMoveDir(dir) : dir;
        const side = { x: -moveDir.y, y: moveDir.x };
        const retreat = dist < 118 ? -1 : 0;
        const legPenalty = parts.oneLegBroken || parts.bothLegsBroken ? 0.48 : 1;
        this.x += (side.x * Math.sin(this.walkPhase) * 54 + moveDir.x * retreat * 68) * dt * legPenalty;
        this.y += (side.y * Math.sin(this.walkPhase) * 54 + moveDir.y * retreat * 68) * dt * legPenalty;
        const baseAngle = Math.atan2(aim.y, aim.x);
        const spread = parts.headBroken ? 0.48 : hpRatio < 0.4 ? 0.26 : 0.18;
        if (parts.canUseMainWeapon) this.bossLineAttack(game, { x: Math.cos(baseAngle - spread), y: Math.sin(baseAngle - spread) }, 150, 10, 0.55);
        if (parts.canUseSubWeapon) this.bossLineAttack(game, { x: Math.cos(baseAngle + spread), y: Math.sin(baseAngle + spread) }, 150, 10, 0.55);
        if (hpRatio < 0.55) {
          const shots = parts.headBroken ? Math.max(1, (hpRatio < 0.35 ? 4 : 3) - 2) : hpRatio < 0.35 ? 4 : 3;
          for (let i = 0; i < shots; i += 1) {
            const angle = baseAngle + (i - (shots - 1) / 2) * 0.38;
            this.bossLineAttack(game, { x: Math.cos(angle), y: Math.sin(angle) }, 118, 9, 0.4);
          }
        }
        this.bossSpecialTimer = 2.15 * phaseBoost * headTiming * (parts.mainWeaponBroken && parts.subWeaponBroken ? 1.35 : 1);
        return;
      }
      if (rank < 2) {
        this.bossLineAttack(game, aim, 82 * weaponPenalty, 16, 0.8);
        this.bossSpecialTimer = 2.5 * phaseBoost * headTiming;
      } else if (rank < 4) {
        const chargeDir = parts.headBroken ? this.bossMoveDir(dir) : dir;
        this.vx += chargeDir.x * 320;
        this.vy += chargeDir.y * 320;
        this.bossLineAttack(game, aim, 120 * weaponPenalty, 20, 0.95);
        if (hpRatio < 0.5 && parts.canUseSubWeapon) this.bossLineAttack(game, { x: -aim.y, y: aim.x }, 76, 18, 0.55);
        this.bossSpecialTimer = 2.25 * phaseBoost * headTiming;
      } else {
        const shots = parts.headBroken ? Math.max(2, (hpRatio < 0.4 ? 5 : 4) - 1) : hpRatio < 0.4 ? 5 : 4;
        const center = Math.atan2(aim.y, aim.x);
        for (let i = 0; i < shots; i += 1) {
          const angle = center + (i - (shots - 1) / 2) * 0.42;
          this.bossLineAttack(game, { x: Math.cos(angle), y: Math.sin(angle) }, (130 + rank * 10) * weaponPenalty, 22, 0.72);
        }
        this.bossSpecialTimer = Math.max(1.35, (2.4 - rank * 0.08) * phaseBoost * headTiming);
      }
    }

    bossLineAttack(game, dir, length, width, damageScale) {
      game.scheduleBossLineAttack(this, dir, length, width, damageScale);
      this.bossCharge = 0.18;
    }

    bossDamagePlayer(game, scale) {
      game.damagePlayer(this.def.damage * scale, 4, 0.1, 18);
    }

    takeDamage(amount, game, dir = { x: 1, y: 0 }, source = "katana") {
      const context = typeof source === "string" ? { sourceType: source } : source || {};
      const sourceType = context.sourceType || "unknown";
      const isCritical = !!context.isCritical;
      if (this.dead) {
        return new DamageResult({ amount: 0, isCritical, isKillingBlow: false, didDismember: false, hitPosition: context.hitPosition, hitDirection: dir, sourceType, attributeType: context.attributeType });
      }
      if (this.parts.body === false) amount = Math.ceil(amount * 1.18);
      const beforeHp = this.hp;
      this.hp -= amount;
      game.recordDamage(Math.min(beforeHp, amount));
      this.flash = 0.08;
      game.effects.push({ x: this.x, y: this.y, life: 0.12, size: 8 });
      if (this.type === "midBoss" || this.type === "midBossArcher" || this.type === "levelBoss") {
        game.effectManager.hit(this.x, this.y, dir, 8 + this.rank * 2 + (isCritical ? 8 : 0));
        if (isCritical) game.effects.push({ type: "enemyPower", x: this.x, y: this.y, life: 0.28, maxLife: 0.28, size: this.radius + 16 });
      }
      const dismember = this.tryDismember(game, dir, amount, context);
      const result = new DamageResult({
        amount,
        isCritical,
        isKillingBlow: this.hp <= 0,
        didDismember: !!dismember,
        dismemberedPart: dismember || null,
        hitPosition: context.hitPosition || { x: this.x, y: this.y },
        hitDirection: dir,
        sourceType,
        attributeType: context.attributeType
      });
      if (this.hp <= 0) {
        this.dead = true;
        this.scatterRemainingParts(game, dir, isCritical);
        game.onEnemyKilled(this, dir, result);
        game.dropManager.dropEnemyLoot(this);
      }
      return result;
    }

    updateStatus(dt, game) {
      this.slowTime = Math.max(0, this.slowTime - dt);
      this.freezeTime = Math.max(0, this.freezeTime - dt);
      this.stunTime = Math.max(0, this.stunTime - dt);
      this.headlessChaosTimer = Math.max(0, this.headlessChaosTimer - dt);
      this.headlessAttackJitter = Math.max(0, this.headlessAttackJitter - dt * 0.22);
      if (this.burnTime <= 0) return;
      this.burnTime -= dt;
      this.burnTick -= dt;
      if (this.burnTick <= 0) {
        this.burnTick = 0.45;
        const beforeHp = this.hp;
        this.hp -= 2;
        game.recordDamage(Math.min(beforeHp, 2));
        this.flash = Math.max(this.flash, 0.16);
        game.sfx.queueElement("fire");
        game.effectManager.burnTick(this.x, this.y, this.radius, this.burnTime);
        game.effects.push({ type: "burnTick", x: this.x, y: this.y, life: 0.38, maxLife: 0.38, size: 18 + Math.min(18, this.radius * 0.55), damage: 2 });
        game.effects.push({ type: "fire", x: this.x, y: this.y, life: 0.36, maxLife: 0.36, size: 20 + Math.min(18, this.radius * 0.45) });
        if (this.hp <= 0) {
          this.dead = true;
          const result = new DamageResult({ amount: 2, isCritical: false, isKillingBlow: true, didDismember: false, hitPosition: { x: this.x, y: this.y }, hitDirection: { x: 0, y: -1 }, sourceType: "fire", attributeType: "fire" });
          this.scatterRemainingParts(game, { x: 0, y: -1 }, false);
          game.onEnemyKilled(this, { x: 0, y: -1 }, result);
          game.dropManager.dropEnemyLoot(this);
        }
      }
    }

    applyBurn(duration) {
      this.burnTime = Math.max(this.burnTime, duration);
      this.burnTick = Math.min(this.burnTick, 0.1);
    }

    applySlow(duration) {
      this.slowTime = Math.max(this.slowTime, duration);
    }

    applyFreeze(duration) {
      this.freezeTime = Math.max(this.freezeTime, duration);
    }

    applyStun(duration) {
      this.stunTime = Math.max(this.stunTime, duration);
    }

    applyKnockback(x, y, power) {
      const dir = normalized(x, y);
      const resist = this.def.knockbackResist ?? 1;
      this.vx += dir.x * power * resist;
      this.vy += dir.y * power * resist;
    }

    movementMultiplier() {
      const missingLegs = (this.parts.leftLeg ? 0 : 1) + (this.parts.rightLeg ? 0 : 1);
      if (missingLegs >= 2) return 0.34;
      if (missingLegs === 1) return 0.68;
      return 1;
    }

    attackMultiplier() {
      const missingArms = (this.parts.leftArm ? 0 : 1) + (this.parts.rightArm ? 0 : 1);
      let multiplier = missingArms >= 2 ? 0.35 : missingArms === 1 ? 0.65 : 1;
      if ((this.def.weapon === "spear" || this.def.weapon === "sword") && !this.parts.rightArm) multiplier *= 0.55;
      if (this.parts.weaponMain === false) multiplier *= 0.52;
      if (this.parts.weaponSub === false) multiplier *= 0.78;
      if (this.parts.head === false) multiplier *= 0.85;
      return multiplier;
    }

    tryDismember(game, dir, amount, source) {
      const context = typeof source === "string" ? { sourceType: source } : source || {};
      if (!["farmer", "spear", "sword", "archer", "blinkNinja", "midBoss", "midBossArcher", "levelBoss"].includes(this.type)) return false;
      const alive = Object.keys(this.parts).filter((part) => this.parts[part]);
      if (alive.length === 0) return false;
      const boss = isBossType(this.type);
      let chance = 0.08 + amount / Math.max(80, this.def.hp * 2);
      if (boss) {
        const hpRatio = clamp(this.hp / this.def.hp, 0, 1);
        chance = 0.1 + amount / Math.max(90, this.def.hp * 1.15);
        if (hpRatio < 0.68) chance += 0.06;
        if (hpRatio < 0.38) chance += 0.08;
        if (context.isCritical) chance += 0.18;
        if (context.sourceType === "katana" && amount >= this.def.hp * 0.045) chance += 0.08;
        chance = Math.min(chance, this.type === "levelBoss" ? 0.48 : 0.58);
      }
      if (context.sourceType === "wall") chance += 0.38;
      if (context.isCritical) chance += context.dismemberChanceBonus ?? CRITICAL_DEFAULTS.dismemberChanceBonus;
      if (this.freezeTime > 0) chance += 0.18;
      if (this.lastHitElement === "ice") chance += 0.08;
      if (this.lastHitElement === "lightning" && Math.random() < 0.12) chance += 0.18;
      if (Math.random() > chance) return false;
      const part = alive[Math.floor(Math.random() * alive.length)];
      this.parts[part] = false;
      this.flash = 0.22;
      game.sfx.queueDismember(part, boss);
      game.effectManager.dismember(this.x, this.y, dir, part);
      if (boss) {
        const scale = this.type === "levelBoss" ? 1.35 + this.rank * 0.08 : 1.05;
        game.effectManager.bossDismember(this.x, this.y, dir, part, scale);
        game.requestHitStop(this.type === "levelBoss" ? 0.07 : 0.055);
        game.killPulse = Math.max(game.killPulse, 0.38);
        game.effects.push({
          type: "bossBreakPop",
          x: this.x,
          y: this.y - this.radius - 28,
          life: 0.92,
          maxLife: 0.92,
          text: `${bossPartLabel(part)}破壊`
        });
        if (part === "head") {
          this.headlessChaosTimer = 4.5;
          this.headlessMoveAngle = Math.random() * FULL_SPIN;
          this.headlessAttackJitter = 0.8;
          this.bossSpecialTimer = 0.25 + Math.random() * 0.45;
          const angle = Math.random() * FULL_SPIN;
          const panicPower = this.type === "levelBoss" ? 180 : 130;
          this.vx += Math.cos(angle) * panicPower;
          this.vy += Math.sin(angle) * panicPower;
          game.bossAttacks = game.bossAttacks.filter((attack) => attack.owner !== this);
          game.effects.push({
            type: "bossBreakPop",
            x: this.x,
            y: this.y - this.radius - 48,
            life: 0.92,
            maxLife: 0.92,
            text: "制御不能"
          });
        }
      } else {
        game.effects.push({
          type: "partBreakPop",
          x: this.x,
          y: this.y - this.radius - 14,
          life: 0.46,
          maxLife: 0.46,
          text: part && part.startsWith("weapon") ? "武器破壊" : "破壊"
        });
      }
      return part;
    }

    scatterRemainingParts(game, dir, force) {
      for (const part of Object.keys(this.parts)) {
        if (!this.parts[part]) continue;
        if (force || Math.random() < 0.28) {
          game.effectManager.dismember(this.x, this.y, dir, part);
          game.sfx.queueDismember(part, isBossType(this.type));
        }
        this.parts[part] = false;
      }
    }

    handleWallCollision(game) {
      if (this.wallCooldown > 0 || this.dead) return;
      const speed = Math.hypot(this.vx, this.vy);
      const bounds = game.playArea;
      if (speed < 170) {
        this.x = clamp(this.x, bounds.left + this.radius, bounds.right - this.radius);
        this.y = clamp(this.y, bounds.top + this.radius, bounds.bottom - this.radius);
        return;
      }
      let normal = null;
      if (this.x < bounds.left + this.radius) normal = { x: 1, y: 0 };
      else if (this.x > bounds.right - this.radius) normal = { x: -1, y: 0 };
      else if (this.y < bounds.top + this.radius) normal = { x: 0, y: 1 };
      else if (this.y > bounds.bottom - this.radius) normal = { x: 0, y: -1 };
      if (!normal) return;
      this.x = clamp(this.x, bounds.left + this.radius, bounds.right - this.radius);
      this.y = clamp(this.y, bounds.top + this.radius, bounds.bottom - this.radius);
      const wind = game.player.attributes.get("wind");
      const damage = Math.floor(speed * 0.065 + wind * 1.4 + (game.player.attributes.hasMilestone("wind", 15) ? 12 : 0));
      this.wallCooldown = 0.25;
      game.onWallCollision(this, normal, damage, speed);
      if (!this.dead) {
        this.vx = normal.x * Math.min(360, speed * 0.58);
        this.vy = normal.y * Math.min(360, speed * 0.58);
      }
    }

    absorbXp(value, game) {
      return;
    }

    draw(ctx, player) {
      const x = Math.round(this.x);
      const bobPower = this.type === "armor" || this.type === "midBoss" || this.type === "midBossArcher" || this.type === "levelBoss" ? 1 : 2;
      const bob = Math.round(Math.sin(this.walkPhase) * bobPower);
      const y = Math.round(this.y + bob);
      const dir = normalized(player.x - this.x, player.y - this.y);
      ctx.fillStyle = ORANGE;
      if (this.type === "blinkNinja" && Math.floor(performance.now() / 120) % 2 === 0) {
        const after = Math.round(Math.sin(this.walkPhase) * 5);
        rect(ctx, x - 9 - after, y - 13, 18, 2);
        rect(ctx, x - 9 + after, y + 7, 18, 2);
        rect(ctx, x - 13, y - 9 - after, 2, 18);
        rect(ctx, x + 11, y - 9 + after, 2, 18);
        if (this.tier >= 2) {
          rect(ctx, x - 16, y - 16, 4, 2);
          rect(ctx, x + 12, y + 12, 4, 2);
        }
        return;
      }
      const powerScale = 1 + Math.min(0.32, this.powerLevel * 0.045);
      const scale = (this.type === "levelBoss" ? 2.55 + this.rank * 0.18 : this.type === "midBoss" || this.type === "midBossArcher" ? 2 : this.type === "brute" ? 1.55 : this.type === "armor" ? 1.35 : this.type === "shield" ? 1.18 : 1) * powerScale;
      const step = Math.round(Math.sin(this.walkPhase) * 3 * scale);
      const arm = Math.round(Math.cos(this.walkPhase) * 2 * scale);
      if (this.parts.head) rect(ctx, x - 4 * scale, y - 9 * scale, 8 * scale, 4 * scale);
      else rect(ctx, x - 3 * scale, y - 7 * scale, 6 * scale, 2 * scale);
      rect(ctx, x - 5 * scale, y - 5 * scale, 10 * scale, 8 * scale);
      if (this.parts.body === false) {
        rect(ctx, x - 5 * scale, y - 2 * scale, 10 * scale, 2);
        linePixels(ctx, x - 4 * scale, y - 5 * scale, x + 4 * scale, y + 3 * scale);
      }
      if (this.parts.leftLeg) rect(ctx, x - 4 * scale, y + 3 * scale + step, 3 * scale, 5 * scale);
      else rect(ctx, x - 5 * scale, y + 6 * scale, 3 * scale, 2 * scale);
      if (this.parts.rightLeg) rect(ctx, x + 1 * scale, y + 3 * scale - step, 3 * scale, 5 * scale);
      else rect(ctx, x + 2 * scale, y + 6 * scale, 3 * scale, 2 * scale);
      if (this.parts.leftArm) rect(ctx, x - 7 * scale, y - 4 * scale + arm, 2 * scale, 7 * scale);
      if (this.parts.rightArm) rect(ctx, x + 5 * scale, y - 4 * scale - arm, 2 * scale, 7 * scale);
      this.drawTierMarks(ctx, x, y, scale, dir);

      if (this.def.weapon === "spear" && this.parts.rightArm && this.parts.weaponMain !== false) {
        const thrust = 3 + Math.sin(this.walkPhase * 1.4) * 5;
        linePixels(ctx, x + dir.x * 6, y - 3 + dir.y * 6, x + dir.x * (28 + thrust), y - 3 + dir.y * (28 + thrust));
        rect(ctx, x + dir.x * (30 + thrust) - 1, y - 4 + dir.y * (30 + thrust), 3, 3);
      } else if (this.def.weapon === "sword" && this.parts.rightArm && this.parts.weaponMain !== false) {
        const slashLift = Math.sin(this.walkPhase * 1.6) * 5;
        linePixels(ctx, x + dir.x * 5, y - 2 + dir.y * 5, x + dir.x * 17 - dir.y * slashLift, y - 2 + dir.y * 17 + dir.x * slashLift);
      } else if (this.def.weapon === "bow" && this.parts.weaponMain !== false) {
        const pull = Math.sin(this.walkPhase * 1.1) * 3;
        linePixels(ctx, x - dir.y * 9 + dir.x * 3, y + dir.x * 9 + dir.y * 3, x - dir.y * 15 + dir.x * 12, y + dir.x * 15 + dir.y * 12 + pull);
        linePixels(ctx, x + dir.y * 9 + dir.x * 3, y - dir.x * 9 + dir.y * 3, x + dir.y * 15 + dir.x * 12, y - dir.x * 15 + dir.y * 12 - pull);
        linePixels(ctx, x - dir.y * 15 + dir.x * 12, y + dir.x * 15 + dir.y * 12 + pull, x + dir.y * 15 + dir.x * 12, y - dir.x * 15 + dir.y * 12 - pull);
        linePixels(ctx, x + dir.x * 4, y + dir.y * 4, x + dir.x * (18 + this.tier * 2), y + dir.y * (18 + this.tier * 2));
      } else if (this.def.weapon === "dagger") {
        const stab = Math.sin(this.walkPhase * 2.1) * 4;
        linePixels(ctx, x + dir.x * 5, y - 2 + dir.y * 5, x + dir.x * (13 + stab), y - 2 + dir.y * (13 + stab));
        rect(ctx, x - dir.x * 6 - 2, y - dir.y * 6 - 2, 4, 4);
      } else if (this.def.weapon === "shield") {
        rect(ctx, x - dir.y * 8 + dir.x * 4 - 4, y + dir.x * 8 + dir.y * 4 - 7, 8, 14);
        linePixels(ctx, x + dir.x * 4, y - 2 + dir.y * 4, x + dir.x * 15, y - 2 + dir.y * 15);
        rect(ctx, x - 8, y - 12, 16, 2);
      } else if (this.def.weapon === "club") {
        const lift = Math.sin(this.walkPhase * 1.1) * 8;
        thickLinePixels(ctx, x + dir.x * 4, y - 5 + dir.y * 4, x + dir.x * 22 - dir.y * lift, y - 5 + dir.y * 22 + dir.x * lift, 4);
        rect(ctx, x + dir.x * 24 - dir.y * lift - 4, y - 8 + dir.y * 24 + dir.x * lift, 8, 8);
      } else if (this.def.weapon === "monk") {
        const pulse = 8 + Math.round(Math.sin(this.walkPhase * 1.8) * 3);
        rect(ctx, x - 6, y - 15, 12, 2);
        rect(ctx, x - 2, y - 18, 4, 4);
        rect(ctx, x - pulse, y - pulse, pulse * 2, 1);
        rect(ctx, x - pulse, y + pulse, pulse * 2, 1);
        rect(ctx, x - pulse, y - pulse, 1, pulse * 2);
        rect(ctx, x + pulse, y - pulse, 1, pulse * 2);
      } else if (this.def.weapon === "armor") {
        rect(ctx, x - 8, y - 11, 16, 3);
        rect(ctx, x - 8, y - 4, 16, 2);
        rect(ctx, x - 8, y + 2, 16, 2);
        rect(ctx, x - 9, y - 8, 3, 16);
        rect(ctx, x + 6, y - 8, 3, 16);
        if (Math.sin(this.walkPhase) > 0.6) rect(ctx, x - 11, y + 10, 22, 2);
      } else if (this.def.weapon === "boss") {
        const bossSwing = Math.sin(this.walkPhase * 0.9) * 8;
        const spearLen = 38;
        const swordLen = 24;
        if (this.parts.weaponMain !== false) {
          linePixels(ctx, x + dir.x * 8, y - 5 + dir.y * 8, x + dir.x * spearLen - dir.y * bossSwing, y - 5 + dir.y * spearLen + dir.x * bossSwing);
          rect(ctx, x + dir.x * (spearLen + 3) - dir.y * bossSwing - 2, y - 6 + dir.y * (spearLen + 3) + dir.x * bossSwing, 5, 5);
        } else {
          rect(ctx, x + dir.x * 8 - 3, y - 5 + dir.y * 8 - 1, 7, 2);
        }
        if (this.parts.weaponSub !== false) {
          linePixels(ctx, x - dir.x * 7, y - 2 - dir.y * 7, x - dir.x * swordLen + dir.y * bossSwing, y - 2 - dir.y * swordLen - dir.x * bossSwing);
        } else {
          rect(ctx, x - dir.x * 7 - 3, y - 2 - dir.y * 7 - 1, 7, 2);
        }
        rect(ctx, x - 13, y - 20, 26, 3);
        rect(ctx, x - 10, y + 10, 20, 3);
        rect(ctx, x - 16, y - 16, 5, 10);
        rect(ctx, x + 11, y - 16, 5, 10);
      } else if (this.def.weapon === "archerBoss") {
        const aim = Math.sin(this.walkPhase * 0.8) * 5;
        rect(ctx, x - 20, y - 17, 40, 3);
        rect(ctx, x - 17, y + 10, 34, 3);
        rect(ctx, x - 19, y - 5, 5, 12);
        rect(ctx, x + 14, y - 5, 5, 12);
        for (let i = 0; i < 5; i += 1) rect(ctx, x - 10 + i * 5, y - 23 - (i % 2), 2, 8);
        if (this.parts.weaponMain !== false) {
          linePixels(ctx, x - 20 + dir.x * 5, y - 4 + dir.y * 5, x - 30 + dir.x * 17 - dir.y * aim, y - 16 + dir.y * 17 + dir.x * aim);
          linePixels(ctx, x - 20 + dir.x * 5, y + 4 + dir.y * 5, x - 30 + dir.x * 17 - dir.y * aim, y + 16 + dir.y * 17 + dir.x * aim);
          linePixels(ctx, x - 30 + dir.x * 17 - dir.y * aim, y - 16 + dir.y * 17 + dir.x * aim, x - 30 + dir.x * 17 - dir.y * aim, y + 16 + dir.y * 17 + dir.x * aim);
        }
        if (this.parts.weaponSub !== false) {
          linePixels(ctx, x + 20 + dir.x * 5, y - 4 + dir.y * 5, x + 30 + dir.x * 17 + dir.y * aim, y - 16 + dir.y * 17 - dir.x * aim);
          linePixels(ctx, x + 20 + dir.x * 5, y + 4 + dir.y * 5, x + 30 + dir.x * 17 + dir.y * aim, y + 16 + dir.y * 17 - dir.x * aim);
          linePixels(ctx, x + 30 + dir.x * 17 + dir.y * aim, y - 16 + dir.y * 17 - dir.x * aim, x + 30 + dir.x * 17 + dir.y * aim, y + 16 + dir.y * 17 - dir.x * aim);
        }
        if (this.parts.head === false) rect(ctx, x - 7, y - 21, 14, 2);
      } else if (this.def.weapon === "levelBoss") {
        const bossSwing = Math.sin(this.walkPhase * 0.75) * (10 + this.rank * 2);
        const mainLen = 52 + this.rank * 6;
        const subLen = 34 + this.rank * 4;
        if (this.parts.weaponMain !== false) {
          thickLinePixels(ctx, x + dir.x * 12, y - 8 + dir.y * 12, x + dir.x * mainLen - dir.y * bossSwing, y - 8 + dir.y * mainLen + dir.x * bossSwing, 5);
          rect(ctx, x + dir.x * (mainLen + 6) - dir.y * bossSwing - 5, y - 12 + dir.y * (mainLen + 6) + dir.x * bossSwing, 10, 10);
        } else {
          rect(ctx, x + dir.x * 12 - 5, y - 8 + dir.y * 12 - 2, 10, 4);
        }
        if (this.parts.weaponSub !== false) {
          thickLinePixels(ctx, x - dir.x * 10, y - 5 - dir.y * 10, x - dir.x * subLen + dir.y * bossSwing, y - 5 - dir.y * subLen - dir.x * bossSwing, 4);
        } else {
          rect(ctx, x - dir.x * 10 - 4, y - 5 - dir.y * 10 - 2, 8, 4);
        }
        rect(ctx, x - 18, y - 25, 36, 4);
        rect(ctx, x - 14, y + 14, 28, 4);
        rect(ctx, x - 22, y - 18, 4, 36);
        rect(ctx, x + 18, y - 18, 4, 36);
        if (this.rank >= 2 && this.parts.horn !== false) {
          rect(ctx, x - 28, y - 16, 6, 10);
          rect(ctx, x + 22, y - 16, 6, 10);
          rect(ctx, x - 18, y - 30, 8, 7);
          rect(ctx, x + 10, y - 30, 8, 7);
        }
        if (this.rank >= 4) {
          const aura = 28 + Math.round(Math.sin(this.walkPhase) * 4);
          rect(ctx, x - aura, y - aura, aura * 2, 2);
          rect(ctx, x - aura, y + aura, aura * 2, 2);
          rect(ctx, x - aura, y - aura, 2, aura * 2);
          rect(ctx, x + aura, y - aura, 2, aura * 2);
        }
        for (let i = 0; i < this.rank; i += 1) {
          rect(ctx, x - 4 + i * 4, y - 31, 3, 5);
        }
      } else if (this.def.weapon === "ninja") {
        const flip = Math.round(Math.sin(this.walkPhase * 2) * 4);
        rect(ctx, x - 5, y - 11, 10, 3);
        rect(ctx, x - 3, y - 8, 6, 3);
        linePixels(ctx, x - 7, y - 2 + flip, x + 7, y + 4 - flip);
        linePixels(ctx, x + 7, y - 2 - flip, x - 7, y + 4 + flip);
        rect(ctx, x - 12 - flip, y - 1, 4, 2);
        rect(ctx, x + 8 + flip, y - 1, 4, 2);
      } else {
        rect(ctx, x - 7, y - 2 + arm, 14, 2);
      }

      if (this.flash > 0) {
        rect(ctx, x - 8, y - 12, 16, 2);
      }
      if (this.powerLevel > 0) {
        const halo = 10 + Math.min(16, this.powerLevel * 2);
        rect(ctx, x - halo, y - halo, halo * 2, 1);
        rect(ctx, x - halo, y + halo, halo * 2, 1);
        rect(ctx, x - halo, y - halo, 1, halo * 2);
        rect(ctx, x + halo, y - halo, 1, halo * 2);
      }
      if (this.slowTime > 0) {
        rect(ctx, x - 10, y - 14, 20, 1);
        rect(ctx, x - 10, y + 10, 20, 1);
      }
      if (this.freezeTime > 0) {
        rect(ctx, x - 12, y - 12, 24, 2);
        rect(ctx, x - 12, y + 10, 24, 2);
        rect(ctx, x - 12, y - 12, 2, 24);
        rect(ctx, x + 10, y - 12, 2, 24);
      }
      if (this.stunTime > 0) {
        rect(ctx, x - 10, y - 18, 6, 3);
        rect(ctx, x - 1, y - 20, 6, 3);
        rect(ctx, x + 8, y - 18, 6, 3);
      }
      if (this.burnTime > 0) {
        rect(ctx, x - 2, y - 17, 4, 4);
        rect(ctx, x + 3, y - 13, 3, 3);
      }
      if (isBossType(this.type)) this.drawBossBreakScars(ctx, x, y, scale);
    }

    drawBossBreakScars(ctx, x, y, scale) {
      const scarScale = Math.min(scale, 1.35);
      const marks = [];
      if (this.parts.head === false) marks.push({ x: 0, y: -9, w: 16, h: 3, cut: "h" });
      if (this.parts.body === false) marks.push({ x: 0, y: -1, w: 22, h: 4, cut: "x" });
      if (this.parts.leftArm === false) marks.push({ x: -12, y: -1, w: 9, h: 11, cut: "v" });
      if (this.parts.rightArm === false) marks.push({ x: 12, y: -1, w: 9, h: 11, cut: "v" });
      if (this.parts.leftLeg === false) marks.push({ x: -7, y: 9, w: 9, h: 8, cut: "h" });
      if (this.parts.rightLeg === false) marks.push({ x: 7, y: 9, w: 9, h: 8, cut: "h" });
      if (this.parts.weaponMain === false) marks.push({ x: 18, y: -13, w: 16, h: 8, cut: "weapon" });
      if (this.parts.weaponSub === false) marks.push({ x: -18, y: -10, w: 14, h: 7, cut: "weapon" });
      if (this.parts.horn === false) marks.push({ x: 0, y: -24, w: 28, h: 5, cut: "h" });
      if (marks.length === 0) return;

      ctx.fillStyle = ORANGE;
      for (const mark of marks) {
        const mx = x + mark.x * scarScale;
        const my = y + mark.y * scarScale;
        thickLinePixels(ctx, mx - mark.w * scarScale / 2, my, mx + mark.w * scarScale / 2, my, Math.max(2, 2 * scarScale));
        if (mark.cut === "x") {
          linePixels(ctx, mx - mark.w * scarScale / 2, my - mark.h * scarScale, mx + mark.w * scarScale / 2, my + mark.h * scarScale);
          linePixels(ctx, mx + mark.w * scarScale / 2, my - mark.h * scarScale, mx - mark.w * scarScale / 2, my + mark.h * scarScale);
        } else if (mark.cut === "v") {
          linePixels(ctx, mx - mark.w * scarScale / 2, my - mark.h * scarScale / 2, mx, my + mark.h * scarScale / 2);
          linePixels(ctx, mx + mark.w * scarScale / 2, my - mark.h * scarScale / 2, mx, my + mark.h * scarScale / 2);
        } else if (mark.cut === "weapon") {
          dashedLinePixels(ctx, mx - mark.w * scarScale / 2, my - mark.h * scarScale / 2, mx + mark.w * scarScale / 2, my + mark.h * scarScale / 2, Math.max(2, 2 * scarScale), 7);
          dashedLinePixels(ctx, mx + mark.w * scarScale / 2, my - mark.h * scarScale / 2, mx - mark.w * scarScale / 2, my + mark.h * scarScale / 2, Math.max(2, 2 * scarScale), 7);
          ctx.fillStyle = LIGHT_ORANGE;
          rect(ctx, mx - 2, my - 2, 4, 4);
          ctx.fillStyle = ORANGE;
        }
      }
    }

    drawTierMarks(ctx, x, y, scale, dir) {
      if (this.tier <= 0 || isBossType(this.type)) return;
      ctx.fillStyle = ORANGE;
      if (this.tier >= 1) {
        rect(ctx, x - 6 * scale, y - 12 * scale, 3, 2);
        rect(ctx, x + 3 * scale, y - 12 * scale, 3, 2);
      }
      if (this.tier >= 2) {
        rect(ctx, x - 9 * scale, y - 7 * scale, 3, 5);
        rect(ctx, x + 6 * scale, y - 7 * scale, 3, 5);
      }
      if (this.tier >= 3) {
        linePixels(ctx, x - 6 * scale, y + 1 * scale, x + 6 * scale, y - 4 * scale);
        rect(ctx, x + dir.x * 12 - 2, y + dir.y * 12 - 2, 4, 4);
      }
      if (this.tier >= 4 && Math.floor(performance.now() / 260) % 2 === 0) {
        rect(ctx, x - 13 * scale, y - 15 * scale, 3, 3);
        rect(ctx, x + 10 * scale, y + 9 * scale, 3, 3);
      }
    }
  }

  class EnemySpawner {
    constructor() {
      this.timer = 0;
      this.bossTimer = 24;
      this.spawned = 0;
      this.swarmTimer = 34;
      this.swarmActive = 0;
      this.swarmRemaining = 0;
      this.swarmSpawnTimer = 0;
    }

    update(dt, game) {
      this.bossTimer -= dt;
      if (this.bossTimer <= 0) {
        const profile = game.difficultyProfile();
        const bossType = this.spawned % 2 === 0 ? "midBoss" : "midBossArcher";
        this.spawnEnemy(game, bossType);
        this.bossTimer = Math.max(30 + profile.bossDelay, 48 - Math.min(12, game.elapsed / 30));
        game.notice = bossType === "midBossArcher" ? "双弓射手" : "中ボス";
        game.noticeTimer = 1.8;
        game.sfx.boss();
      }

      const profile = game.difficultyProfile();
      this.swarmTimer -= dt;
      if (this.swarmTimer <= 0 && this.swarmActive <= 0) this.startSwarm(game, profile);
      if (this.updateSwarm(dt, game, profile)) return;

      this.timer -= dt;
      if (this.timer > 0) return;
      const isOpeningWave = this.spawned < 5 && game.elapsed < 7;
      if (!isOpeningWave) {
        const livingEnemies = this.livingCount(game);
        if (livingEnemies >= profile.maxEnemies) {
          this.timer = Math.max(this.timer, 0.3);
          return;
        }
      }
      const progress = game.bloodGoal ? game.bloodGoal.progress() : 0;
      const pressure = game.elapsed / 80 + progress * 0.5 + game.runStats.bossKills * 0.08 + game.runStats.midBossKills * 0.04;
      const baseTimer = isOpeningWave ? 0.58 : Math.max(0.36, 1.08 - Math.min(0.52, pressure * 0.11));
      this.timer = baseTimer / profile.spawnRate;
      const type = this.pickType(game);
      this.spawnEnemy(game, type, isOpeningWave);
      this.spawned += 1;
    }

    livingCount(game) {
      let livingEnemies = 0;
      for (const enemy of game.enemies) {
        if (!enemy.dead) livingEnemies += 1;
      }
      return livingEnemies;
    }

    startSwarm(game, profile = game.difficultyProfile()) {
      const threat = game.enemyThreatLevel ? game.enemyThreatLevel() : game.level;
      const compactPenalty = Math.round(profile.compact * 4);
      this.swarmActive = 5.2 + Math.min(3.2, threat / 26) + game.continues * 0.35;
      this.swarmRemaining = clamp(Math.round(10 + threat * 0.34 + game.continues * 4 - compactPenalty), 10, 34);
      this.swarmSpawnTimer = 0;
      game.notice = "敵勢殺到";
      game.noticeTimer = 1.6;
      game.sfx.queueWall(1.15);
      game.effects.push({
        type: "objectivePop",
        x: game.width / 2,
        y: game.playArea.top + 72,
        life: 1.1,
        maxLife: 1.1,
        text: "敵勢殺到",
        strong: true
      });
      game.effects.push({
        type: "enemyPower",
        x: game.player.x,
        y: game.player.y,
        life: 0.62,
        maxLife: 0.62,
        size: 76
      });
    }

    updateSwarm(dt, game, profile) {
      if (this.swarmActive <= 0) return false;
      this.swarmActive -= dt;
      if (this.swarmActive <= 0) {
        this.finishSwarm(game);
        return false;
      }
      this.swarmSpawnTimer -= dt;
      if (this.swarmSpawnTimer > 0) return true;

      const livingEnemies = this.livingCount(game);
      if (livingEnemies >= this.swarmMaxEnemies(game, profile)) {
        this.swarmSpawnTimer = 0.16;
        return true;
      }

      const canDouble = game.playArea.width >= 560 && this.swarmRemaining > 3 && Math.random() < 0.28;
      const spawnCount = canDouble ? 2 : 1;
      for (let i = 0; i < spawnCount && this.swarmRemaining > 0; i += 1) {
        this.spawnEnemy(game, this.pickSwarmType(game), false);
        this.spawned += 1;
        this.swarmRemaining -= 1;
      }
      this.swarmSpawnTimer = this.swarmInterval(game);
      if (this.swarmRemaining <= 0 || this.swarmActive <= 0) this.finishSwarm(game);
      return true;
    }

    finishSwarm(game) {
      const threat = game.enemyThreatLevel ? game.enemyThreatLevel() : game.level;
      this.swarmActive = 0;
      this.swarmRemaining = 0;
      this.swarmSpawnTimer = 0;
      this.swarmTimer = Math.max(24, 44 - Math.min(14, threat / 5) - game.continues * 3);
    }

    swarmInterval(game) {
      const threat = game.enemyThreatLevel ? game.enemyThreatLevel() : game.level;
      return Math.max(0.1, 0.19 - Math.min(0.055, threat * 0.0014) - game.continues * 0.008);
    }

    swarmMaxEnemies(game, profile) {
      const threat = game.enemyThreatLevel ? game.enemyThreatLevel() : game.level;
      return profile.maxEnemies + 8 + Math.min(18, Math.floor(threat / 9) + game.continues * 3);
    }

    pickSwarmType(game) {
      const threat = game.enemyThreatLevel ? game.enemyThreatLevel() : game.level;
      const roll = Math.random();
      if (threat >= 50 && roll > 0.93) return "brute";
      if (threat >= 42 && roll > 0.88) return "armor";
      if (threat >= 34 && roll > 0.82) return "shield";
      if (threat >= 28 && roll > 0.74) return "archer";
      if (threat >= 22 && roll > 0.66) return "monk";
      if (roll < 0.42) return "farmer";
      if (roll < 0.60) return "scout";
      if (roll < 0.78) return "spear";
      return "sword";
    }

    spawnEnemy(game, type, nearPlayer = false) {
      const point = this.findSpawnPoint(game, nearPlayer);
      const profile = game.difficultyProfile();
      const enemy = new Enemy(type, point.x, point.y, 1, game.enemyLevelForSpawn());
      game.applyEnemyProfile(enemy, profile);
      game.enemies.push(enemy);
      if (nearPlayer) {
        game.effects.push({
          type: "enemyPower",
          x: point.x,
          y: point.y,
          life: 0.32,
          maxLife: 0.32,
          size: 24
        });
      }
    }

    findSpawnPoint(game, nearPlayer = false) {
      const side = Math.floor(Math.random() * 4);
      const bounds = game.playArea;
      const profile = game.difficultyProfile();
      const minDist = nearPlayer ? profile.openingSafeDistance : profile.safeSpawnDistance;
      for (let i = 0; i < 12; i += 1) {
        const candidateSide = i === 0 ? side : Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        if (candidateSide === 0) {
          x = bounds.left + Math.random() * bounds.width;
          y = bounds.top - 18;
        } else if (candidateSide === 1) {
          x = bounds.right + 18;
          y = bounds.top + Math.random() * bounds.height;
        } else if (candidateSide === 2) {
          x = bounds.left + Math.random() * bounds.width;
          y = bounds.bottom + 18;
        } else {
          x = bounds.left - 18;
          y = bounds.top + Math.random() * bounds.height;
        }
        if (distanceSq(x, y, game.player.x, game.player.y) >= minDist * minDist) return { x, y };
      }
      return {
        x: bounds.left + Math.random() * bounds.width,
        y: bounds.top - 18
      };
    }

    pickType(game) {
      const elapsed = game.elapsed;
      const compact = game.difficultyProfile().compact;
      const delay = compact * 10;
      const roll = Math.random();
      if (elapsed < 10 + delay * 0.4) {
        if (roll < 0.68) return "farmer";
        if (roll < 0.86) return "scout";
        return "sword";
      }
      if (elapsed > 18 + delay && roll > 0.975) return "blinkNinja";
      if (elapsed > 30 + delay && roll > 0.92) return "armor";
      if (elapsed > 40 + delay && roll > 0.86) return "brute";
      if (elapsed > 30 + delay && roll > 0.78) return "monk";
      if (elapsed > 22 + delay && roll > 0.66) return "shield";
      if (elapsed > 26 + delay && roll > 0.62) return "archer";
      if (roll < 0.38) return "farmer";
      if (roll < 0.58) return "scout";
      if (roll < 0.76) return "spear";
      return "sword";
    }
  }

  class ExperienceOrb {
    constructor(x, y, value) {
      this.x = x;
      this.y = y;
      this.value = value;
      this.radius = 3;
      this.absorbed = false;
    }

    update(dt, game) {
      const player = game.player;
      const distSq = distanceSq(this.x, this.y, player.x, player.y);
      if (this.absorbed || distSq < 120 * 120) {
        const dir = normalized(player.x - this.x, player.y - this.y);
        const speed = this.absorbed ? player.attributes.absorbSpeed() : distSq < 22 * 22 ? 420 : 190;
        this.x += dir.x * speed * dt;
        this.y += dir.y * speed * dt;
      }
      const collectRange = player.radius + 8;
      if (distSq < collectRange * collectRange) {
        if (this.absorbed) game.sfx.queueAbsorb(1, player.attributes.get("absorb"));
        else game.sfx.queueXp();
        game.effectManager.xp(this.x, this.y, game.xp / game.xpToNext);
        game.effects.push({
          type: "pickupPop",
          x: this.x,
          y: this.y - 8,
          life: 0.42,
          maxLife: 0.42,
          text: `+${this.value}`,
          kind: "xp"
        });
        game.runStats.xpOrbs += 1;
        game.gainXp(this.value);
        return true;
      }
      return false;
    }

    draw(ctx) {
      const x = Math.round(this.x);
      const y = Math.round(this.y);
      const pulse = Math.floor(performance.now() / 360) % 2 === 0;
      drawExperienceOrbGlyph(ctx, x, y, pulse);
    }
  }

  class Item {
    constructor(kind, x, y) {
      this.kind = kind;
      this.x = x;
      this.y = y;
      this.radius = ELEMENT_ITEMS.includes(kind) || CONSUMABLE_ITEMS.includes(kind) ? 15 : 7;
      this.absorbed = false;
    }

    update(dt, game) {
      const player = game.player;
      const distSq = distanceSq(this.x, this.y, player.x, player.y);
      if (this.absorbed || distSq < 58 * 58) {
        const dir = normalized(player.x - this.x, player.y - this.y);
        const speed = this.absorbed ? player.attributes.absorbSpeed() : 110;
        this.x += dir.x * speed * dt;
        this.y += dir.y * speed * dt;
      }
      const collectRange = player.radius + this.radius;
      if (distSq < collectRange * collectRange) {
        let attributeGain = null;
        if (this.kind === "heal") player.heal(22);
        if (this.kind === "speed") player.addSpeed();
        if (ELEMENT_ITEMS.includes(this.kind)) {
          attributeGain = player.addElement(this.kind, game);
          game.effectManager.attributeHit(this.kind, this.x, this.y, normalized(player.x - this.x, player.y - this.y), player.attributes.get(this.kind));
        }
        if (CONSUMABLE_ITEMS.includes(this.kind)) game.activateConsumable(this.kind);
        game.runStats.items += 1;
        if (CONSUMABLE_ITEMS.includes(this.kind)) game.runStats.consumables += 1;
        if (this.absorbed) game.sfx.queueAbsorb(1, player.attributes.get("absorb"));
        else game.sfx.item();
        if (!CONSUMABLE_ITEMS.includes(this.kind) && (!attributeGain || !attributeGain.milestone)) {
          game.notice = itemNotice(this.kind);
          game.noticeTimer = 1.2;
        }
        game.effects.push({
          type: "pickupPop",
          x: this.x,
          y: this.y - this.radius - 6,
          life: 0.72,
          maxLife: 0.72,
          text: itemNotice(this.kind),
          kind: this.kind
        });
        return true;
      }
      return false;
    }

    draw(ctx) {
      const x = Math.round(this.x);
      const y = Math.round(this.y);
      const pulse = Math.floor(performance.now() / 300) % 2 === 0;
      if (ELEMENT_ITEMS.includes(this.kind)) {
        ctx.fillStyle = attributeColor(this.kind, "main");
        rect(ctx, x - 12, y - 12, 24, 2);
        rect(ctx, x - 12, y + 10, 24, 2);
        rect(ctx, x - 12, y - 12, 2, 24);
        rect(ctx, x + 10, y - 12, 2, 24);
        if (Math.floor(performance.now() / 260) % 2 === 0) {
          rect(ctx, x - 16, y, 4, 2);
          rect(ctx, x + 12, y, 4, 2);
          rect(ctx, x, y - 16, 2, 4);
          rect(ctx, x, y + 12, 2, 4);
        }
        drawAttributeGlyph(ctx, this.kind, x, y, 1.05, 1);
        return;
      }
      if (this.kind === "heal") {
        drawHealDropGlyph(ctx, x, y);
      } else if (this.kind === "speed") {
        drawSpeedDropGlyph(ctx, x, y);
      } else if (this.kind === "collectAllExp") {
        drawCollectAllExpDropGlyph(ctx, x, y, pulse);
      } else if (this.kind === "damageAllEnemies") {
        drawDamageAllEnemiesDropGlyph(ctx, x, y, pulse);
      }
    }
  }

  class UI {
    draw(ctx, game) {
      game.uiHitZones = [];
      ctx.textBaseline = "top";
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, game.width, UI_HEIGHT);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, 0, UI_HEIGHT - 2, game.width, 2);
      if (game.width < 560) {
        const minStatW = game.width < 340 ? 104 : 128;
        const mobileRightPad = game.width < 430 ? 34 : 22;
        const maxAttrW = 106;
        const attrW = clamp(game.width - minStatW - mobileRightPad - 24, 88, maxAttrW);
        const attrX = Math.max(8, game.width - attrW - mobileRightPad);
        const statW = clamp(attrX - 24, 96, 220);
        this.drawHp(ctx, game, 16, 14, statW, 20);
        this.drawObjectiveCompact(ctx, game, 16, 42, statW);
        this.drawAttributesCompact(ctx, game, attrX, 12, attrW);
      } else {
        this.drawHp(ctx, game, 16, 14, 220, 20);
        this.drawAttributes(ctx, game, 276, 10);
        if (game.width >= 820) this.drawObjectiveProgress(ctx, game, Math.min(590, game.width - 430), 12, 244, 38);
        this.drawEnemyLevelFaces(ctx, game, game.width - 156, 10, 140);
      }

      if (!game.gameOver && !game.gameCleared) this.drawStartGuide(ctx, game);
      if (!game.gameOver && !game.gameCleared) this.drawKillPulse(ctx, game);
      if (!game.gameOver && !game.gameCleared) this.drawDamagePulse(ctx, game);
      if (game.audioResumeRequired && !game.gameOver && !game.gameCleared) this.drawAudioResumeOverlay(ctx, game);
      const guideVisible = game.guideTimer > 0 && !game.guideDismissed;
      if (game.noticeTimer > 0 && !guideVisible && !game.gameOver && !game.gameCleared) this.drawNoticeToast(ctx, game);

      if (game.gameOver) {
        this.drawGameOver(ctx, game);
      }
      if (game.gameCleared) {
        if (game.showClearResult) this.drawClearScreen(ctx, game);
        else this.drawClearAppreciation(ctx, game);
      }
      if (DEBUG_ATTACK_AREA) {
        ctx.fillStyle = LIGHT_ORANGE;
        ctx.font = "12px Courier New, monospace";
        ctx.fillText(game.sfx.debugState(), 12, UI_HEIGHT + 8);
      }
    }

    drawStartGuide(ctx, game) {
      if (game.guideTimer <= 0 || game.guideDismissed) return;
      const t = clamp(game.guideTimer / game.guideMaxTimer, 0, 1);
      const fade = clamp(t * 2.2, 0, 1);
      const compact = game.width < 560;
      const safeX = compact ? 18 : 42;
      const safeTop = UI_HEIGHT + (compact ? 22 : 34);
      const safeBottom = compact ? 34 : 38;
      const panelW = Math.min(compact ? game.width - safeX * 2 : 760, game.width - safeX * 2);
      const panelH = Math.min(compact ? 300 : 330, game.height - safeTop - safeBottom);
      const x = Math.round((game.width - panelW) / 2);
      const y = Math.round(safeTop);
      ctx.save();
      ctx.globalAlpha = fade;
      this.drawRetroTitleBackdrop(ctx, game, x, y, panelW, panelH, compact);
      this.drawTitleFaceShadow(ctx, game, x, y, panelW, panelH, compact);
      this.drawRetroTitleCopy(ctx, game, x, y, panelW, panelH, compact);
      ctx.restore();
    }

    drawAudioResumeOverlay(ctx, game) {
      const w = Math.min(360, game.width - 48);
      const h = 92;
      const x = Math.round((game.width - w) / 2);
      const y = Math.round(UI_HEIGHT + Math.max(28, game.playArea.height * 0.22));
      ctx.save();
      ctx.fillStyle = BLACK;
      rect(ctx, x, y, w, h);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, w, h, 2);
      ctx.fillStyle = ORANGE;
      ctx.font = "18px Courier New, monospace";
      ctx.fillText("音声再開待ち", x + 24, y + 22);
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.font = "14px Courier New, monospace";
      ctx.fillText("画面をタップ / キー入力", x + 24, y + 56);
      ctx.restore();
    }

    drawRetroTitleBackdrop(ctx, game, x, y, w, h, compact) {
      ctx.globalAlpha *= compact ? 0.96 : 0.98;
      ctx.fillStyle = BLACK;
      rect(ctx, x, y, w, h);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, w, h, compact ? 1 : 2);

      ctx.globalAlpha *= compact ? 0.42 : 0.58;
      for (let yy = y + 8; yy < y + h - 8; yy += 8) {
        rect(ctx, x + 6, yy, w - 12, 1);
      }
      for (let yy = y + 12; yy < y + h - 10; yy += 16) {
        for (let xx = x + 10 + ((yy / 8) % 2) * 8; xx < x + w - 10; xx += 16) {
          rect(ctx, xx, yy, 2, 2);
        }
      }
      ctx.globalAlpha /= compact ? 0.42 : 0.58;
    }

    drawTitleFaceShadow(ctx, game, x, y, w, h, compact) {
      const faceW = compact ? Math.min(230, w * 0.72) : Math.min(410, w * 0.55);
      const faceH = compact ? Math.min(220, h * 0.72) : Math.min(300, h * 0.9);
      const cx = compact ? x + w * 0.52 : x + w * 0.74;
      const cy = y + h * (compact ? 0.46 : 0.5);
      const left = cx - faceW / 2;
      const top = cy - faceH / 2;

      ctx.save();
      ctx.globalAlpha = compact ? 0.28 : 0.48;
      ctx.fillStyle = LIGHT_ORANGE;
      this.fillPixelPolygon(ctx, [
        [left + faceW * 0.16, top + faceH * 0.16],
        [left + faceW * 0.82, top + faceH * 0.08],
        [left + faceW * 0.95, top + faceH * 0.42],
        [left + faceW * 0.72, top + faceH * 0.9],
        [left + faceW * 0.34, top + faceH * 0.94],
        [left + faceW * 0.08, top + faceH * 0.48]
      ]);

      ctx.globalAlpha = compact ? 0.58 : 0.82;
      ctx.fillStyle = BLACK;
      this.fillPixelPolygon(ctx, [
        [left + faceW * 0.1, top + faceH * 0.15],
        [left + faceW * 0.52, top + faceH * 0.1],
        [left + faceW * 0.42, top + faceH * 0.34],
        [left + faceW * 0.16, top + faceH * 0.37]
      ]);
      this.fillPixelPolygon(ctx, [
        [left + faceW * 0.52, top + faceH * 0.1],
        [left + faceW * 0.9, top + faceH * 0.16],
        [left + faceW * 0.86, top + faceH * 0.38],
        [left + faceW * 0.56, top + faceH * 0.34]
      ]);

      ctx.globalAlpha = compact ? 0.54 : 0.9;
      ctx.fillStyle = TITLE_HOT;
      this.fillPixelPolygon(ctx, [
        [left + faceW * 0.14, top + faceH * 0.36],
        [left + faceW * 0.43, top + faceH * 0.42],
        [left + faceW * 0.4, top + faceH * 0.48],
        [left + faceW * 0.2, top + faceH * 0.48]
      ]);
      this.fillPixelPolygon(ctx, [
        [left + faceW * 0.56, top + faceH * 0.42],
        [left + faceW * 0.86, top + faceH * 0.36],
        [left + faceW * 0.78, top + faceH * 0.5],
        [left + faceW * 0.6, top + faceH * 0.49]
      ]);

      ctx.globalAlpha = compact ? 0.3 : 0.56;
      ctx.fillStyle = TITLE_LIGHT;
      thickLinePixels(ctx, left + faceW * 0.28, top + faceH * 0.66, left + faceW * 0.72, top + faceH * 0.62, compact ? 3 : 5);
      thickLinePixels(ctx, left + faceW * 0.36, top + faceH * 0.76, left + faceW * 0.66, top + faceH * 0.78, compact ? 2 : 4);
      ctx.fillStyle = BLACK;
      thickLinePixels(ctx, left + faceW * 0.5, top + faceH * 0.46, left + faceW * 0.48, top + faceH * 0.64, compact ? 4 : 7);

      ctx.globalAlpha = compact ? 0.2 : 0.34;
      ctx.fillStyle = ORANGE;
      for (let i = 0; i < 9; i += 1) {
        const yy = top + faceH * (0.22 + i * 0.07);
        const xx = left + faceW * (0.12 + (i % 3) * 0.05);
        rect(ctx, xx, yy, faceW * 0.76, 2);
      }
      ctx.restore();
    }

    drawRetroTitleCopy(ctx, game, x, y, w, h, compact) {
      const lines = compact
        ? ["てめぇらの血は、", "何色だぁ", "ああああああ"]
        : ["てめぇらの血は、", "何色だぁああああああ"];
      const fontSize = compact ? Math.max(25, Math.min(36, Math.floor(w / 11))) : Math.max(42, Math.min(66, Math.floor(w / 11.5)));
      const lineH = Math.round(fontSize * (compact ? 1.06 : 1.0));
      const titleX = x + (compact ? 22 : 36);
      const titleY = y + (compact ? 34 : 44);
      ctx.textBaseline = "top";
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const yy = titleY + i * lineH;
        const skew = compact ? 0 : i === 0 ? -5 : 4;
        ctx.font = `700 ${fontSize}px Courier New, monospace`;
        ctx.fillStyle = BLACK;
        ctx.fillText(line, titleX + 5 + skew, yy + 5);
        ctx.fillStyle = TITLE_HOT;
        ctx.fillText(line, titleX + 2 + skew, yy + 2);
        ctx.fillStyle = i === 1 && !compact ? TITLE_LIGHT : ORANGE;
        ctx.fillText(line, titleX + skew, yy);
        if (!compact) {
          ctx.fillStyle = TITLE_HOT;
          rect(ctx, titleX + skew, yy + fontSize - 3, Math.min(w - 80, ctx.measureText(line).width), 3);
        }
      }

      const subY = titleY + lines.length * lineH + (compact ? 18 : 24);
      ctx.font = `${compact ? 14 : 16}px Courier New, monospace`;
      ctx.fillStyle = TITLE_LIGHT;
      ctx.fillText("斬って 血紋を 完成させろ", titleX, subY);
      ctx.fillStyle = ORANGE;
      ctx.fillText(compact ? "タップで斬り込む" : "CLICK / TAP で斬り込む", titleX, subY + (compact ? 24 : 28));

      const buttonW = compact ? Math.min(w - 44, 260) : 340;
      const buttonH = compact ? 46 : 50;
      const buttonX = compact ? x + 22 : titleX;
      const buttonY = Math.min(y + h - buttonH - 22, subY + (compact ? 56 : 64));
      ctx.fillStyle = BLACK;
      rect(ctx, buttonX, buttonY, buttonW, buttonH);
      ctx.fillStyle = Math.floor(performance.now() / 220) % 2 === 0 ? ORANGE : TITLE_HOT;
      this.drawFrame(ctx, buttonX, buttonY, buttonW, buttonH, 2);
      ctx.font = `${compact ? 16 : 18}px Courier New, monospace`;
      ctx.fillStyle = TITLE_LIGHT;
      ctx.fillText("START", buttonX + 22, buttonY + 14);
      ctx.fillStyle = compact ? ORANGE : LIGHT_ORANGE;
      ctx.fillText(compact ? "斬り込む" : "自動回転する刀で敵を巻き込む", buttonX + (compact ? 100 : 104), buttonY + 15);

      if (!compact) {
        ctx.fillStyle = LIGHT_ORANGE;
        ctx.font = "14px Courier New, monospace";
        ctx.fillText("WASD / 矢印: 移動", buttonX + buttonW + 28, buttonY + 16);
      }
    }

    fillPixelPolygon(ctx, points) {
      ctx.beginPath();
      ctx.moveTo(Math.round(points[0][0]), Math.round(points[0][1]));
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(Math.round(points[i][0]), Math.round(points[i][1]));
      }
      ctx.closePath();
      ctx.fill();
    }

    drawNoticeToast(ctx, game) {
      const text = game.notice;
      ctx.font = "16px Courier New, monospace";
      const w = Math.min(game.width - 32, Math.max(170, ctx.measureText(text).width + 34));
      const x = Math.round(game.width - w - 18);
      const y = UI_HEIGHT + 12;
      ctx.fillStyle = BLACK;
      rect(ctx, x, y, w, 34);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, w, 34, 1);
      ctx.fillStyle = ORANGE;
      ctx.fillText(text, x + 16, y + 9);
    }

    drawKillPulse(ctx, game) {
      if (game.killPulse <= 0) return;
      const t = clamp(game.killPulse / 0.45, 0, 1);
      const pad = Math.round((1 - t) * 18);
      ctx.fillStyle = t > 0.45 ? ORANGE : LIGHT_ORANGE;
      rect(ctx, 10 + pad, UI_HEIGHT + 10 + pad, 42, 2);
      rect(ctx, 10 + pad, UI_HEIGHT + 10 + pad, 2, 42);
      rect(ctx, game.width - 52 - pad, UI_HEIGHT + 10 + pad, 42, 2);
      rect(ctx, game.width - 12 - pad, UI_HEIGHT + 10 + pad, 2, 42);
      rect(ctx, 10 + pad, game.height - 12 - pad, 42, 2);
      rect(ctx, 10 + pad, game.height - 52 - pad, 2, 42);
      rect(ctx, game.width - 52 - pad, game.height - 12 - pad, 42, 2);
      rect(ctx, game.width - 12 - pad, game.height - 52 - pad, 2, 42);
    }

    drawDamagePulse(ctx, game) {
      if (game.playerDamagePulse <= 0) return;
      const t = clamp(game.playerDamagePulse / 0.42, 0, 1);
      const inset = Math.round((1 - t) * 12);
      ctx.fillStyle = t > 0.42 ? BLOOD_BRIGHT : ORANGE;
      rect(ctx, inset, UI_HEIGHT + inset, game.width - inset * 2, 3);
      rect(ctx, inset, game.height - inset - 3, game.width - inset * 2, 3);
      rect(ctx, inset, UI_HEIGHT + inset, 3, game.height - UI_HEIGHT - inset * 2);
      rect(ctx, game.width - inset - 3, UI_HEIGHT + inset, 3, game.height - UI_HEIGHT - inset * 2);
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.font = "15px Courier New, monospace";
      ctx.fillText("被弾", Math.max(18, game.player.x - 18), Math.max(UI_HEIGHT + 14, game.player.y - 40));
      ctx.fillStyle = ORANGE;
      const cx = Math.round(game.player.x);
      const cy = Math.round(game.player.y);
      const r = 18 + (1 - t) * 18;
      linePixels(ctx, cx - r, cy - r, cx + r, cy + r);
      linePixels(ctx, cx - r, cy + r, cx + r, cy - r);
    }

    drawObjectiveProgress(ctx, game, x, y, w, h) {
      const progress = game.bloodGoal ? clamp(game.bloodGoal.progress(), 0, 1) : 0;
      const activePulse = game.objectivePulse > 0;
      ctx.fillStyle = activePulse ? ORANGE : LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, w, h, activePulse || progress >= 0.85 ? 2 : 1);
      ctx.font = "13px Courier New, monospace";
      ctx.fillStyle = ORANGE;
      const progressText = progress > 0 && progress < 0.01 ? "<1" : String(Math.floor(progress * 100));
      ctx.fillText(`血紋 ${progressText}%`, x + 10, y + 6);
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.fillText(`斬 ${game.runStats.kills}`, x + w - 64, y + 6);
      const barX = x + 10;
      const barY = y + 25;
      const barW = w - 20;
      rect(ctx, barX, barY, barW, 2);
      rect(ctx, barX, barY + 6, barW, 2);
      ctx.fillStyle = activePulse || (progress >= 0.85 && Math.floor(performance.now() / 180) % 2 === 0) ? BLOOD_BRIGHT : BLOOD;
      rect(ctx, barX, barY + 2, Math.max(2, Math.round(barW * progress)), 4);
    }

    drawObjectiveCompact(ctx, game, x, y, w) {
      const progress = game.bloodGoal ? clamp(game.bloodGoal.progress(), 0, 1) : 0;
      const activePulse = game.objectivePulse > 0;
      const progressText = progress > 0 && progress < 0.01 ? "<1" : String(Math.floor(progress * 100));
      ctx.font = "12px Courier New, monospace";
      ctx.fillStyle = ORANGE;
      ctx.fillText(`血紋 ${progressText}%`, x, y - 2);
      ctx.fillStyle = activePulse ? ORANGE : LIGHT_ORANGE;
      ctx.fillText(`斬 ${game.runStats.kills}`, x + w - 44, y - 2);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x, y + 13, w, 2);
      rect(ctx, x, y + 17, w, 1);
      ctx.fillStyle = activePulse || progress >= 0.85 ? BLOOD_BRIGHT : ORANGE;
      rect(ctx, x, y + 14, Math.max(3, Math.round(w * progress)), 3);
    }

    drawClearAppreciation(ctx, game) {
      const t = game.clearTimer;
      const pulse = 0.5 + Math.sin(t * 5) * 0.5;
      const compact = game.width < 560;
      const safeBottom = compact ? 92 : 42;
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = BLACK;
      rect(ctx, 0, UI_HEIGHT, game.width, game.height - UI_HEIGHT);
      ctx.restore();
      const frameW = Math.min(compact ? game.width - 44 : 560, game.width - 44);
      const frameH = Math.min(compact ? 360 : 420, game.height - UI_HEIGHT - safeBottom - 44);
      const frameX = Math.round((game.width - frameW) / 2);
      const frameY = Math.round(UI_HEIGHT + Math.max(18, (game.height - UI_HEIGHT - safeBottom - frameH) / 2));
      ctx.fillStyle = pulse > 0.62 ? BLOOD_WET : BLOOD_DARK;
      this.drawFrame(ctx, frameX, frameY, frameW, frameH, 2);
      ctx.fillStyle = BLOOD_DARK;
      rect(ctx, frameX + 12, frameY + 12, frameW - 24, 2);
      rect(ctx, frameX + 12, frameY + frameH - 14, frameW - 24, 2);
      rect(ctx, frameX + 12, frameY + 12, 2, frameH - 24);
      rect(ctx, frameX + frameW - 14, frameY + 12, 2, frameH - 24);
      ctx.save();
      ctx.globalAlpha = 0.82 + pulse * 0.18;
      game.bloodGoal.drawCenteredArtwork(ctx, frameX + 22, frameY + 22, frameW - 44, frameH - 44, t);
      ctx.restore();
      ctx.fillStyle = BLACK;
      rect(ctx, game.width / 2 - 146, UI_HEIGHT + 22, 292, 104);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, game.width / 2 - 146, UI_HEIGHT + 22, 292, 104, 1);
      ctx.fillStyle = pulse > 0.45 ? BLOOD_BRIGHT : BLOOD_WET;
      ctx.font = "30px Courier New, monospace";
      ctx.fillText("血紋完成", game.width / 2 - 82, UI_HEIGHT + 34);
      ctx.font = "16px Courier New, monospace";
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.fillText(`完成作品: ${game.bloodGoal.displayName()}`, game.width / 2 - 116, UI_HEIGHT + 74);
      if (game.clearChoiceVisible) {
        const boxW = compact ? Math.min(300, game.width - 52) : 240;
        const boxH = compact ? 88 : 76;
        const x = Math.round(game.width / 2 - boxW / 2);
        const desiredY = compact ? UI_HEIGHT + Math.floor((game.height - UI_HEIGHT) * 0.7) : game.height - boxH - safeBottom;
        const y = Math.round(clamp(desiredY, UI_HEIGHT + 150, game.height - boxH - safeBottom));
        ctx.fillStyle = BLACK;
        rect(ctx, x, y, boxW, boxH);
        ctx.fillStyle = LIGHT_ORANGE;
        this.drawFrame(ctx, x, y, boxW, boxH, 1);
        const choices = ["次の血紋へ", "結果を見る"];
        ctx.font = `${compact ? 17 : 16}px Courier New, monospace`;
        for (let i = 0; i < choices.length; i += 1) {
          const rowGap = compact ? 34 : 28;
          const choiceRect = { x: x + 18, y: y + 12 + i * rowGap, w: boxW - 36, h: compact ? 30 : 26 };
          game.uiHitZones.push({ type: "clearChoice", index: i, ...choiceRect });
          ctx.fillStyle = i === game.clearChoiceIndex ? ORANGE : LIGHT_ORANGE;
          ctx.fillText(`${i === game.clearChoiceIndex ? "▶" : " "} ${choices[i]}`, x + 30, y + 16 + i * rowGap);
        }
      } else if (t > 0.9) {
        ctx.fillStyle = LIGHT_ORANGE;
        ctx.fillText("作品を鑑賞中", game.width / 2 - 56, game.height - safeBottom);
      }
    }

    drawGameOver(ctx, game) {
      const stats = game.runStats;
      const pulse = 0.5 + Math.sin(game.gameOverTimer * 7) * 0.5;
      const panelW = Math.min(620, game.width - 48);
      const compactByWidth = panelW < 430;
      const safeBottom = compactByWidth ? 90 : 38;
      const panelH = Math.min(compactByWidth ? 334 : 360, game.height - UI_HEIGHT - safeBottom - 18);
      const compact = compactByWidth;
      const x = Math.round((game.width - panelW) / 2);
      const y = Math.round(UI_HEIGHT + Math.max(18, (game.height - UI_HEIGHT - safeBottom - panelH) / 2));
      ctx.fillStyle = BLACK;
      rect(ctx, 0, UI_HEIGHT, game.width, game.height - UI_HEIGHT);
      ctx.fillStyle = pulse > 0.62 ? BLOOD_DARK : LIGHT_ORANGE;
      for (let yLine = UI_HEIGHT + 18; yLine < game.height; yLine += 28) {
        rect(ctx, 0, yLine, game.width, 1);
      }
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, panelW, panelH, 2);
      ctx.fillStyle = pulse > 0.58 ? BLOOD_BRIGHT : ORANGE;
      ctx.font = `${compact ? 24 : 30}px Courier New, monospace`;
      ctx.fillText("ゲームオーバー", x + 34, y + 26);
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.font = `${compact ? 13 : 16}px Courier New, monospace`;
      ctx.fillText(compact ? "血紋は未完成" : "血紋は未完成のまま闇に沈んだ", x + 34, y + 66);
      const lines = compact ? [
        `生存 ${Math.floor(game.elapsed)}秒`,
        `撃破 ${stats.kills}`,
        `完成率 ${Math.floor(game.bloodGoal.progress() * 100)}%`,
        `敵勢 ${this.enemyDisplayLevel(game)}`,
        `最大連斬 ${stats.maxCombo}`,
        `会心 ${stats.criticalHits}`,
        `経験玉 ${stats.xpOrbs}`,
        `作品 ${game.bloodGoal.displayName()}`
      ] : [
        `生存時間: ${Math.floor(game.elapsed)}秒`,
        `撃破数: ${stats.kills}`,
        `総与ダメージ: ${stats.totalDamage}`,
        `未完成作品: ${game.bloodGoal.displayName()}`,
        `完成率: ${Math.floor(game.bloodGoal.progress() * 100)}%`,
        `敵勢: ${this.enemyDisplayLevel(game)}相当`,
        `連斬血量: ${stats.comboBloodBonus}`,
        `会心回数: ${stats.criticalHits}`,
        `最大連斬: ${stats.maxCombo}`,
        `経験玉回収: ${stats.xpOrbs}`
      ];
      ctx.fillStyle = ORANGE;
      ctx.font = `${compact ? 13 : 15}px Courier New, monospace`;
      const lineTop = compact ? 100 : 108;
      const lineGap = compact ? 19 : 22;
      for (let i = 0; i < lines.length; i += 1) ctx.fillText(lines[i], x + 38, y + lineTop + i * lineGap);
      const retryY = Math.min(y + panelH - (compact ? 100 : 58), game.height - safeBottom - (compact ? 92 : 48));
      const buttonGap = compact ? 10 : 16;
      const buttonH = compact ? 38 : 40;
      const normalW = compact ? Math.min(250, panelW - 64) : Math.min(178, Math.floor((panelW - 92) / 2));
      const strongW = compact ? Math.min(250, panelW - 64) : Math.min(260, Math.floor((panelW - 92) / 2));
      const totalW = compact ? Math.max(normalW, strongW) : normalW + strongW + buttonGap;
      const startX = Math.round(x + (panelW - totalW) / 2);
      const normalRect = { x: compact ? Math.round(x + (panelW - normalW) / 2) : startX, y: retryY, w: normalW, h: buttonH };
      const strongRect = {
        x: compact ? Math.round(x + (panelW - strongW) / 2) : startX + normalW + buttonGap,
        y: compact ? retryY + buttonH + buttonGap : retryY,
        w: strongW,
        h: buttonH
      };
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, normalRect.x, normalRect.y, normalRect.w, normalRect.h, 1);
      this.drawFrame(ctx, strongRect.x, strongRect.y, strongRect.w, strongRect.h, 1);
      ctx.fillStyle = ORANGE;
      ctx.font = game.width < 520 ? "13px Courier New, monospace" : "15px Courier New, monospace";
      ctx.fillText("再挑戦 R", normalRect.x + Math.max(14, Math.floor((normalRect.w - 72) / 2)), normalRect.y + 12);
      ctx.fillText("強くてニューゲーム Enter", strongRect.x + Math.max(12, Math.floor((strongRect.w - 184) / 2)), strongRect.y + 12);
      if (!compact) {
        ctx.fillStyle = LIGHT_ORANGE;
        ctx.font = "13px Courier New, monospace";
        ctx.fillText("もう一度、血紋を完成させろ", x + 36, y + panelH - 20);
      }
      game.uiHitZones.push({ type: "retry", x: normalRect.x - 8, y: normalRect.y - 8, w: normalRect.w + 16, h: normalRect.h + 16 });
      game.uiHitZones.push({ type: "strongRetry", x: strongRect.x - 8, y: strongRect.y - 8, w: strongRect.w + 16, h: strongRect.h + 16 });
    }

    drawClearScreen(ctx, game) {
      const stats = game.runStats;
      const player = game.player;
      const attrs = player.attributes;
      const panelW = Math.min(760, game.width - 48);
      const panelH = Math.min(430, game.height - 88);
      const x = Math.round((game.width - panelW) / 2);
      const y = Math.round((game.height - panelH) / 2);
      ctx.fillStyle = BLACK;
      rect(ctx, x, y, panelW, panelH);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, panelW, panelH, 2);
      ctx.fillStyle = ORANGE;
      ctx.font = "28px Courier New, monospace";
      ctx.fillText("血紋完成", x + 28, y + 22);
      ctx.font = "16px Courier New, monospace";
      ctx.fillText(`完成作品: ${game.bloodGoal.displayName()}`, x + 30, y + 62);
      ctx.fillText("Rで再挑戦", x + panelW - 120, y + 28);
      game.uiHitZones.push({ type: "retry", x: x + panelW - 132, y: y + 18, w: 124, h: 34 });
      game.bloodGoal.drawPreview(ctx, x + panelW - 150, y + 58, 4);

      const left = x + 34;
      const mid = x + Math.floor(panelW * 0.38);
      const right = x + Math.floor(panelW * 0.66);
      const top = y + 104;
      this.drawResultSection(ctx, "戦果", [
        `経過秒: ${Math.floor(stats.clearTime || game.elapsed)}`,
        `完成作品数: ${stats.completedShapes.length}`,
        `最後の作品: ${stats.completedShapes[stats.completedShapes.length - 1] || game.bloodGoal.displayName()}`,
        `敵勢: ${this.enemyDisplayLevel(game)}相当`,
        `到達レベル: ${game.level}`,
        `経験値: ${game.xp}/${game.xpToNext}`,
        `撃破数: ${stats.kills}`,
        `総与ダメージ: ${stats.totalDamage}`,
        `最大連斬: ${stats.maxCombo}`,
        `中ボス撃破: ${stats.midBossKills}`,
        `大ボス撃破: ${stats.bossKills}`
      ], left, top);
      this.drawResultSection(ctx, "能力", [
        `最大体力: ${Math.round(player.maxHp)}`,
        `残り体力: ${Math.max(0, Math.round(player.hp))}`,
        `攻撃力: ${player.katanaDamage}`,
        `攻撃速度: ${(1 / player.attackInterval).toFixed(2)}/秒`,
        `移動速度: ${Math.round(player.speed)}`,
        `刀リーチ: ${Math.round(player.katana.range())}`,
        `斬り幅: ${Math.round(player.katana.thickness())}`,
        `会心率: ${Math.round(player.criticalChance * 100)}%`,
        `会心倍率: ${player.criticalMultiplier.toFixed(2)}`
      ], mid, top);
      this.drawResultSection(ctx, "記録", [
        `会心回数: ${stats.criticalHits}`,
        `会心撃破: ${stats.criticalKills}`,
        `経験玉回収: ${stats.xpOrbs}`,
        `アイテム回収: ${stats.items}`,
        `消費発動: ${stats.consumables}`,
        `完成セル: ${game.bloodGoal.completedCount}/${game.bloodGoal.cells.length}`,
        `注入血量: ${game.bloodGoal.totalBlood}`,
        `連斬血量: ${stats.comboBloodBonus}`,
        `会心血量: ${game.bloodGoal.criticalBlood}`,
        `強敵血量: ${game.bloodGoal.bossBlood}`
      ], right, top);

      ctx.fillStyle = LIGHT_ORANGE;
      ctx.fillText("属性", left, y + panelH - 92);
      const ids = ["fire", "ice", "lightning", "wind", "absorb"];
      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i];
        const px = left + i * 72;
        ctx.fillStyle = attributeColor(id, "main");
        drawAttributeGlyph(ctx, id, px + 18, y + panelH - 48, 0.7, attrs.get(id));
        ctx.font = "14px Courier New, monospace";
        ctx.fillText(`${ATTRIBUTE_DEFINITIONS[id].displayName}${attrs.get(id)}`, px + 2, y + panelH - 24);
      }
    }

    drawResultSection(ctx, title, lines, x, y) {
      ctx.fillStyle = LIGHT_ORANGE;
      ctx.font = "15px Courier New, monospace";
      ctx.fillText(title, x, y);
      ctx.fillStyle = ORANGE;
      ctx.font = "14px Courier New, monospace";
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], x, y + 26 + i * 21);
      }
    }

    drawHp(ctx, game, x, y, w, h) {
      const hpRate = clamp(game.player.hp / game.player.maxHp, 0, 1);
      const segments = 18;
      const filled = Math.ceil(hpRate * segments);
      const innerX = x + 4;
      const innerY = y + 5;
      const innerW = w - 8;
      const innerH = h - 10;
      const barRight = innerX + innerW;
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x, y, w, 2);
      rect(ctx, x, y + h - 2, w, 2);
      rect(ctx, x, y, 2, h);
      rect(ctx, x + w - 2, y, 2, h);
      for (let i = 0; i < segments; i += 1) {
        const left = innerX + Math.round((innerW * i) / segments);
        const right = i === segments - 1 ? barRight : innerX + Math.round((innerW * (i + 1)) / segments);
        const sx = left + (i === 0 ? 0 : 1);
        const sw = Math.max(1, right - left - (i === 0 ? 0 : 1));
        ctx.fillStyle = i < filled ? ORANGE : BLACK;
        rect(ctx, sx, innerY, sw, innerH);
        if (i > 0) {
          ctx.fillStyle = LIGHT_ORANGE;
          rect(ctx, left, y + 4, 1, h - 8);
        }
      }
      if (hpRate < 0.28 && Math.floor(performance.now() / 180) % 2 === 0) {
        ctx.fillStyle = ORANGE;
        rect(ctx, x - 4, y - 4, w + 8, 2);
        rect(ctx, x - 4, y + h + 2, w + 8, 2);
      }
    }

    drawEnemyLevelFaces(ctx, game, x, y, w = 140) {
      const enemyLevel = this.enemyDisplayLevel(game);
      const rawFaces = Math.floor(enemyLevel / 10);
      const brutalFaces = Math.floor(rawFaces / 5);
      const smallFaces = Math.min(4, rawFaces % 5);
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, x, y, w, 42, brutalFaces > 0 ? 2 : 1);
      if (rawFaces <= 0) {
        for (let i = 0; i < 4; i += 1) rect(ctx, x + 12 + i * 22, y + 18, 10, 2);
        return;
      }
      let px = x + 18;
      const contentRight = x + w - 14;
      const brutalStep = 30;
      const smallStep = 20;
      const maxBrutal = Math.max(0, Math.min(brutalFaces, Math.floor((contentRight - px - smallFaces * smallStep) / brutalStep)));
      for (let i = 0; i < maxBrutal; i += 1) {
        this.drawMonsterFace(ctx, px, y + 21, true);
        px += brutalStep;
      }
      for (let i = 0; i < smallFaces && px + 10 <= contentRight; i += 1) {
        this.drawMonsterFace(ctx, px, y + 21, false);
        px += smallStep;
      }
      const hiddenBrutal = brutalFaces - maxBrutal;
      if (hiddenBrutal > 0) {
        ctx.fillStyle = ORANGE;
        const dots = Math.min(4, hiddenBrutal);
        const dotX = x + w - 22;
        for (let i = 0; i < dots; i += 1) rect(ctx, dotX + i * 5, y + 31, 3, 3);
      }
    }

    enemyDisplayLevel(game) {
      return game.enemyThreatLevel ? game.enemyThreatLevel() : Math.max(0, game.level + Math.floor(game.runStats.kills / 18) + game.continues * 10);
    }

    drawMonsterFace(ctx, x, y, brutal) {
      ctx.fillStyle = ORANGE;
      if (brutal) {
        rect(ctx, x - 9, y - 9, 18, 17);
        rect(ctx, x - 6, y + 8, 12, 4);
        linePixels(ctx, x - 9, y - 9, x - 15, y - 16);
        linePixels(ctx, x + 9, y - 9, x + 15, y - 16);
        rect(ctx, x - 7, y - 3, 4, 3);
        rect(ctx, x + 3, y - 3, 4, 3);
        rect(ctx, x - 4, y + 6, 3, 5);
        rect(ctx, x + 1, y + 6, 3, 5);
        ctx.fillStyle = LIGHT_ORANGE;
        rect(ctx, x - 17, y - 2, 3, 3);
        rect(ctx, x + 14, y - 2, 3, 3);
        return;
      }
      rect(ctx, x - 6, y - 6, 12, 11);
      rect(ctx, x - 3, y + 5, 6, 3);
      rect(ctx, x - 9, y - 9, 4, 4);
      rect(ctx, x + 5, y - 9, 4, 4);
      rect(ctx, x - 4, y - 1, 2, 2);
      rect(ctx, x + 2, y - 1, 2, 2);
      rect(ctx, x - 3, y + 5, 2, 4);
      rect(ctx, x + 1, y + 5, 2, 4);
    }

    drawAttributes(ctx, game, x, y) {
      const ids = ["fire", "ice", "lightning", "wind", "absorb"];
      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i];
        const level = game.player.attributes.get(id);
        const px = x + i * 58;
        ctx.fillStyle = LIGHT_ORANGE;
        this.drawFrame(ctx, px, y, 42, 42, level >= 10 ? 2 : 1);
        const color = level > 0 ? attributeColor(id, "main") : LIGHT_ORANGE;
        ctx.fillStyle = color;
        drawAttributeGlyph(ctx, id, px + 21, y + 18, 0.82, level);
        this.drawAttributePips(ctx, px + 7, y + 32, level, color);
        if (level >= 20 && Math.floor(performance.now() / 220) % 2 === 0) {
          rect(ctx, px + 5, y + 5, 6, 2);
          rect(ctx, px + 31, y + 35, 6, 2);
        }
      }
    }

    drawAttributesCompact(ctx, game, x, y, availableW = 136) {
      const ids = ["fire", "ice", "lightning", "wind", "absorb"];
      const safePad = game.width < 430 ? 28 : 14;
      const maxRight = game.width - safePad;
      const slot = Math.max(17, Math.floor(availableW / ids.length));
      const box = clamp(slot - 2, 15, 24);
      const scale = box <= 16 ? 0.32 : box <= 19 ? 0.38 : box <= 21 ? 0.44 : 0.5;
      const glyphExtent = Math.ceil(16 * scale);
      const visualLeftPad = Math.max(0, glyphExtent - box / 2);
      const visualRightPad = visualLeftPad;
      const groupW = (ids.length - 1) * slot + box + visualLeftPad + visualRightPad;
      const startX = Math.max(safePad + visualLeftPad, Math.min(x, maxRight - groupW + visualLeftPad));
      for (let i = 0; i < ids.length; i += 1) {
        const px = Math.round(startX + i * slot);
        if (px + box / 2 + glyphExtent > maxRight) {
          const clampedX = Math.max(4, maxRight - box);
          if (i !== ids.length - 1) continue;
          this.drawCompactAttributeBox(ctx, game, ids[i], clampedX, y, box, scale);
          break;
        }
        const id = ids[i];
        this.drawCompactAttributeBox(ctx, game, id, px, y, box, scale);
      }
    }

    drawCompactAttributeBox(ctx, game, id, px, y, box, scale) {
      const level = game.player.attributes.get(id);
      const color = level > 0 ? attributeColor(id, "main") : LIGHT_ORANGE;
      ctx.fillStyle = LIGHT_ORANGE;
      this.drawFrame(ctx, px, y, box, 28, level >= 10 && box >= 18 ? 2 : 1);
      ctx.fillStyle = color;
      drawAttributeGlyph(ctx, id, px + box / 2, y + 13, scale, level);
      if (level > 0) {
        const pipX = px + Math.max(3, Math.floor(box * 0.2));
        const pipW = Math.max(2, Math.min(box - (pipX - px) * 2, 2 + level));
        rect(ctx, pipX, y + 23, pipW, 2);
      }
    }

    drawFrame(ctx, x, y, w, h, thickness) {
      rect(ctx, x, y, w, thickness);
      rect(ctx, x, y + h - thickness, w, thickness);
      rect(ctx, x, y, thickness, h);
      rect(ctx, x + w - thickness, y, thickness, h);
      if (thickness > 1) {
        rect(ctx, x + 4, y + 4, w - 8, 1);
        rect(ctx, x + 4, y + h - 5, w - 8, 1);
      }
    }

    drawAttributePips(ctx, x, y, level, color) {
      ctx.fillStyle = LIGHT_ORANGE;
      for (let i = 0; i < 4; i += 1) rect(ctx, x + i * 7, y, 4, 4);
      ctx.fillStyle = color;
      for (let i = 0; i < Math.min(4, level % 5 || (level > 0 ? 4 : 0)); i += 1) rect(ctx, x + i * 7, y, 4, 4);
      const milestone = Math.min(4, Math.floor(level / 5));
      for (let i = 0; i < milestone; i += 1) rect(ctx, x + i * 7, y + 7, 5, 2);
    }

    drawAttributeIcon(ctx, id, x, y, level) {
      drawAttributeGlyph(ctx, id, x, y, 1, level);
    }
  }

  class GameState {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.input = new Input(canvas);
      this.ui = new UI();
      this.sfx = new SfxManager();
      this.installAudioUnlockHandlers();
      this.criticalSystem = new CriticalSystem();
      this.gridLayer = null;
      this.resize();
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) this.markAudioInterrupted();
      });
      window.addEventListener("pageshow", () => this.markAudioInterrupted());
      window.addEventListener("resize", () => this.resize());
      this.reset();
      this.lastTime = performance.now();
      requestAnimationFrame((time) => this.loop(time));
    }

    installAudioUnlockHandlers() {
      const unlockWithChime = (event) => {
        if (event && event.cancelable && event.type === "touchend") event.preventDefault();
        this.sfx.unlock(true, true, event ? event.type : "manual");
        if ((!this.gameStarted && !this.gameOver && !this.gameCleared) || this.audioResumeRequired) {
          this.startRequested = true;
        }
      };
      this.canvas.addEventListener("touchend", unlockWithChime, { capture: true, passive: false });
      this.canvas.addEventListener("click", unlockWithChime, { capture: true, passive: false });
      window.addEventListener("keydown", unlockWithChime, { capture: true, passive: true });
    }

    markAudioInterrupted() {
      if (!this.gameStarted || this.gameOver || this.gameCleared || this.sfx.audioReady()) return;
      this.audioResumeRequired = true;
      this.startRequested = false;
      this.notice = "音声再開待ち";
      this.noticeTimer = 0.8;
    }

    resize() {
      const dpr = RENDER_SCALE;
      const viewport = window.visualViewport;
      const widthCandidates = [window.innerWidth, document.documentElement.clientWidth, viewport?.width]
        .filter((value) => Number.isFinite(value) && value > 0);
      const heightCandidates = [window.innerHeight, document.documentElement.clientHeight, viewport?.height]
        .filter((value) => Number.isFinite(value) && value > 0);
      const cssWidth = Math.floor(Math.min(...widthCandidates));
      const cssHeight = Math.floor(Math.min(...heightCandidates));
      this.canvas.width = Math.floor(cssWidth * dpr);
      this.canvas.height = Math.floor(cssHeight * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
      this.width = cssWidth;
      this.height = cssHeight;
      this.playArea = {
        left: 0,
        top: UI_HEIGHT,
        right: this.width,
        bottom: this.height,
        width: this.width,
        height: Math.max(1, this.height - UI_HEIGHT)
      };
      this.buildGridLayer();
      if (this.bloodGoal) this.bloodGoal.relayout(this.playArea);
    }

    screenToWorld(x, y) {
      return {
        x: clamp(x, this.playArea.left, this.playArea.right),
        y: clamp(y, this.playArea.top, this.playArea.bottom)
      };
    }

    processPointerInput() {
      const tap = this.input.consumePointerDown();
      if (tap) {
        if (!this.gameStarted && !this.gameOver && !this.gameCleared) {
          this.startRequested = true;
          return;
        }
        if (this.handleUiTap(tap.x, tap.y)) return;
        if (!this.gameOver && !this.gameCleared && tap.y >= this.playArea.top) {
          this.targetMovePoint = this.screenToWorld(tap.x, tap.y);
          this.guideDismissed = true;
        }
      }
      const pointer = this.input.currentPointerPoint();
      if (!this.gameStarted && !this.gameOver && !this.gameCleared) return;
      if (pointer && pointer.down && !this.gameOver && !this.gameCleared && pointer.y >= this.playArea.top) {
        this.targetMovePoint = this.screenToWorld(pointer.x, pointer.y);
        this.guideDismissed = true;
      }
    }

    unlockAudioFromKeyboard() {
      if (this.input.hasMovementKeys() || this.input.pressed("enter") || this.input.pressed(" ") || this.input.pressed("r")) {
        if ((!this.gameStarted && !this.gameOver && !this.gameCleared) || this.audioResumeRequired) this.startRequested = true;
        if (this.sfx.audioReady()) return;
        this.sfx.unlock(true, true, "keydown");
      }
    }

    tryStartAfterAudioUnlock() {
      if (this.audioResumeRequired) {
        if (!this.startRequested || !this.sfx.audioReady()) return;
        this.audioResumeRequired = false;
        this.startRequested = false;
        this.notice = "音声再開";
        this.noticeTimer = 1.0;
        this.input.clear();
        return;
      }
      if (this.gameStarted || this.gameOver || this.gameCleared || !this.startRequested) return;
      if (!this.sfx.audioReady()) return;
      this.gameStarted = true;
      this.startRequested = false;
      this.guideDismissed = true;
      this.guideTimer = 0;
      this.startGrace = Math.max(this.startGrace, 2.2);
      this.notice = "斬り込め";
      this.noticeTimer = 1.2;
      this.input.clear();
    }

    handleUiTap(x, y) {
      if (!this.uiHitZones) return false;
      for (const zone of this.uiHitZones) {
        if (x < zone.x || x > zone.x + zone.w || y < zone.y || y > zone.y + zone.h) continue;
        if (zone.type === "clearChoice") {
          this.clearChoiceIndex = zone.index;
          if (zone.index === 0) this.continueToNextShape();
          else this.showClearResult = true;
          this.clearChoiceCooldown = 0.25;
          this.input.clear();
          return true;
        }
        if (zone.type === "retry") {
          this.reset();
          return true;
        }
        if (zone.type === "strongRetry") {
          this.startStrongNewGame();
          return true;
        }
      }
      return false;
    }

    movementAxisForPlayer() {
      const keyboardAxis = this.input.axis();
      if (this.input.hasMovementKeys()) {
        this.targetMovePoint = null;
        this.guideDismissed = true;
        return keyboardAxis;
      }
      if (!this.targetMovePoint) return { x: 0, y: 0 };
      const dx = this.targetMovePoint.x - this.player.x;
      const dy = this.targetMovePoint.y - this.player.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 36) {
        this.targetMovePoint = null;
        return { x: 0, y: 0 };
      }
      return normalized(dx, dy);
    }

    buildGridLayer() {
      const layer = document.createElement("canvas");
      layer.width = Math.max(1, Math.ceil(this.playArea.width));
      layer.height = Math.max(1, Math.ceil(this.playArea.height));
      const ctx = layer.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = LIGHT_ORANGE;
      const offsetX = ((Math.floor(this.playArea.left) % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
      const offsetY = ((Math.floor(this.playArea.top) % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
      for (let x = -offsetX; x < layer.width; x += GRID_SIZE) rect(ctx, x, 0, 1, layer.height);
      for (let y = -offsetY; y < layer.height; y += GRID_SIZE) rect(ctx, 0, y, layer.width, 1);
      this.gridLayer = layer;
    }

    reset() {
      this.input.clear();
      this.player = new Player(this.playArea.left + this.playArea.width / 2, this.playArea.top + this.playArea.height / 2);
      this.applyDeviceComfort();
      this.spawner = new EnemySpawner();
      this.spawner.bossTimer = 24 + this.difficultyProfile().bossDelay;
      this.dropManager = new DropManager(this);
      this.enemies = [];
      this.enemyGrid = new SpatialGrid(96);
      this.orbs = [];
      this.items = [];
      this.collectibleGrid = new SpatialGrid(96);
      this.effects = [];
      this.bossAttacks = [];
      this.effectManager = new EffectManager();
      this.bloodGoal = new BloodCanvasGoal(this.playArea);
      this.bloodManager = new BloodManager();
      this.screenShake = new ScreenShake();
      this.combo = new ComboManager();
      this.tornadoes = [];
      this.hitStop = 0;
      this.level = 1;
      this.xp = 0;
      this.xpToNext = calculateXpToNext(this.level);
      this.attributePity = 0;
      this.attributeHistory = [];
      this.nextLevelBossLevel = 10;
      this.elapsed = 0;
      this.notice = "移動: WASD / 矢印";
      this.noticeTimer = 3;
      this.guideMaxTimer = 6;
      this.gameStarted = !!(this.sfx && this.sfx.audioReady());
      this.guideTimer = this.gameStarted ? 0 : this.guideMaxTimer;
      this.guideDismissed = this.gameStarted;
      this.startRequested = false;
      this.startGrace = 2.2;
      this.damageInvuln = 0;
      this.killPulse = 0;
      this.playerDamagePulse = 0;
      this.objectivePulse = 0;
      this.lastAbsorbCandidates = 0;
      this.targetMovePoint = null;
      this.uiHitZones = [];
      this.runStats = {
        kills: 0,
        criticalHits: 0,
        criticalKills: 0,
        totalDamage: 0,
        maxCombo: 0,
        bossKills: 0,
        midBossKills: 0,
        xpOrbs: 0,
        items: 0,
        consumables: 0,
        clearTime: 0,
        completedShapes: [],
        comboBloodBonus: 0
      };
      this.continues = 0;
      this.gameOver = false;
      this.gameOverTimer = 0;
      this.gameOverDroneTimer = 0;
      this.gameCleared = false;
      this.audioResumeRequired = false;
      this.clearPulse = 0;
      this.clearTimer = 0;
      this.showClearResult = false;
      this.clearChoiceVisible = false;
      this.clearChoiceIndex = 0;
      this.clearChoiceCooldown = 0;
    }

    createPowerSnapshot() {
      const p = this.player;
      return {
        level: this.level,
        xp: this.xp,
        xpToNext: this.xpToNext,
        attributePity: this.attributePity,
        attributeHistory: [...this.attributeHistory],
        nextLevelBossLevel: this.nextLevelBossLevel,
        player: {
          maxHp: p.maxHp,
          speed: p.speed,
          katanaDamage: p.katanaDamage,
          knockbackPower: p.knockbackPower,
          criticalChance: p.criticalChance,
          criticalMultiplier: p.criticalMultiplier,
          criticalKnockbackMultiplier: p.criticalKnockbackMultiplier,
          criticalDismemberChanceBonus: p.criticalDismemberChanceBonus,
          attackInterval: p.attackInterval,
          attributes: { ...p.attributes.levels },
          katana: {
            horizontalPixels: p.katana.horizontalPixels,
            verticalPixels: p.katana.verticalPixels,
            pierceLimit: p.katana.pierceLimit
          }
        }
      };
    }

    restorePowerSnapshot(snapshot) {
      if (!snapshot || !snapshot.player) return;
      const p = this.player;
      this.level = Math.max(1, snapshot.level || 1);
      this.xp = Math.max(0, snapshot.xp || 0);
      this.xpToNext = snapshot.xpToNext || calculateXpToNext(this.level);
      this.attributePity = snapshot.attributePity || 0;
      this.attributeHistory = Array.isArray(snapshot.attributeHistory) ? [...snapshot.attributeHistory] : [];
      this.nextLevelBossLevel = Math.max(snapshot.nextLevelBossLevel || 10, Math.ceil(this.level / 10) * 10);

      p.maxHp = snapshot.player.maxHp || p.maxHp;
      p.hp = p.maxHp;
      p.speed = snapshot.player.speed || p.speed;
      p.katanaDamage = snapshot.player.katanaDamage || p.katanaDamage;
      p.knockbackPower = snapshot.player.knockbackPower || p.knockbackPower;
      p.criticalChance = snapshot.player.criticalChance || p.criticalChance;
      p.criticalMultiplier = snapshot.player.criticalMultiplier || p.criticalMultiplier;
      p.criticalKnockbackMultiplier = snapshot.player.criticalKnockbackMultiplier || p.criticalKnockbackMultiplier;
      p.criticalDismemberChanceBonus = snapshot.player.criticalDismemberChanceBonus || p.criticalDismemberChanceBonus;
      p.attackInterval = snapshot.player.attackInterval || p.attackInterval;
      for (const id of ELEMENT_ITEMS) p.attributes.levels[id] = Math.max(0, snapshot.player.attributes[id] || 0);
      p.elements = p.attributes.levels;
      p.katana.horizontalPixels = snapshot.player.katana.horizontalPixels || p.katana.horizontalPixels;
      p.katana.verticalPixels = snapshot.player.katana.verticalPixels || p.katana.verticalPixels;
      p.katana.pierceLimit = snapshot.player.katana.pierceLimit || p.katana.pierceLimit;
      p.katana.cooldown = Math.min(p.katana.cooldown, p.attackInterval);
      p.katana.swingTime = 0;
      p.katana.hitEnemies.clear();
      p.katana.lingerHitTimers.clear();
      p.katana.attackAreaCache = null;
    }

    startStrongNewGame() {
      if (!this.gameOver) return;
      const snapshot = this.createPowerSnapshot();
      this.reset();
      this.restorePowerSnapshot(snapshot);
      this.notice = "強くてニューゲーム";
      this.noticeTimer = 2.4;
      this.gameStarted = this.sfx.audioReady();
      this.startRequested = !this.gameStarted;
      this.guideDismissed = this.gameStarted;
      this.startGrace = Math.max(this.startGrace, 2.4);
      this.sfx.levelUp();
      this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 0.75, maxLife: 0.75, size: 68 });
    }

    rebuildEnemyGrid() {
      if (!this.enemyGrid) this.enemyGrid = new SpatialGrid(96);
      this.enemyGrid.clear();
      for (const enemy of this.enemies) {
        if (!enemy.dead) this.enemyGrid.insert(enemy);
      }
    }

    difficultyProfile() {
      const w = this.playArea.width;
      const h = this.playArea.height;
      const narrow = clamp((560 - w) / 220, 0, 1);
      const short = clamp((420 - h) / 180, 0, 1);
      const compact = Math.max(narrow, short);
      return {
        compact,
        spawnRate: 1 - compact * 0.32,
        maxEnemies: Math.round(34 - compact * 12),
        enemySpeed: 1 - compact * 0.08,
        enemyDamage: 1 - compact * 0.15,
        safeSpawnDistance: 150 + compact * 90,
        openingSafeDistance: 210 + compact * 90,
        bossDelay: compact * 8
      };
    }

    enemyThreatLevel() {
      return Math.max(1, Math.floor(this.level + Math.floor(this.runStats.kills / 18) + this.continues * 10));
    }

    enemyLevelForSpawn() {
      const profile = this.difficultyProfile();
      return Math.max(1, Math.floor(this.enemyThreatLevel() - profile.compact * 2));
    }

    applyEnemyProfile(enemy, profile = this.difficultyProfile()) {
      enemy.def.damage = Math.max(1, Math.floor(enemy.def.damage * profile.enemyDamage));
      enemy.def.speed *= profile.enemySpeed;
    }

    applyDeviceComfort() {
      const profile = this.difficultyProfile();
      if (profile.compact <= 0) return;
      this.player.maxHp = Math.round(this.player.maxHp * (1 + profile.compact * 0.18));
      this.player.hp = this.player.maxHp;
      this.player.speed += profile.compact * 12;
      this.player.katana.horizontalPixels += Math.round(profile.compact * 4);
    }

    rebuildCollectibleGrid() {
      if (!this.collectibleGrid) this.collectibleGrid = new SpatialGrid(96);
      this.collectibleGrid.clear();
      for (const item of this.items) {
        if (!item.absorbed) this.collectibleGrid.insert({ entity: item, kind: "item", x: item.x, y: item.y });
      }
      for (const orb of this.orbs) {
        if (!orb.absorbed) this.collectibleGrid.insert({ entity: orb, kind: "orb", x: orb.x, y: orb.y });
      }
    }

    loop(time) {
      const dt = Math.min(0.033, (time - this.lastTime) / 1000 || 0);
      this.lastTime = time;
      this.unlockAudioFromKeyboard();
      this.tryStartAfterAudioUnlock();
      if (this.gameOver || this.gameCleared) {
        this.processPointerInput();
        if (this.gameOver) this.updateGameOver(dt);
        if (this.gameCleared) this.updateClear(dt);
        if (this.input.pressed("r")) this.reset();
        if (this.gameOver && (this.input.pressed("enter") || this.input.pressed(" "))) this.startStrongNewGame();
      } else {
        this.update(dt);
      }
      this.draw();
      requestAnimationFrame((next) => this.loop(next));
    }

    update(dt) {
      this.processPointerInput();
      this.tryStartAfterAudioUnlock();
      if (this.gameStarted && !this.sfx.audioReady()) this.markAudioInterrupted();
      if (this.audioResumeRequired) {
        this.noticeTimer = Math.max(0, this.noticeTimer - dt);
        this.killPulse = Math.max(0, this.killPulse - dt);
        this.playerDamagePulse = Math.max(0, this.playerDamagePulse - dt);
        this.effectManager.update(dt * 0.25);
        this.sfx.update();
        return;
      }
      if (!this.gameStarted) {
        this.noticeTimer = Math.max(0, this.noticeTimer - dt);
        this.killPulse = Math.max(0, this.killPulse - dt);
        this.playerDamagePulse = Math.max(0, this.playerDamagePulse - dt);
        this.effectManager.update(dt * 0.35);
        this.sfx.update();
        return;
      }
      this.screenShake.update(dt);
      this.combo.update(dt, this);
      if (this.gameCleared) return;
      this.elapsed += dt;
      this.noticeTimer = Math.max(0, this.noticeTimer - dt);
      this.guideTimer = Math.max(0, this.guideTimer - dt);
      this.startGrace = Math.max(0, this.startGrace - dt);
      this.damageInvuln = Math.max(0, this.damageInvuln - dt);
      this.killPulse = Math.max(0, this.killPulse - dt);
      this.playerDamagePulse = Math.max(0, this.playerDamagePulse - dt);
      this.objectivePulse = Math.max(0, this.objectivePulse - dt);
      if (this.hitStop > 0) {
        this.hitStop = Math.max(0, this.hitStop - dt);
        this.effectManager.update(dt * 0.35);
        this.sfx.update();
        let effectWrite = 0;
        for (let i = 0; i < this.effects.length; i += 1) {
          const effect = this.effects[i];
          effect.life -= dt * 0.25;
          if (effect.life > 0) this.effects[effectWrite++] = effect;
        }
        this.effects.length = effectWrite;
        this.trimLegacyEffects();
        return;
      }
      this.rebuildEnemyGrid();
      this.rebuildCollectibleGrid();
      this.player.update(dt, this);
      this.spawner.update(dt, this);

      for (const enemy of this.enemies) enemy.update(dt, this);
      this.updateBossAttacks(dt);
      let enemyWrite = 0;
      for (let i = 0; i < this.enemies.length; i += 1) {
        const enemy = this.enemies[i];
        if (!enemy.dead) this.enemies[enemyWrite++] = enemy;
      }
      this.enemies.length = enemyWrite;
      this.rebuildEnemyGrid();

      let orbWrite = 0;
      for (let i = 0; i < this.orbs.length; i += 1) {
        const orb = this.orbs[i];
        if (!orb.update(dt, this)) this.orbs[orbWrite++] = orb;
      }
      this.orbs.length = orbWrite;
      let itemWrite = 0;
      for (let i = 0; i < this.items.length; i += 1) {
        const item = this.items[i];
        if (!item.update(dt, this)) this.items[itemWrite++] = item;
      }
      this.items.length = itemWrite;
      let tornadoWrite = 0;
      for (let i = 0; i < this.tornadoes.length; i += 1) {
        const tornado = this.tornadoes[i];
        this.updateTornado(tornado, dt);
        if (tornado.life > 0) this.tornadoes[tornadoWrite++] = tornado;
      }
      this.tornadoes.length = tornadoWrite;
      let effectWrite = 0;
      for (let i = 0; i < this.effects.length; i += 1) {
        const effect = this.effects[i];
        effect.life -= dt;
        if (effect.life > 0) this.effects[effectWrite++] = effect;
      }
      this.effects.length = effectWrite;
      this.trimLegacyEffects();
      this.effectManager.update(dt);
      this.bloodManager.update(dt, this);
      this.sfx.update();

      if (!this.gameCleared && this.player.hp <= 0) this.enterGameOver();
    }

    updateClear(dt) {
      this.screenShake.clear();
      this.clearTimer += dt;
      this.clearChoiceCooldown = Math.max(0, this.clearChoiceCooldown - dt);
      if (this.showClearResult) {
        this.bloodManager.update(dt, this);
        this.effectManager.update(dt * 0.35);
        this.sfx.update();
        return;
      }
      if (this.clearTimer > 1.65) this.clearChoiceVisible = true;
      if (this.clearChoiceVisible && this.clearChoiceCooldown <= 0) {
        if (this.input.pressed("arrowup") || this.input.pressed("w") || this.input.pressed("arrowdown") || this.input.pressed("s")) {
          this.clearChoiceIndex = this.clearChoiceIndex === 0 ? 1 : 0;
          this.clearChoiceCooldown = 0.18;
        }
        if (this.input.pressed("enter") || this.input.pressed(" ")) {
          if (this.clearChoiceIndex === 0) this.continueToNextShape();
          else this.showClearResult = true;
          this.clearChoiceCooldown = 0.25;
          this.input.clear();
        }
      }
      this.bloodManager.update(dt, this);
      this.effectManager.update(dt * 0.35);
      this.sfx.update();
      let effectWrite = 0;
      for (let i = 0; i < this.effects.length; i += 1) {
        const effect = this.effects[i];
        effect.life -= dt * 0.45;
        if (effect.life > 0) this.effects[effectWrite++] = effect;
      }
      this.effects.length = effectWrite;
      this.trimLegacyEffects();
    }

    updateGameOver(dt) {
      this.screenShake.clear();
      this.gameOverTimer += dt;
      this.gameOverDroneTimer -= dt;
      if (this.gameOverTimer < 9 && this.gameOverDroneTimer <= 0) {
        this.sfx.gameOverDrone();
        this.gameOverDroneTimer = 1.45;
      }
      this.effectManager.update(dt * 0.35);
      this.bloodManager.update(dt * 0.35, this);
      this.sfx.update();
      let effectWrite = 0;
      for (let i = 0; i < this.effects.length; i += 1) {
        const effect = this.effects[i];
        effect.life -= dt * 0.42;
        if (effect.life > 0) this.effects[effectWrite++] = effect;
      }
      this.effects.length = effectWrite;
      this.trimLegacyEffects();
    }

    enterGameOver() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.gameOverTimer = 0;
      this.gameOverDroneTimer = 1.15;
      this.combo.end(this, "gameOver");
      this.screenShake.clear();
      this.hitStop = 0;
      this.notice = "倒れた";
      this.noticeTimer = 0;
      this.sfx.gameOver();
      this.effects.push({ type: "gameOverStatic", x: this.player.x, y: this.player.y, life: 1.8, maxLife: 1.8, size: 90 });
      this.effects.push({ type: "objectivePop", x: this.player.x, y: this.player.y - 46, life: 1.0, maxLife: 1.0, text: "倒れた", strong: true });
    }

    recordDamage(amount) {
      this.runStats.totalDamage += Math.max(0, Math.round(amount));
    }

    applyComboBloodBonus(comboCount, origin, reason = "timeout") {
      if (reason !== "timeout" || this.gameOver || this.gameCleared || !this.bloodGoal || this.bloodGoal.complete) return 0;
      const bonusBlood = calculateComboBloodBonus(comboCount);
      if (bonusBlood <= 0) return 0;
      const source = origin && Number.isFinite(origin.x) && Number.isFinite(origin.y)
        ? origin
        : { x: this.player.x, y: this.player.y };
      const completedByBlood = this.bloodManager.spawnComboBonusBlood(this, source, comboCount, bonusBlood);
      this.runStats.comboBloodBonus += bonusBlood;
      this.notice = `血流解放 +${bonusBlood}`;
      this.noticeTimer = 1.45;
      this.objectivePulse = Math.max(this.objectivePulse, 1.12);
      this.effects.push({
        type: "comboBlood",
        x: source.x,
        y: source.y,
        life: 1.08,
        maxLife: 1.08,
        text: `血流解放 +${bonusBlood}`
      });
      this.effects.push({
        type: "objectivePop",
        x: this.width / 2,
        y: this.playArea.top + Math.min(120, this.playArea.height * 0.24),
        life: 0.96,
        maxLife: 0.96,
        text: "血流解放",
        strong: true
      });
      if (completedByBlood) this.clearGame();
      return bonusBlood;
    }

    requestHitStop(duration) {
      this.hitStop = Math.max(this.hitStop, Math.min(0.08, duration));
    }

    damagePlayer(amount, shake = 3, shakeTime = 0.09, effectSize = 14) {
      if (this.startGrace > 0 && this.elapsed < 2.8) {
        this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 0.18, maxLife: 0.18, size: 30 });
        return;
      }
      if (this.damageInvuln > 0) return;
      const profile = this.difficultyProfile();
      this.player.hp -= amount;
      this.damageInvuln = 0.28 + profile.compact * 0.18;
      this.sfx.hurt();
      this.screenShake.add(shake, shakeTime);
      this.playerDamagePulse = Math.max(this.playerDamagePulse, 0.58);
      this.requestHitStop(0.044);
      this.effects.push({ type: "playerHurt", x: this.player.x, y: this.player.y, life: 0.38, maxLife: 0.38, size: effectSize + 16 });
      this.effects.push({ x: this.player.x, y: this.player.y, life: 0.22, size: effectSize + 4 });
    }

    showObjectiveGain(x, y, delta, strong = false, label = "血紋") {
      this.objectivePulse = Math.max(this.objectivePulse, strong ? 0.92 : 0.48);
      const pct = Math.max(1, Math.round(delta * 100));
      this.effects.push({
        type: "objectivePop",
        x: x + (strong ? 34 : 24),
        y: y - (strong ? 48 : 38),
        life: strong ? 0.76 : 0.54,
        maxLife: strong ? 0.76 : 0.54,
        text: `${label} +${pct}%`,
        strong
      });
    }

    trimLegacyEffects() {
      if (this.effects.length > EFFECT_QUALITY.maxLegacyEffects) {
        this.effects.splice(0, this.effects.length - EFFECT_QUALITY.maxLegacyEffects);
      }
    }

    scheduleBossLineAttack(owner, dir, length, width, damageScale) {
      if (this.bossAttacks.length >= 28) this.bossAttacks.shift();
      const cleanDir = normalized(dir.x, dir.y);
      const headBroken = owner.parts.head === false;
      const warning = headBroken ? 0.36 + Math.random() * 0.34 : 0.3;
      const adjustedLength = headBroken ? length * (0.75 + Math.random() * 0.35) : length;
      const adjustedDamage = headBroken ? damageScale * 0.72 : damageScale;
      this.bossAttacks.push({
        owner,
        x: owner.x,
        y: owner.y,
        dir: cleanDir,
        length: adjustedLength,
        width,
        damageScale: adjustedDamage,
        warning,
        maxWarning: warning,
        life: warning + 0.16,
        triggered: false
      });
    }

    updateBossAttacks(dt) {
      let write = 0;
      for (let i = 0; i < this.bossAttacks.length; i += 1) {
        const attack = this.bossAttacks[i];
        attack.life -= dt;
        attack.warning -= dt;
        if (!attack.triggered && attack.warning <= 0) {
          attack.triggered = true;
          if (!attack.owner.dead) {
            const tipX = attack.x + attack.dir.x * attack.length;
            const tipY = attack.y + attack.dir.y * attack.length;
            this.effects.push({ type: "slashHit", x: attack.x + attack.dir.x * attack.length * 0.45, y: attack.y + attack.dir.y * attack.length * 0.45, life: 0.18, maxLife: 0.18, size: attack.width, dir: attack.dir, startX: attack.x, startY: attack.y, tipX, tipY, width: attack.width });
            if (pointToSegmentDistance(this.player.x, this.player.y, attack.x, attack.y, tipX, tipY) < this.player.radius + attack.width) {
              attack.owner.bossDamagePlayer(this, attack.damageScale);
            }
          }
        }
        if (attack.life > 0) this.bossAttacks[write++] = attack;
      }
      this.bossAttacks.length = write;
    }

    onEnemyKilled(enemy, dir, result = null) {
      const combo = this.combo.registerKill(enemy.x, enemy.y);
      const heavy = enemy.type === "midBoss" || enemy.type === "midBossArcher" || enemy.type === "levelBoss" || enemy.type === "brute" || enemy.type === "armor";
      const bossBlood = enemy.type === "midBoss" || enemy.type === "midBossArcher" || enemy.type === "levelBoss";
      const rareBlood = enemy.type === "blinkNinja";
      const criticalKill = !!(result && result.isCritical && result.isKillingBlow);
      this.runStats.kills += 1;
      this.runStats.maxCombo = Math.max(this.runStats.maxCombo, combo);
      if (criticalKill) this.runStats.criticalKills += 1;
      if (enemy.type === "levelBoss") this.runStats.bossKills += 1;
      if (enemy.type === "midBoss" || enemy.type === "midBossArcher") this.runStats.midBossKills += 1;
      this.sfx.queueKill(combo, heavy, criticalKill);
      this.effectManager.kill(enemy.x, enemy.y, normalized(dir.x, dir.y), combo, heavy, criticalKill);
      this.killPulse = Math.max(this.killPulse, heavy || criticalKill ? 0.45 : 0.32);
      this.effects.push({
        type: "killPop",
        x: enemy.x,
        y: enemy.y - enemy.radius - 8,
        life: heavy || criticalKill ? 0.62 : 0.4,
        maxLife: heavy || criticalKill ? 0.62 : 0.4,
        text: criticalKill ? "会心斬" : (this.width >= 560 && combo >= 5) ? `${combo}連斬` : "+斬",
        heavy,
        critical: criticalKill
      });
      const progressBefore = this.bloodGoal ? this.bloodGoal.progress() : 0;
      const bloodResult = this.bloodManager.spawnKillBlood(this, enemy, { heavy, critical: criticalKill, boss: bossBlood, rare: rareBlood, tier: enemy.tier || 0 });
      const completedByBlood = !!bloodResult.completed;
      const progressAfter = this.bloodGoal ? this.bloodGoal.progress() : progressBefore;
      if (progressAfter > progressBefore) {
        const label = bossBlood ? "大血流" : criticalKill ? "会心血" : heavy ? "濃血" : rareBlood ? "異血" : "血紋";
        this.showObjectiveGain(enemy.x, enemy.y, progressAfter - progressBefore, heavy || criticalKill || bossBlood, label);
        if (bossBlood) this.objectivePulse = Math.max(this.objectivePulse, 1.35);
      }
      if (completedByBlood) this.clearGame();
      if (criticalKill) this.applyCriticalKillExplosion(enemy, dir);
      if (!this.gameCleared) this.screenShake.add((heavy ? 7 : 3) + Math.min(7, combo * 0.65) + (criticalKill ? 4 : 0), heavy ? 0.18 : 0.11);
      this.requestHitStop(Math.min(0.08, (criticalKill ? 0.052 : 0.026) + combo * 0.003 + (heavy ? 0.014 : 0)));
    }

    clearGame() {
      if (this.gameCleared) return;
      this.gameCleared = true;
      this.combo.end(this, "shapeComplete");
      this.showClearResult = false;
      this.clearChoiceVisible = false;
      this.clearChoiceIndex = 0;
      this.clearChoiceCooldown = 0.4;
      this.clearTimer = 0;
      this.runStats.clearTime = this.elapsed;
      this.runStats.completedShapes.push(this.bloodGoal.displayName());
      this.notice = "血紋完成";
      this.noticeTimer = 0;
      this.screenShake.clear();
      this.sfx.bloodComplete();
      this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 1.0, maxLife: 1.0, size: 96 });
    }

    continueToNextShape() {
      const previous = this.bloodGoal && this.bloodGoal.displayName();
      const absorbedRewards = this.absorbFieldRewardsBeforeNextShape();
      this.continues += 1;
      this.gameCleared = false;
      this.showClearResult = false;
      this.clearChoiceVisible = false;
      this.clearChoiceIndex = 0;
      this.clearTimer = 0;
      this.hitStop = 0;
      this.input.clear();
      this.screenShake.clear();
      this.enemies = [];
      this.orbs = [];
      this.items = [];
      this.effects = [];
      this.bossAttacks = [];
      this.tornadoes = [];
      this.effectManager = new EffectManager();
      this.bloodManager = new BloodManager();
      this.bloodGoal = new BloodCanvasGoal(this.playArea, previous);
      this.spawner = new EnemySpawner();
      const profile = this.difficultyProfile();
      this.spawner.bossTimer = Math.max(12, 24 + profile.bossDelay - this.continues * 3);
      this.spawner.swarmTimer = Math.max(6, 14 - this.continues * 1.5);
      this.combo = new ComboManager();
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(18, this.player.maxHp * 0.25));
      this.level += 2;
      this.nextLevelBossLevel = Math.max(this.nextLevelBossLevel, Math.ceil(this.level / 10) * 10);
      const absorbedCount = absorbedRewards.orbs + absorbedRewards.items;
      this.notice = absorbedCount > 0
        ? `報酬吸収 ${absorbedCount}`
        : this.continues === 1 ? "次の血紋へ" : `第${this.continues + 1}血紋`;
      this.noticeTimer = 2.0;
      this.spawnNextShapeAbsorbShow(absorbedRewards);
    }

    absorbFieldRewardsBeforeNextShape() {
      let orbCount = 0;
      let xpTotal = 0;
      const samples = [];
      const addSample = (x, y, kind = "xp") => {
        if (samples.length >= 18) return;
        samples.push({ x, y, kind });
      };
      for (const orb of this.orbs) {
        if (orb.absorbed === "collected") continue;
        orb.absorbed = "collected";
        orbCount += 1;
        xpTotal += orb.value;
        addSample(orb.x, orb.y, "xp");
      }
      if (xpTotal > 0) {
        this.runStats.xpOrbs += orbCount;
        this.gainXp(xpTotal);
      }

      let itemCount = 0;
      let attributeCount = 0;
      let consumableCount = 0;
      for (const item of this.items) {
        if (item.absorbed === "collected") continue;
        item.absorbed = "collected";
        itemCount += 1;
        this.runStats.items += 1;
        addSample(item.x, item.y, item.kind);
        if (item.kind === "heal") {
          this.player.heal(22);
        } else if (item.kind === "speed") {
          this.player.addSpeed();
        } else if (ELEMENT_ITEMS.includes(item.kind)) {
          attributeCount += 1;
          this.player.addElement(item.kind, this);
        } else if (CONSUMABLE_ITEMS.includes(item.kind)) {
          consumableCount += 1;
          this.runStats.consumables += 1;
        }
      }

      const total = orbCount + itemCount;
      if (total > 0) {
        this.sfx.queueAbsorb(Math.min(12, total), Math.max(4, this.player.attributes.get("absorb")));
        this.sfx.item();
      }
      return { orbs: orbCount, xp: xpTotal, items: itemCount, attributes: attributeCount, consumables: consumableCount, samples };
    }

    spawnNextShapeAbsorbShow(absorbedRewards) {
      const total = absorbedRewards.orbs + absorbedRewards.items;
      if (total <= 0) return;
      const targetX = this.player.x;
      const targetY = this.player.y;
      const samples = absorbedRewards.samples && absorbedRewards.samples.length
        ? absorbedRewards.samples
        : [{ x: targetX - 80, y: targetY - 40, kind: "xp" }, { x: targetX + 80, y: targetY + 40, kind: "item" }];
      for (const sample of samples) {
        const color = ELEMENT_ITEMS.includes(sample.kind)
          ? attributeColor(sample.kind, "main")
          : CONSUMABLE_ITEMS.includes(sample.kind)
            ? BLOOD_BRIGHT
            : sample.kind === "heal"
              ? ORANGE
              : attributeColor("absorb", "main");
        this.effects.push({
          type: "rewardAbsorb",
          x: sample.x,
          y: sample.y,
          targetX,
          targetY,
          color,
          life: 0.72 + Math.random() * 0.18,
          maxLife: 0.84,
          size: 1
        });
      }
      this.effects.push({ type: "enemyPower", x: targetX, y: targetY, life: 0.65, maxLife: 0.65, size: 52 + Math.min(70, total * 4) });
      this.effects.push({
        type: "objectivePop",
        x: targetX,
        y: targetY - 58,
        life: 0.95,
        maxLife: 0.95,
        text: `報酬吸収 ${total}`,
        strong: true
      });
    }

    applyCriticalKillExplosion(originEnemy, dir) {
      const fire = this.player.attributes.get("fire");
      const radius = 54 + Math.min(34, fire * 3) + (originEnemy.type === "levelBoss" ? 24 : originEnemy.type === "midBoss" || originEnemy.type === "midBossArcher" ? 12 : 0);
      const damage = 5 + Math.floor(this.player.katanaDamage * 0.55) + Math.floor(fire * 0.6);
      let affected = 0;
      const visitEnemy = (enemy) => {
        if (affected >= 8 || enemy.dead || enemy === originEnemy) return;
        const range = radius + enemy.radius;
        if (distanceSq(originEnemy.x, originEnemy.y, enemy.x, enemy.y) > range * range) return;
        const away = normalized(enemy.x - originEnemy.x, enemy.y - originEnemy.y);
        enemy.takeDamage(Math.min(enemy.type === "levelBoss" ? 18 : enemy.type === "midBoss" || enemy.type === "midBossArcher" ? 24 : 999, damage), this, away, { sourceType: "criticalExplosion", isCritical: false, hitPosition: { x: enemy.x, y: enemy.y }, dismemberChanceBonus: 0.08 });
        enemy.applyKnockback(away.x, away.y, 120);
        affected += 1;
      };
      if (this.enemyGrid) {
        this.enemyGrid.forEachCircle(originEnemy.x, originEnemy.y, radius + 52, (enemy) => {
          visitEnemy(enemy);
          return affected < 8;
        });
      } else {
        for (const enemy of this.enemies) {
          visitEnemy(enemy);
          if (affected >= 8) break;
        }
      }
      this.effects.push({ type: "enemyPower", x: originEnemy.x, y: originEnemy.y, life: 0.36, maxLife: 0.36, size: radius });
      if (fire > 0) {
        this.effects.push({ type: "fire", x: originEnemy.x, y: originEnemy.y, life: 0.26, maxLife: 0.26, size: Math.min(radius, 54) });
        this.effectManager.attributeHit("fire", originEnemy.x, originEnemy.y, normalized(dir.x, dir.y), fire);
      }
    }

    onWallCollision(enemy, normal, damage, speed) {
      const power = clamp(speed / 360, 0.5, 2.2);
      this.sfx.queueWall(power);
      this.effectManager.wallImpact(enemy.x, enemy.y, normal, power);
      this.screenShake.add(5 + power * 3 + (this.player.attributes.hasMilestone("wind", 15) ? 2 : 0), 0.15);
      enemy.tryDismember(this, normal, damage * 1.4, "wall");
      enemy.takeDamage(damage, this, normal, "wall");
    }

    absorbCollectibles(area, alreadyAbsorbed, fromHit) {
      const absorbLevel = this.player.attributes.get("absorb");
      if (absorbLevel <= 0) {
        this.lastAbsorbCandidates = 0;
        return 0;
      }
      const swingLimit = this.player.attributes.absorbLimit();
      const remaining = Math.max(0, swingLimit - alreadyAbsorbed);
      const limit = fromHit ? Math.min(1, remaining) : remaining;
      if (limit <= 0) {
        this.lastAbsorbCandidates = 0;
        return 0;
      }
      const rangeBonus = this.player.attributes.hasMilestone("absorb", 20) && Math.random() < 0.18 ? area.width * 1.5 : 0;
      const originalWidth = area.width;
      area.width += rangeBonus;
      const broadRadius = area.range + area.width + 24;
      const candidates = [];
      let candidateCount = 0;
      const keepCandidate = (candidate) => {
        const better = (a, b) => a.priority > b.priority || (a.priority === b.priority && a.dist < b.dist);
        if (candidates.length < limit) {
          candidates.push(candidate);
          return;
        }
        let weakestIndex = 0;
        for (let i = 1; i < candidates.length; i += 1) {
          if (better(candidates[weakestIndex], candidates[i])) weakestIndex = i;
        }
        if (better(candidate, candidates[weakestIndex])) candidates[weakestIndex] = candidate;
      };
      const addCandidate = (entity, kind, index) => {
        if (entity.absorbed) return;
        if (Math.abs(entity.x - area.ownerX) > broadRadius || Math.abs(entity.y - area.ownerY) > broadRadius) return;
        const overlap = area.overlapsCircle(entity.x, entity.y, entity.radius || 3);
        if (!overlap.hit) return;
        candidateCount += 1;
        let priority = kind === "item" ? 20 : 5;
        if (kind === "item" && entity.kind === "heal") priority = this.player.hp < this.player.maxHp ? 42 : 12;
        if (kind === "item" && CONSUMABLE_ITEMS.includes(entity.kind)) priority = 38;
        if (kind === "item" && ELEMENT_ITEMS.includes(entity.kind)) priority = 34;
        if (this.player.attributes.hasMilestone("absorb", 5)) priority += 8;
        keepCandidate({ entity, kind, index, priority, dist: overlap.dist });
      };
      if (this.collectibleGrid) {
        let visited = 0;
        this.collectibleGrid.forEachCircle(area.ownerX, area.ownerY, broadRadius, (entry) => {
          addCandidate(entry.entity, entry.kind, visited);
          visited += 1;
        });
      } else {
        for (let i = 0; i < this.items.length && candidates.length < 28; i += 1) addCandidate(this.items[i], "item", i);
        for (let i = 0; i < this.orbs.length && candidates.length < 42; i += 1) {
          if (this.orbs[i].absorbed) continue;
          addCandidate(this.orbs[i], "orb", i);
        }
      }
      this.lastAbsorbCandidates = candidateCount;
      for (const candidate of candidates) {
        candidate.entity.absorbed = true;
        this.effectManager.absorbLine(candidate.entity.x, candidate.entity.y, this.player.x, this.player.y, absorbLevel);
        if (this.player.attributes.hasMilestone("absorb", 10) && candidate.kind === "orb") {
          this.chainAbsorbNear(candidate.entity, Math.min(2, Math.floor(absorbLevel / 10)));
        }
      }
      if (candidates.length > 0) this.sfx.queueAbsorb(candidates.length, absorbLevel);
      if (this.player.attributes.hasMilestone("absorb", 20) && candidates.length > 0) {
        this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 0.35, maxLife: 0.35, size: 30 + absorbLevel * 2 });
      }
      area.width = originalWidth;
      return candidates.length;
    }

    chainAbsorbNear(source, limit) {
      if (limit <= 0) return;
      let pulled = 0;
      const visitEntry = (entry) => {
        if (pulled >= limit) return;
        const orb = entry.entity || entry;
        if (entry.kind && entry.kind !== "orb") return;
        if (orb.absorbed || distanceSq(source.x, source.y, orb.x, orb.y) > 75 * 75) return;
        orb.absorbed = true;
        pulled += 1;
        this.effectManager.absorbLine(orb.x, orb.y, this.player.x, this.player.y, this.player.attributes.get("absorb"));
      };
      if (this.collectibleGrid) {
        this.collectibleGrid.forEachCircle(source.x, source.y, 75, (entry) => {
          visitEntry(entry);
          return pulled < limit;
        });
      } else {
        for (const orb of this.orbs) {
          visitEntry(orb);
          if (pulled >= limit) break;
        }
      }
    }

    gainXp(value) {
      this.xp += value;
      while (this.xp >= this.xpToNext) {
        this.xp -= this.xpToNext;
        this.level += 1;
        this.xpToNext = calculateXpToNext(this.level);
        const major = this.level % 5 === 0;
        const upgrade = Math.random() < 0.14 ? this.player.upgradeAttackSpeed(major) : this.player.upgradeAttackPower(major);
        this.sfx.levelUp();
        const upgradeNotice = upgrade === "SPEED" ? "手数アップ" : upgrade === "LONG" ? "間合い拡張" : "斬撃強化";
        this.effectManager.levelUp(this.player.x, this.player.y, upgradeNotice, this.width < 560);
        this.screenShake.add(10, 0.22);
        this.requestHitStop(0.055);
        this.notice = `レベルアップ ${upgradeNotice}`;
        this.noticeTimer = 1.6;
        this.effects.push({ x: this.player.x, y: this.player.y, life: 0.28, size: 52 });
        if (isAttributeGuaranteeLevel(this.level)) this.grantGuaranteedAttribute(`Lv${this.level}`);
        this.spawnLevelBossIfNeeded();
      }
    }

    chooseAttributeKind() {
      const levels = ELEMENT_ITEMS.map((id) => ({ id, level: this.player.attributes.get(id) }));
      const minLevel = Math.min(...levels.map((entry) => entry.level));
      const recent = new Set((this.attributeHistory || []).slice(-2));
      const weighted = [];
      for (const entry of levels) {
        let weight = entry.level === minLevel ? 6 : 2;
        if (entry.level === 0) weight += 5;
        if (recent.has(entry.id)) weight = Math.max(1, Math.floor(weight * 0.35));
        for (let i = 0; i < weight; i += 1) weighted.push(entry.id);
      }
      return weighted[Math.floor(Math.random() * weighted.length)] || ELEMENT_ITEMS[0];
    }

    rememberAttribute(id) {
      if (!this.attributeHistory) this.attributeHistory = [];
      this.attributeHistory.push(id);
      if (this.attributeHistory.length > 6) this.attributeHistory.shift();
    }

    grantGuaranteedAttribute(reason = "保証") {
      const kind = this.chooseAttributeKind();
      const gain = this.player.addElement(kind, this);
      this.rememberAttribute(kind);
      this.sfx.item();
      this.effectManager.attributeHit(kind, this.player.x, this.player.y, { x: 0, y: -1 }, this.player.attributes.get(kind));
      this.effects.push({ type: "rareDrop", x: this.player.x, y: this.player.y - 18, life: 0.9, maxLife: 0.9, size: 42 });
      const label = ATTRIBUTE_DEFINITIONS[kind].displayName;
      this.notice = `${reason} 属性獲得: ${label}${gain ? gain.level : ""}`;
      this.noticeTimer = 2.0;
      return kind;
    }

    addAttributePity(amount, x = this.player.x, y = this.player.y) {
      this.attributePity = (this.attributePity || 0) + amount;
      while (this.attributePity >= 100) {
        this.attributePity -= 100;
        this.dropManager.dropAttribute(x, y, true);
      }
    }

    spawnLevelBossIfNeeded() {
      while (this.level >= this.nextLevelBossLevel) {
        const rank = this.nextLevelBossLevel / 10;
        this.spawnLevelBoss(rank);
        this.nextLevelBossLevel += 10;
      }
    }

    spawnLevelBoss(rank) {
      const bounds = this.playArea;
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (side === 0) {
        x = bounds.left + Math.random() * bounds.width;
        y = bounds.top - 42;
      } else if (side === 1) {
        x = bounds.right + 42;
        y = bounds.top + Math.random() * bounds.height;
      } else if (side === 2) {
        x = bounds.left + Math.random() * bounds.width;
        y = bounds.bottom + 42;
      } else {
        x = bounds.left - 42;
        y = bounds.top + Math.random() * bounds.height;
      }
      const boss = new Enemy("levelBoss", x, y, rank, this.enemyLevelForSpawn());
      this.applyEnemyProfile(boss);
      this.enemies.push(boss);
      this.notice = `第${rank}段階ボス`;
      this.noticeTimer = 2.4;
      this.sfx.boss();
      this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 1.0, maxLife: 1.0, size: 70 + rank * 10 });
    }

    resolveEnemyXpAbsorption() {
      return;
    }

    maybeDropItem(x, y) {
      this.dropManager.dropNormalItem(x, y);
    }

    dropElementItem(x, y) {
      this.dropManager.dropAttribute(x, y);
    }

    activateConsumable(kind) {
      if (kind === "collectAllExp") {
        let count = 0;
        for (const orb of this.orbs) {
          if (orb.absorbed) continue;
          orb.absorbed = true;
          count += 1;
          if (count <= 28) this.effectManager.absorbLine(orb.x, orb.y, this.player.x, this.player.y, Math.max(1, this.player.attributes.get("absorb")));
        }
        this.sfx.queueAbsorb(Math.min(12, count), Math.max(4, this.player.attributes.get("absorb")));
        this.screenShake.add(Math.min(10, 4 + count * 0.08), 0.18);
        this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 0.55, maxLife: 0.55, size: 44 + Math.min(45, count) });
        this.notice = "経験玉全回収";
        this.noticeTimer = 1.6;
        return;
      }
      if (kind === "damageAllEnemies") {
        const baseDamage = 24 + this.level * 2 + Math.floor(this.player.katana.growthLevel() * 2);
        let hit = 0;
        const enemies = [...this.enemies];
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          const cap = enemy.type === "levelBoss" ? 70 : enemy.type === "midBoss" || enemy.type === "midBossArcher" ? 90 : 999;
          const damage = Math.min(cap, baseDamage + Math.floor(enemy.def.hp * 0.08));
          const dir = normalized(enemy.x - this.player.x, enemy.y - this.player.y);
          enemy.flash = 0.22;
          if (hit < 36) this.effectManager.hit(enemy.x, enemy.y, dir, 10);
          enemy.takeDamage(damage, this, dir, "consumable");
          enemy.applyKnockback(dir.x, dir.y, 95);
          hit += 1;
        }
        this.sfx.queueWall(1.8);
        this.screenShake.add(11, 0.2);
        this.effects.push({ type: "enemyPower", x: this.player.x, y: this.player.y, life: 0.72, maxLife: 0.72, size: Math.max(this.width, this.height) * 0.25 });
        this.notice = "全体斬撃";
        this.noticeTimer = 1.6;
      }
    }

    applyElementalHit(enemy, blade) {
      const elements = this.player.attributes;
      const fire = elements.get("fire");
      const ice = elements.get("ice");
      const lightning = elements.get("lightning");
      const wind = elements.get("wind");
      if (fire > 0) {
        enemy.lastHitElement = "fire";
        this.sfx.queueElement("fire");
        this.effectManager.attributeHit("fire", enemy.x, enemy.y, blade.dir, fire);
        enemy.applyBurn(1.4 + fire * 0.35);
        this.effects.push({ type: "fire", x: enemy.x, y: enemy.y, life: 0.42, maxLife: 0.42, size: 18 + fire * 3 });
        if (elements.hasMilestone("fire", 5)) this.fireSplash(enemy, Math.min(2, 1 + Math.floor(fire / 10)));
        if (elements.hasMilestone("fire", 20) && Math.random() < 0.12) this.effects.push({ type: "fire", x: enemy.x, y: enemy.y - 18, life: 0.7, maxLife: 0.7, size: 34 });
      }
      if (ice > 0) {
        enemy.lastHitElement = "ice";
        this.sfx.queueElement("ice");
        this.effectManager.attributeHit("ice", enemy.x, enemy.y, blade.dir, ice);
        enemy.applySlow(1.2 + ice * 0.32 + (elements.hasMilestone("ice", 5) ? 0.6 : 0));
        if (elements.hasMilestone("ice", 10) && Math.random() < 0.12 + ice * 0.006) enemy.applyFreeze(0.22 + ice * 0.025);
        if (elements.hasMilestone("ice", 15) && enemy.freezeTime > 0) {
          enemy.takeDamage(3 + Math.floor(ice / 5), this, blade.dir, "ice");
          enemy.tryDismember(this, blade.dir, 16, "ice");
        }
        this.effects.push({ type: "ice", x: enemy.x, y: enemy.y, life: 0.48, maxLife: 0.48, size: 20 + ice * 3 });
      }
      if (lightning > 0) {
        enemy.lastHitElement = "lightning";
        this.sfx.queueElement("lightning");
        this.effectManager.attributeHit("lightning", enemy.x, enemy.y, blade.dir, lightning);
        if (elements.hasMilestone("lightning", 5) && Math.random() < 0.12 + lightning * 0.004) enemy.applyStun(0.16 + lightning * 0.01);
        this.chainLightning(enemy, Math.min(7, 1 + lightning + (elements.hasMilestone("lightning", 10) ? 1 : 0)));
        if (elements.hasMilestone("lightning", 20) && Math.random() < 0.12) {
          enemy.takeDamage(5 + Math.floor(lightning / 4), this, { x: 0, y: 1 }, "lightning");
          this.effects.push({ type: "lightning", x: enemy.x, y: enemy.y - 80, x2: enemy.x, y2: enemy.y, life: 0.2, maxLife: 0.2, size: 10 });
        }
      }
      if (wind > 0) {
        enemy.lastHitElement = "wind";
        this.sfx.queueElement("wind");
        this.effectManager.attributeHit("wind", enemy.x, enemy.y, blade.dir, wind);
        enemy.applyKnockback(blade.dir.x, blade.dir.y, 36 * wind + (elements.hasMilestone("wind", 5) ? 90 : 0));
        if (elements.hasMilestone("wind", 10)) this.spawnTornado(enemy.x, enemy.y, blade.dir, Math.min(wind, 6));
        if (elements.hasMilestone("wind", 20) && Math.random() < 0.16) this.windSlash(enemy.x, enemy.y, blade.dir, wind);
      }
    }

    fireSplash(enemy, maxTargets) {
      let hit = 0;
      const visitTarget = (target) => {
        if (hit >= maxTargets) return;
        if (target === enemy || target.dead || distanceSq(enemy.x, enemy.y, target.x, target.y) > 46 * 46) return;
        target.takeDamage(2, this, normalized(target.x - enemy.x, target.y - enemy.y), "fire");
        hit += 1;
      };
      if (this.enemyGrid) {
        this.enemyGrid.forEachCircle(enemy.x, enemy.y, 64, (target) => {
          visitTarget(target);
          return hit < maxTargets;
        });
      } else {
        for (const target of this.enemies) {
          visitTarget(target);
          if (hit >= maxTargets) break;
        }
      }
    }

    windSlash(x, y, dir, level) {
      this.effects.push({ type: "slashHit", element: "wind", x, y, life: 0.2, maxLife: 0.2, size: 18 + Math.min(18, level * 2), dir });
      let pushed = 0;
      const midX = x + dir.x * 65;
      const midY = y + dir.y * 65;
      const visitEnemy = (enemy) => {
        if (pushed >= 5 || enemy.dead) return;
        if (pointToSegmentDistance(enemy.x, enemy.y, x, y, x + dir.x * 130, y + dir.y * 130) > enemy.radius + 26) return;
        enemy.applyKnockback(dir.x, dir.y, 190 + level * 18);
        pushed += 1;
      };
      if (this.enemyGrid) {
        this.enemyGrid.forEachCircle(midX, midY, 108, (enemy) => {
          visitEnemy(enemy);
          return pushed < 5;
        });
      } else {
        for (const enemy of this.enemies) {
          visitEnemy(enemy);
          if (pushed >= 5) break;
        }
      }
    }

    chainLightning(startEnemy, jumps) {
      let current = startEnemy;
      const hit = new Set([startEnemy]);
      const maxJumps = Math.min(jumps, 7);
      for (let i = 0; i < maxJumps; i += 1) {
        let target = null;
        let bestSq = 130 * 130;
        const visitEnemy = (enemy) => {
          if (enemy.dead || hit.has(enemy)) return;
          const distSq = distanceSq(current.x, current.y, enemy.x, enemy.y);
          if (distSq < bestSq) {
            bestSq = distSq;
            target = enemy;
          }
        };
        if (this.enemyGrid) {
          this.enemyGrid.forEachCircle(current.x, current.y, 162, visitEnemy);
        } else {
          for (const enemy of this.enemies) visitEnemy(enemy);
        }
        if (!target) break;
        target.takeDamage(3, this, normalized(target.x - current.x, target.y - current.y));
        target.applyKnockback(target.x - current.x, target.y - current.y, 90);
        this.effects.push({ type: "lightning", x: current.x, y: current.y, x2: target.x, y2: target.y, life: 0.18, maxLife: 0.18, size: 10 });
        hit.add(target);
        current = target;
      }
      if (hit.size >= 4 && this.player.attributes.hasMilestone("lightning", 15)) {
        this.screenShake.add(3, 0.09);
        this.sfx.queueElement("lightning");
      }
    }

    spawnTornado(x, y, dir, level) {
      this.tornadoes.push({
        x,
        y,
        vx: dir.x * (95 + level * 12),
        vy: dir.y * (95 + level * 12),
        radius: 34 + level * 5,
        power: 240 + level * 50,
        life: 1.2 + level * 0.18,
        maxLife: 1.2 + level * 0.18,
        spin: Math.random() * FULL_SPIN
      });
    }

    updateTornado(tornado, dt) {
      tornado.x += tornado.vx * dt;
      tornado.y += tornado.vy * dt;
      tornado.life -= dt;
      tornado.spin += dt * 11;
      const visitEnemy = (enemy) => {
        if (enemy.dead) return;
        const range = tornado.radius + enemy.radius;
        if (distanceSq(tornado.x, tornado.y, enemy.x, enemy.y) > range * range) return;
        const dir = normalized(enemy.x - tornado.x, enemy.y - tornado.y);
        const swirl = { x: -dir.y, y: dir.x };
        enemy.vx += (dir.x * tornado.power + swirl.x * tornado.power * 0.7) * dt;
        enemy.vy += (dir.y * tornado.power + swirl.y * tornado.power * 0.7) * dt;
      };
      if (this.enemyGrid) {
        this.enemyGrid.forEachCircle(tornado.x, tornado.y, tornado.radius + 48, visitEnemy);
      } else {
        for (const enemy of this.enemies) visitEnemy(enemy);
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.playArea.left, this.playArea.top, this.playArea.width, this.playArea.height);
      ctx.clip();
      this.drawGrid(ctx);
      this.bloodGoal.draw(ctx);
      for (const orb of this.orbs) {
        if (!outsideView(orb, this, 18)) orb.draw(ctx);
      }
      for (const item of this.items) {
        if (!outsideView(item, this, 28)) item.draw(ctx);
      }
      for (const tornado of this.tornadoes) {
        if (!outsideView(tornado, this, tornado.radius + 34)) this.drawTornado(ctx, tornado);
      }
      this.drawBossWarnings(ctx);
      for (const enemy of this.enemies) {
        if (!outsideView(enemy, this, enemy.radius + 90)) enemy.draw(ctx, this.player);
      }
      this.drawMoveTarget(ctx);
      this.player.draw(ctx);
      this.effectManager.draw(ctx);
      this.bloodManager.draw(ctx);
      for (const effect of this.effects) {
        if (effect.x !== undefined && outsideView(effect, this, (effect.size || 80) + 90)) continue;
        if (effect.type === "slashHit") {
          this.drawSlashHit(ctx, effect);
          continue;
        }
        if (effect.type === "fire") {
          this.drawFireEffect(ctx, effect);
          continue;
        }
        if (effect.type === "burnTick") {
          this.drawBurnTickEffect(ctx, effect);
          continue;
        }
        if (effect.type === "ice") {
          this.drawIceEffect(ctx, effect);
          continue;
        }
        if (effect.type === "lightning") {
          this.drawLightningEffect(ctx, effect);
          continue;
        }
        if (effect.type === "rareDrop") {
          this.drawRareDropEffect(ctx, effect);
          continue;
        }
        if (effect.type === "enemyPower") {
          this.drawEnemyPowerEffect(ctx, effect);
          continue;
        }
        if (effect.type === "comboBlood") {
          this.drawComboBloodEffect(ctx, effect);
          continue;
        }
        if (effect.type === "killPop") {
          this.drawKillPopEffect(ctx, effect);
          continue;
        }
        if (effect.type === "pickupPop") {
          this.drawPickupPopEffect(ctx, effect);
          continue;
        }
        if (effect.type === "objectivePop") {
          this.drawObjectivePopEffect(ctx, effect);
          continue;
        }
        if (effect.type === "bossBreakPop") {
          this.drawBossBreakPopEffect(ctx, effect);
          continue;
        }
        if (effect.type === "partBreakPop") {
          this.drawPartBreakPopEffect(ctx, effect);
          continue;
        }
        if (effect.type === "playerHurt") {
          this.drawPlayerHurtEffect(ctx, effect);
          continue;
        }
        if (effect.type === "rewardAbsorb") {
          this.drawRewardAbsorbEffect(ctx, effect);
          continue;
        }
        if (effect.type === "gameOverStatic") {
          this.drawGameOverStaticEffect(ctx, effect);
          continue;
        }
        const size = Math.round(effect.size * (effect.life / 0.16));
        rect(ctx, Math.round(effect.x) - size / 2, Math.round(effect.y) - size / 2, size, 1);
        rect(ctx, Math.round(effect.x) - size / 2, Math.round(effect.y) + size / 2, size, 1);
        rect(ctx, Math.round(effect.x) - size / 2, Math.round(effect.y) - size / 2, 1, size);
        rect(ctx, Math.round(effect.x) + size / 2, Math.round(effect.y) - size / 2, 1, size);
      }
      if (DEBUG_ATTACK_AREA) this.drawAttackDebug(ctx);
      ctx.restore();
      this.ui.draw(ctx, this);
      this.combo.draw(ctx, this.width, this.height);
    }

    drawKillPopEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const rise = (1 - t) * (effect.heavy || effect.critical ? 42 : 30);
      const scale = effect.heavy || effect.critical ? 1.2 : 1;
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - rise);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.45, 0, 1);
      ctx.fillStyle = effect.critical ? BLOOD_BRIGHT : ORANGE;
      ctx.font = `${Math.round(15 * scale + (1 - t) * 5)}px Courier New, monospace`;
      ctx.fillText(effect.text, x - effect.text.length * 5 * scale, y);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x - 18, y + 20, Math.max(3, 36 * t), 2);
      if (effect.critical) {
        linePixels(ctx, x - 28, y + 9, x + 28, y - 6);
        linePixels(ctx, x - 22, y + 16, x + 22, y + 2);
      }
      ctx.restore();
    }

    drawPickupPopEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - (1 - t) * 22);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.35, 0, 1);
      ctx.fillStyle = effect.kind === "xp" ? LIGHT_ORANGE : ORANGE;
      ctx.font = effect.kind === "xp" ? "13px Courier New, monospace" : "15px Courier New, monospace";
      ctx.fillText(effect.text, x - effect.text.length * 4, y);
      if (effect.kind !== "xp") {
        ctx.fillStyle = LIGHT_ORANGE;
        rect(ctx, x - 16, y + 18, Math.max(3, 32 * t), 2);
      }
      ctx.restore();
    }

    drawObjectivePopEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - (1 - t) * (effect.strong ? 42 : 30));
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.35, 0, 1);
      ctx.fillStyle = effect.strong ? BLOOD_BRIGHT : BLOOD;
      ctx.font = `${effect.strong ? 17 : 15}px Courier New, monospace`;
      ctx.fillText(effect.text, x - effect.text.length * 5, y);
      ctx.fillStyle = BLOOD_DARK;
      rect(ctx, x - 22, y + 19, Math.max(4, 44 * t), 2);
      ctx.restore();
    }

    drawBossBreakPopEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - (1 - t) * 46);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.25, 0, 1);
      ctx.fillStyle = ORANGE;
      ctx.font = "18px Courier New, monospace";
      ctx.fillText(effect.text, x - effect.text.length * 7, y);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x - 38, y + 27, Math.max(5, 76 * t), 3);
      ctx.restore();
    }

    drawPartBreakPopEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - (1 - t) * 24);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.35, 0, 1);
      ctx.fillStyle = ORANGE;
      ctx.font = "13px Courier New, monospace";
      ctx.fillText(effect.text, x - effect.text.length * 5, y);
      ctx.fillStyle = LIGHT_ORANGE;
      rect(ctx, x - 18, y + 18, Math.max(4, 36 * t), 2);
      ctx.restore();
    }

    drawComboBloodEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y - (1 - t) * 30);
      ctx.fillStyle = t > 0.55 ? BLOOD_BRIGHT : BLOOD;
      ctx.font = "16px Courier New, monospace";
      ctx.fillText(effect.text, x - effect.text.length * 4, y - 8);
      ctx.fillStyle = BLOOD_DARK;
      rect(ctx, x - 18, y + 14, 36 * t, 2);
    }

    drawPlayerHurtEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const grow = 1 - t;
      const x = Math.round(effect.x);
      const y = Math.round(effect.y);
      const size = effect.size * (0.65 + grow * 0.9);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.45, 0, 1);
      ctx.fillStyle = BLOOD_BRIGHT;
      thickLinePixels(ctx, x - size, y - size * 0.6, x + size, y + size * 0.6, 4);
      thickLinePixels(ctx, x - size * 0.85, y + size * 0.65, x + size * 0.85, y - size * 0.65, 3);
      ctx.fillStyle = ORANGE;
      rect(ctx, x - 5, y - 5, 10, 10);
      ctx.restore();
    }

    drawRewardAbsorbEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y);
      const tx = Math.round(effect.targetX);
      const ty = Math.round(effect.targetY);
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.4, 0, 1);
      ctx.fillStyle = effect.color || attributeColor("absorb", "main");
      dashedLinePixels(ctx, x, y, tx, ty, 3, 8);
      const ix = x + (tx - x) * (1 - t);
      const iy = y + (ty - y) * (1 - t);
      rect(ctx, ix - 4, iy - 4, 8, 8);
      ctx.restore();
    }

    drawGameOverStaticEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x = Math.round(effect.x);
      const y = Math.round(effect.y);
      const size = effect.size * (1 - t * 0.2);
      ctx.save();
      ctx.globalAlpha = clamp(t, 0, 0.85);
      ctx.fillStyle = BLOOD_DARK;
      for (let i = 0; i < 10; i += 1) {
        const yy = y - size * 0.5 + i * (size / 9);
        rect(ctx, x - size * 0.65 + (i % 2) * 8, yy, size * (0.45 + t * 0.3), 2);
      }
      ctx.fillStyle = ORANGE;
      rect(ctx, x - 18, y - 2, 36 * t, 4);
      ctx.restore();
    }

    drawAttackDebug(ctx) {
      const debug = this.player.katana.lastAttackDebug;
      if (!debug || !debug.area) return;
      ctx.fillStyle = ORANGE;
      for (const segment of debug.area.segments) {
        dashedLinePixels(ctx, segment.startX, segment.startY, segment.tipX, segment.tipY, Math.max(2, debug.area.width), 14);
        dashedLinePixels(ctx, segment.gripX + segment.dir.x * debug.area.range * 0.72, segment.gripY + segment.dir.y * debug.area.range * 0.72, segment.tipX, segment.tipY, 2, 9);
      }
      for (const enemy of this.enemies) {
        rect(ctx, enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, 1);
        rect(ctx, enemy.x - enemy.radius, enemy.y + enemy.radius, enemy.radius * 2, 1);
        rect(ctx, enemy.x - enemy.radius, enemy.y - enemy.radius, 1, enemy.radius * 2);
        rect(ctx, enemy.x + enemy.radius, enemy.y - enemy.radius, 1, enemy.radius * 2);
      }
      for (const orb of this.orbs) rect(ctx, orb.x - 4, orb.y - 4, 8, 8);
      for (const item of this.items) rect(ctx, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
      ctx.font = "12px Courier New, monospace";
      ctx.fillText(`HIT ${debug.hitCount} CAND ${debug.absorbCandidates} ABS ${debug.absorbed} ALV ${debug.absorbLevel} SEG ${debug.area.segments.length} W ${debug.area.width.toFixed(1)}`, 14, this.height - 24);
    }

    drawBossWarnings(ctx) {
      ctx.fillStyle = ORANGE;
      for (const attack of this.bossAttacks) {
        if (attack.triggered) continue;
        const t = clamp(attack.warning / attack.maxWarning, 0, 1);
        const side = { x: -attack.dir.y, y: attack.dir.x };
        const tipX = attack.x + attack.dir.x * attack.length;
        const tipY = attack.y + attack.dir.y * attack.length;
        const width = attack.width * (0.8 + (1 - t) * 0.45);
        dashedLinePixels(ctx, attack.x, attack.y, tipX, tipY, Math.max(2, width), 8);
        linePixels(ctx, attack.x + side.x * width, attack.y + side.y * width, tipX + side.x * width, tipY + side.y * width);
        linePixels(ctx, attack.x - side.x * width, attack.y - side.y * width, tipX - side.x * width, tipY - side.y * width);
        rect(ctx, tipX - 2, tipY - 2, 4, 4);
      }
    }

    drawMoveTarget(ctx) {
      if (!this.targetMovePoint) return;
      const dx = this.targetMovePoint.x - this.player.x;
      const dy = this.targetMovePoint.y - this.player.y;
      if (dx * dx + dy * dy < 16 * 16) return;
      const pulse = 0.72 + Math.sin(this.elapsed * 12) * 0.18;
      const x = Math.round(this.targetMovePoint.x);
      const y = Math.round(this.targetMovePoint.y);
      ctx.globalAlpha = 0.52;
      ctx.fillStyle = ORANGE;
      dashedLinePixels(ctx, this.player.x, this.player.y - 4, x, y, 2, 16);
      ctx.globalAlpha = pulse;
      rect(ctx, x - 11, y - 1, 8, 2);
      rect(ctx, x + 3, y - 1, 8, 2);
      rect(ctx, x - 1, y - 11, 2, 8);
      rect(ctx, x - 1, y + 3, 2, 8);
      rect(ctx, x - 2, y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }

    drawSlashHit(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const dir = effect.dir || { x: 1, y: 0 };
      const side = { x: -dir.y, y: dir.x };
      const size = effect.size * t;
      const x = effect.x;
      const y = effect.y;
      ctx.fillStyle = effect.element ? attributeColor(effect.element, "main") : ORANGE;

      if (effect.startX !== undefined) {
        const width = Math.max(2, Math.min(effect.width || size, size));
        const sx = lerp(effect.startX, effect.tipX, 0.55);
        const sy = lerp(effect.startY, effect.tipY, 0.55);
        const tx = lerp(effect.startX, effect.tipX, 0.98);
        const ty = lerp(effect.startY, effect.tipY, 0.98);
        thickLinePixels(ctx, sx, sy, tx, ty, Math.max(2, width * 0.45 * t));
        thickLinePixels(ctx, x - side.x * width * 0.7, y - side.y * width * 0.7, x + side.x * width * 0.7, y + side.y * width * 0.7, Math.max(2, width * 0.35 * t));
        for (let i = 0; i < 5; i += 1) {
          const along = 0.58 + i * 0.08;
          const px = lerp(effect.startX, effect.tipX, along) + side.x * (i - 2) * width * 0.28;
          const py = lerp(effect.startY, effect.tipY, along) + side.y * (i - 2) * width * 0.28;
          rect(ctx, px - 2, py - 2, 4, 4);
        }
        return;
      }

      thickLinePixels(ctx, x - side.x * size * 0.45, y - side.y * size * 0.45, x + side.x * size * 0.45, y + side.y * size * 0.45, 3);
      if (effect.element) ctx.fillStyle = attributeColor(effect.element, "sub");
      thickLinePixels(ctx, x - dir.x * size * 0.3 - side.x * size * 0.18, y - dir.y * size * 0.3 - side.y * size * 0.18, x + dir.x * size * 0.3 + side.x * size * 0.18, y + dir.y * size * 0.3 + side.y * size * 0.18, 2);

      for (let i = 0; i < 5; i += 1) {
        const spread = (i - 2) * 0.2;
        const px = x + dir.x * size * (0.25 + i * 0.08) + side.x * size * spread;
        const py = y + dir.y * size * (0.25 + i * 0.08) + side.y * size * spread;
        rect(ctx, px - 1, py - 1, 3, 3);
      }
    }

    drawFireEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const size = effect.size * t;
      const x = effect.x;
      const y = effect.y;
      ctx.fillStyle = attributeColor("fire", "main");
      for (let i = 0; i < 6; i += 1) {
        const wave = Math.sin((1 - t) * 12 + i) * 4;
        rect(ctx, x - size * 0.25 + i * 3 + wave, y + size * 0.25 - i * 4, 3 + (i % 2), 7);
      }
      ctx.fillStyle = attributeColor("fire", "sub");
      rect(ctx, x - 2, y - size * 0.35, 4, 5);
      rect(ctx, x - size * 0.35, y + size * 0.2, size * 0.7, 2);
    }

    drawBurnTickEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const grow = 1 - t;
      const size = effect.size * (0.72 + grow * 0.35);
      const x = effect.x;
      const y = effect.y;
      ctx.fillStyle = attributeColor("fire", "main");
      rect(ctx, x - size * 0.5, y + size * 0.32, size, 3);
      rect(ctx, x - size * 0.42, y - size * 0.1, 3, size * 0.42);
      rect(ctx, x + size * 0.38, y - size * 0.16, 3, size * 0.46);
      for (let i = 0; i < 4; i += 1) {
        const px = x + (i - 1.5) * size * 0.2 + Math.sin(grow * 8 + i) * 3;
        const py = y + size * 0.12 - i * size * 0.16 - grow * 12;
        rect(ctx, px - 2, py - 2, 4, 6 + (i % 2) * 3);
      }
      ctx.fillStyle = attributeColor("fire", "sub");
      rect(ctx, x - size * 0.25, y - size * 0.48 - grow * 8, size * 0.5, 3);
      if (effect.damage && t > 0.25) {
        ctx.font = "12px Courier New, monospace";
        ctx.fillText(`-${effect.damage}`, x + size * 0.42, y - size * 0.7 - grow * 10);
      }
    }

    drawIceEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const size = effect.size * t;
      const x = effect.x;
      const y = effect.y;
      ctx.fillStyle = attributeColor("ice", "main");
      rect(ctx, x - size / 2, y - size / 2, size, 2);
      rect(ctx, x - size / 2, y + size / 2, size, 2);
      rect(ctx, x - size / 2, y - size / 2, 2, size);
      rect(ctx, x + size / 2, y - size / 2, 2, size);
      ctx.fillStyle = attributeColor("ice", "sub");
      linePixels(ctx, x - size * 0.35, y, x + size * 0.35, y);
      linePixels(ctx, x, y - size * 0.35, x, y + size * 0.35);
    }

    drawLightningEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const x1 = effect.x;
      const y1 = effect.y;
      const x2 = effect.x2;
      const y2 = effect.y2;
      const midX = (x1 + x2) / 2 + Math.sin(t * 18) * 10;
      const midY = (y1 + y2) / 2 + Math.cos(t * 18) * 10;
      ctx.fillStyle = attributeColor("lightning", "main");
      thickLinePixels(ctx, x1, y1, midX, midY, 3);
      ctx.fillStyle = attributeColor("lightning", "sub");
      thickLinePixels(ctx, midX, midY, x2, y2, 3);
      rect(ctx, x2 - 4, y2 - 4, 8, 8);
    }

    drawTornado(ctx, tornado) {
      const t = clamp(tornado.life / tornado.maxLife, 0, 1);
      ctx.fillStyle = attributeColor("wind", "main");
      for (let ring = 0; ring < 5; ring += 1) {
        const radius = tornado.radius * (0.25 + ring * 0.16) * t;
        const start = tornado.spin + ring * 0.9;
        let previous = null;
        for (let i = 0; i < 12; i += 1) {
          const angle = start + i * 0.34;
          const px = tornado.x + Math.cos(angle) * radius;
          const py = tornado.y + Math.sin(angle) * radius * 0.65 + ring * 4;
          if (previous) dashedLinePixels(ctx, previous.x, previous.y, px, py, 3, 5);
          previous = { x: px, y: py };
        }
      }
      ctx.fillStyle = attributeColor("wind", "sub");
      rect(ctx, tornado.x - 3, tornado.y - 3, 6, 6);
    }

    drawRareDropEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const size = effect.size * t;
      ctx.fillStyle = ORANGE;
      for (let i = 0; i < 8; i += 1) {
        const angle = (FULL_SPIN / 8) * i + (1 - t) * 4;
        const x = effect.x + Math.cos(angle) * size;
        const y = effect.y + Math.sin(angle) * size;
        rect(ctx, x - 2, y - 2, 4, 4);
      }
      rect(ctx, effect.x - 5, effect.y - 5, 10, 10);
    }

    drawEnemyPowerEffect(ctx, effect) {
      const t = clamp(effect.life / effect.maxLife, 0, 1);
      const size = effect.size * t;
      ctx.fillStyle = ORANGE;
      rect(ctx, effect.x - size, effect.y - size, size * 2, 2);
      rect(ctx, effect.x - size, effect.y + size, size * 2, 2);
      rect(ctx, effect.x - size, effect.y - size, 2, size * 2);
      rect(ctx, effect.x + size, effect.y - size, 2, size * 2);
      for (let i = 0; i < 6; i += 1) {
        const angle = (FULL_SPIN / 6) * i + (1 - t) * 2;
        rect(ctx, effect.x + Math.cos(angle) * size * 0.7 - 2, effect.y + Math.sin(angle) * size * 0.7 - 2, 4, 4);
      }
    }

    drawGrid(ctx) {
      if (this.gridLayer) ctx.drawImage(this.gridLayer, this.playArea.left, this.playArea.top);
    }
  }

  function rect(ctx, x, y, w, h) {
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }

  function linePixels(ctx, x1, y1, x2, y2) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i += 2) {
      const t = steps === 0 ? 0 : i / steps;
      rect(ctx, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 2, 2);
    }
  }

  function dashedLinePixels(ctx, x1, y1, x2, y2, size, gap) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i += Math.max(2, size)) {
      if (Math.floor(i / gap) % 2 !== 0) continue;
      const t = steps === 0 ? 0 : i / steps;
      rect(ctx, x1 + (x2 - x1) * t - size / 2, y1 + (y2 - y1) * t - size / 2, size, size);
    }
  }

  function thickLinePixels(ctx, x1, y1, x2, y2, size) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i += 2) {
      const t = steps === 0 ? 0 : i / steps;
      rect(ctx, x1 + (x2 - x1) * t - size / 2, y1 + (y2 - y1) * t - size / 2, size, size);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function distanceSq(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  function outsideView(entity, game, margin = 80) {
    return entity.x < game.playArea.left - margin
      || entity.x > game.playArea.right + margin
      || entity.y < game.playArea.top - margin
      || entity.y > game.playArea.bottom + margin;
  }

  function bladeLength(blade) {
    return distance(blade.startX, blade.startY, blade.tipX, blade.tipY);
  }

  function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq <= 0.0001) return distance(px, py, x1, y1);
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / lengthSq, 0, 1);
    return distance(px, py, x1 + dx * t, y1 + dy * t);
  }

  function normalized(x, y) {
    const len = Math.hypot(x, y);
    if (len < 0.0001) return { x: 1, y: 0 };
    return { x: x / len, y: y / len };
  }

  window.addEventListener("load", () => {
    const game = new GameState(document.getElementById("game"));
    const params = new URLSearchParams(window.location.search);
    if (params.has("debug")) {
      window.__SAMURAI_GAME__ = game;
    }
    if (params.get("demo") === "gameover") {
      game.elapsed = 74;
      game.runStats.kills = 38;
      game.runStats.totalDamage = 1260;
      game.runStats.maxCombo = 9;
      game.runStats.criticalHits = 7;
      game.runStats.xpOrbs = 31;
      game.player.hp = 0;
      game.enterGameOver();
    } else if (params.get("demo") === "clear") {
      game.runStats.kills = 64;
      game.runStats.totalDamage = 2840;
      game.runStats.maxCombo = 16;
      game.runStats.criticalHits = 12;
      game.runStats.xpOrbs = 58;
      game.clearGame();
      game.clearTimer = 1.3;
      game.clearChoiceVisible = true;
    } else if (params.get("demo") === "combo") {
      game.guideDismissed = true;
      game.noticeTimer = 0;
      game.combo.count = 8;
      game.combo.timer = game.combo.window * 0.72;
      game.combo.displayTimer = 0.72;
      for (const id of ELEMENT_ITEMS) game.player.attributes.levels[id] = 1;
    } else if (params.get("demo") === "bossbreak") {
      game.guideDismissed = true;
      game.noticeTimer = 0;
      game.enemies = [];
      const mid = new Enemy("midBoss", game.player.x - 90, game.player.y - 40, 1, game.level);
      mid.parts.head = false;
      mid.parts.weaponMain = false;
      mid.parts.leftLeg = false;
      mid.headlessChaosTimer = 4.5;
      mid.headlessMoveAngle = Math.random() * FULL_SPIN;
      mid.headlessAttackJitter = 0.8;
      const boss = new Enemy("levelBoss", game.player.x + 120, game.player.y + 12, 3, game.level);
      boss.parts.horn = false;
      boss.parts.weaponSub = false;
      boss.parts.rightArm = false;
      boss.parts.body = false;
      game.enemies.push(mid, boss);
      game.effectManager.bossDismember(mid.x, mid.y, { x: 1, y: 0 }, "weaponMain", 1.05);
      game.effectManager.bossDismember(boss.x, boss.y, { x: -1, y: 0 }, "horn", 1.55);
      game.effects.push({ type: "bossBreakPop", x: boss.x, y: boss.y - boss.radius - 28, life: 0.92, maxLife: 0.92, text: "角破壊" });
    } else if (params.get("demo") === "bloodseal") {
      game.guideDismissed = true;
      game.noticeTimer = 0;
      game.enemies = [];
      const boss = new Enemy("levelBoss", game.player.x + 80, game.player.y - 20, 3, game.level);
      boss.tier = 4;
      const before = game.bloodGoal.progress();
      const result = game.bloodManager.spawnKillBlood(game, boss, { heavy: true, critical: true, boss: true, tier: 4 });
      const after = game.bloodGoal.progress();
      if (after > before) game.showObjectiveGain(boss.x, boss.y, after - before, true, "大血流");
      if (result.completed) game.clearGame();
    }
  });
})();
