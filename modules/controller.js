//https://freestylized.com/rock/
import * as THREE from "three";
import { RenderAction } from "./lib/renderable.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { DitherPassGen } from "./shaders/dither-pass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { ModelLoader } from "./lib/model-loader.js";
import { Brazier } from "./actors/brazier.js";
import { LightningEffect } from "./effects/lightning-effect.js";
import { RainEffect } from "./effects/rain-effect.js";
import { Wall } from "./actors/wall.js";
import { TextLoader } from "./lib/text-loader.js";
import { TextureLoader } from "./lib/texture-loader.js";
import { Raycaster } from "./lib/raycaster.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { CardManager } from "./managers/card-manager.js";
import { CameraController } from "./lib/camera-controller.js";
import { DieManager } from "./managers/die-manager.js";
import { DungeonManager } from "./managers/dungeon-manager.js";
import { SpellVfxPipeline } from "./managers/spell-vfx-pipeline.js";
import { TreeBillboard } from "./actors/tree.js";
import { Skeleton } from "./actors/skeleton.js";

export class Controller {
  constructor() {
    this._init();
    // this.debug=true

    this._addEffects();
    this._createExampleWorld();
    this._addLights();
    this._addPostProcessing();
    this._startAnimationLoop();
    this.outlinePass.selectedObjects = [];

    window.addEventListener("resize", this._onWindowResize.bind(this), false);
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "d") {
          this.debug = !this.debug;
        }
      },
      false
    );
  }

  registerRenderAction(name, order, callback) {
    const renderAction = new RenderAction(name, order, callback);
    this.renderActions.push(renderAction);
    this.renderActions.sort((a, b) => {
      return a.order - b.order;
    });
  }

  async loadModel(path) {
    const model = await this.modelLoader.loadModel(path);
    return model;
  }

  async loadText(text) {
    return this.textLoader.createText(
      "./modules/RuneScape_UF_Regular.json",
      "0xffffff",
      text
    );
  }

  async loadTexture(text) {
    return this.textureLoader.load(text);
  }

  async _init() {
    this.renderActions = [];
    this.interactions = [];
    this.selectedObjects = [];
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1
    // set background color


    this.cameraController = new CameraController(
      this,
      this.renderer.domElement
    );

    //here pass renderer

    this.modelLoader = new ModelLoader();
    this.textLoader = new TextLoader(this);
    this.textureLoader = new TextureLoader(this);
    this.raycaster = new Raycaster(this);

    this.cardManager = new CardManager(this);
    this.dieManager = new DieManager(this, this.cardManager.players);
    this.dungeonManager = new DungeonManager(this);
    await this.dungeonManager.init();
    document.body.appendChild(this.renderer.domElement);

    this.spellVfxPipeline = new SpellVfxPipeline(this);

    this.registerRenderAction("dice", 4, () => this.dieManager.update());
  }

  _onWindowResize() {
    this.cameraController.camera.aspect =
      window.innerWidth / window.innerHeight;
    this.cameraController.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _startAnimationLoop() {
    this.clock = new THREE.Clock();
    this.delta = 0;
    this.interval = 1 / 60;

    this.renderer.setAnimationLoop(this._update.bind(this));
  }

  _update() {
    this.delta += this.clock.getDelta();
    if (this.delta > this.interval) {
      this.renderActions.forEach((action) => action.render("add timestmap"));
      this.outlinePass.selectedObjects = this.selectedObjects;

      this.cameraController.controls.update();
      this.raycaster.update();

      if (this.debug) {
        this.renderer.render(this.scene, this.cameraController.camera);
      } else {
        this.composer.render();
      }
      this.delta = this.delta % this.interval;
    }
    this.modelLoader.update(this.delta);
    this.cameraController.update();
  }
  _addLights() {

    const hemi = new THREE.HemisphereLight(0x8899aa, 0x332211, 15);
    this.scene.add(hemi);

    const moon = new THREE.DirectionalLight(0xaabbff, 2);
    moon.position.set(8, 20,10);
    moon.target.position.set(0, 4, 2);
    this.scene.add(moon.target);
    this.scene.add(moon);

    //light for background castle walls
    const moon2 = new THREE.DirectionalLight(0xaabbff, 0.5);
    moon2.position.set(-8, 20, -10);
    moon2.target.position.set(0, 4, 2);
    this.scene.add(moon2.target);
    this.scene.add(moon2);

  }

  _addEffects() {
    const loader = new THREE.CubeTextureLoader();
    const skyboxTexture = loader.load([
      "assets/models/textures/skybox/bw_px.png", // right
      "assets/models/textures/skybox/bw_nx.png", // left
      "assets/models/textures/skybox/bw_py.png", // top
      "assets/models/textures/skybox/bw_ny.png", // bottom
      "assets/models/textures/skybox/bw_pz.png", // front
      "assets/models/textures/skybox/bw_nz.png", // back
    ]);

    // Set it as the scene background
    // this.scene.background = skyboxTexture;

    const lightning = new LightningEffect(this.scene, 2, 0);
    const rain = new RainEffect(this.scene, 2000);
    this.registerRenderAction("lightning", 9, () => lightning.update());
    this.registerRenderAction("rain", 10, () => rain.update());
  }

  async _createExampleWorld() {
    const brazier1 = new Brazier(
      this,
      "brazierLeft",
      1,
      new THREE.Vector3(-9, 2, 0),
      new THREE.Vector3(1.5, 1.5, 1.5)
    );

    const brazier2 = new Brazier(
      this,
      "brazierLeft",
      1,
      new THREE.Vector3(9, 2, 0),
      new THREE.Vector3(1.5, 1.5, 1.5)
    );

    const wall = new Wall(
      this,
      "wall",
      1,
      new THREE.Vector3(0, 0, 8),
      new THREE.Vector3(3, 3, 3)
    );

    // random trees minimum distance from camera
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1000 - 500;
      const z = Math.random() * 100 + 50;

      // keep aspect ratio of tree consistent by using same random value for x and z scale
      const randomScale = 10 + Math.random() * 100;
      const scaleX = randomScale;
      const scaleY = randomScale;
      const scaleZ = randomScale;
      new TreeBillboard(
        this,
        `tree${i}`,
        1,
        new THREE.Vector3(x, 50 * Math.random(), 20 + z),
        new THREE.Vector3(scaleX, scaleY, scaleZ)
      );
    }

    // const skeleton = new Skeleton(this, "skeleton", 1, new THREE.Vector3(0, 4, 0), new THREE.Vector3(4,4, 4));
  }

  _addPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.cameraController.camera);
    this.composer.addPass(renderPass);

    const DitherPassInit = DitherPassGen({ THREE, Pass, FullScreenQuad });
    const ditherPass = new DitherPassInit({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      bias: 0.0005,
      excludedColor: new THREE.Vector3(1, 0, 0), // Exclude pure yellow from dithering
      tolerance: 0.1, // Adjust as needed to control how closely colors must match to be excluded
      pixelSize: 2.5, // Bigger = chunkier dither blocks
      scanlineStrength: 0.17, // 0.0 -> off, ~0.08-0.18 nice range
      scanlineDensity: 0.01, // 1.0 = one line per screen pixel row
    });

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.cameraController.camera
    );

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.0 // threshold — important!
    );
    bloomPass.threshold = 0.5; // catch everything
    bloomPass.strength = 1; // stronger bloom
    bloomPass.radius = 1;

    // -- parameter config
    this.outlinePass.edgeStrength = 2;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.edgeThickness = 1;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.usePatternTexture = false; // patter texture for an object mesh
    this.outlinePass.visibleEdgeColor.set("#ffff00"); // set basic edge color
    this.outlinePass.hiddenEdgeColor.set("#ffff00"); // set edge color when it hidden by other objects
    this.composer.addPass(this.outlinePass);

    this.composer.addPass(ditherPass);
    this.composer.addPass(bloomPass);
  }

  setSelectedObjects(obj) {
    this.selectedObjects = obj;
  }
}
