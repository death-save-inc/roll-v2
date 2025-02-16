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


export class Controller {
  constructor() {
    this._init();
    // this.debug=true
    this._addEffects();

    this._createExampleWorld();
    this._addLights();
    this._addPostProcessing();
    this._startAnimationLoop();
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
    this.camera.position.set(-1, 4, -8);
    this.controls.target=(new THREE.Vector3(0, 4, 0));
    this.modelLoader = new ModelLoader()
    this.renderActions = [];
    document.body.appendChild(this.renderer.domElement)
  }

  _startAnimationLoop() {
    this.renderer.setAnimationLoop(this._update.bind(this));
  }

  _update() {
    this.renderActions.forEach((action) => action.render("add timestmap"));
    this.controls.update();

    if (this.debug) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.composer.render();
    }
  }

  _addLights() {
    this.scene.fog = new THREE.FogExp2(0xaaaaaa, 0.008)

    const light = new THREE.AmbientLight(0xffffff);
    light.intensity = 1.4;

    const dl = new THREE.DirectionalLight(0xffffff, 0.5);
    dl.position.set( 0, 1, 0 ); //default; light shining from top
    dl.castShadow = true; // default false

    this.scene.add(light);
    this.scene.add(dl);
  }

  _addEffects(){
    const lightning = new LightningEffect(this.scene, 2, 0);
    const rain = new RainEffect(this.scene, 2000);
    this.registerRenderAction("lightning",9, () => lightning.update());
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

      const wall = new Wall(this, "wall", 1, new THREE.Vector3(0, 0, 4),new THREE.Vector3(2, 2, 2))

  }

  _addPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const DitherPassInit = DitherPassGen({ THREE, Pass, FullScreenQuad });
    const ditherPass = new DitherPassInit({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      bias: 0.25,
    });

    this.composer.addPass(ditherPass);
  }
}
