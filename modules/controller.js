import * as THREE from "three";
import { RenderAction } from "./lib/renderable.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { DitherPassGen } from "./shaders/dither-pass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { ModelLoader } from "./lib/model-loader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Brazier } from "./actors/brazier.js";
import { LightningEffect } from "./effects/lightning-effect.js";
import { RainEffect } from "./effects/rain-effect.js";
import { Wall } from "./actors/wall.js";
import { TextLoader } from "./lib/text-loader.js";
import { Card } from "./actors/card.js";
import { TextureLoader } from "./lib/texture-loader.js";
import { Raycaster } from "./lib/raycaster.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
export class Controller {
  constructor() {
    this._init();
    // this.debug=true
    this._addEffects();
    this._createExampleWorld();
    this._addLights();
    this._addPostProcessing();
    this._startAnimationLoop();
    console.log(this.clickActions)
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
    return this.textLoader.createText("../modules/RuneScape UF_Regular.json", "0xffffff", text)
  }

  async loadTexture(text) {
    return this.textureLoader.load(text)
  }

  _init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.2,
      2000
    );

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.update();
    this.controls.target = (new THREE.Vector3(0, 4, 0));
    this.camera.position.set(-1, 4, -8);

    this.modelLoader = new ModelLoader()
    this.textLoader = new TextLoader(this)
    this.textureLoader = new TextureLoader(this)
    this.raycaster = new Raycaster(this)
    this.renderActions = [];
    this.interactions = []
    this.selectedObjects = []
    document.body.appendChild(this.renderer.domElement)
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
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
      this.outlinePass.selectedObjects = this.selectedObjects;
      this.renderActions.forEach((action) => action.render("add timestmap"));
      this.controls.update();
      this.raycaster.update()

      if (this.debug) {
        this.renderer.render(this.scene, this.camera);
      } else {
        this.composer.render();
      }
      this.delta = this.delta % this.interval;
    }
  }
  _addLights() {
    const light = new THREE.AmbientLight(0xffffff);
    light.intensity = 1.4;

    const dl = new THREE.DirectionalLight(0xffffff, 0.5);
    dl.position.set(0, 1, 0); //default; light shining from top
    dl.castShadow = true; // default false

    this.scene.add(light);
    this.scene.add(dl);
  }

  _addEffects() {
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
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(1, 1, 1)
    );

    const brazier2 = new Brazier(
      this,
      "brazierLeft",
      1,
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(1, 1, 1)
    );

    const wall = new Wall(this, "wall", 1, new THREE.Vector3(0, 0, 4), new THREE.Vector3(2, 2, 2))
    const card = new Card(this, "Monsters", 1, new THREE.Vector3(0, 4, 1.5), new THREE.Vector3(0.5, 0.5, 0.5))
    const card1 = new Card(this, "Drune", 1, new THREE.Vector3(-3, 4, 1.5), new THREE.Vector3(0.5, 0.5, 0.5))
    const card2 = new Card(this, "LONG NAME", 1, new THREE.Vector3(3, 4, 1.5), new THREE.Vector3(0.5, 0.5, 0.5))

  }

  _addPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const DitherPassInit = DitherPassGen({ THREE, Pass, FullScreenQuad });
    const ditherPass = new DitherPassInit({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      bias: 0.3,
    });

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );

    // -- parameter config
    this.outlinePass.edgeStrength = 300;
    this.outlinePass.edgeGlow = 300;
    this.outlinePass.edgeThickness = 3.0;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.renderToScreen = true
    this.outlinePass.usePatternTexture = true; // patter texture for an object mesh
    this.outlinePass.visibleEdgeColor.set("#ff0000"); // set basic edge color
    this.outlinePass.hiddenEdgeColor.set("#ffff00"); // set edge color when it hidden by other objects


    //shader
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    this.effectFXAA.renderToScreen = true;

    this.composer.addPass(this.effectFXAA);
    this.composer.addPass(ditherPass);

    this.composer.addPass(this.outlinePass);

  }

  setSelectedObjects(obj) {
    console.log("object:", obj)
    this.selectedObjects = obj
  }
}
