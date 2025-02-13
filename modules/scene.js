import * as THREE from 'three';
import { RenderAction } from '../modules/renderable.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import {DitherShader} from "../modules/shaders/dither.js"
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DitherPassGen } from '../modules/shaders/ditherPass.js';
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { ModelLoader } from '../modules/model-loader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBrazier } from '../modules/brazier.js';

export class Scene {
    constructor(addExample = false) {
        this._init()
        this._createExampleWorld()
        this._addLights()
        this._addPostProcessing()
        this._startAnimationLoop()
    }

    registerRenderAction(name, order, callback) {
        const renderAction = new RenderAction(name, order, callback)
        this.renderActions.push(renderAction)
        this.renderActions.sort((a, b) => {
            return a.order - b.order
        })
    }

    async loadModel(path) {
        const model = await this.modelLoader.loadModel(path)
        console.log(model)
        return model
    }

    _init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 2000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        //controls.update() must be called after any manual changes to the camera's transform
        this.camera.position.set( 0, 5, -8);

        this.controls.update();

        this.modelLoader = new ModelLoader()

        this.renderActions = []

        document.body.appendChild(this.renderer.domElement);
    }

    _startAnimationLoop() {
        this.renderer.setAnimationLoop(this._update.bind(this));
    }

    _update() {
        this.renderActions.forEach((action) => action.render('add timestmap'))
        this.controls.update();

        if (this.debug){
            this.renderer.render(this.scene, this.camera);
        }else {
            this.composer.render();
        }
    }

    _addLights() {
        const light = new THREE.AmbientLight(0xffffff); 
        light.intensity = 1
        const dl = new THREE.DirectionalLight(0xffffff,  0.5)
        this.scene.add(light);
        this.scene.add(dl)
    }

    async _createExampleWorld() {
        createBrazier(this, new THREE.Vector3(-4,0,0), new THREE.Vector3(1,1,1))
        createBrazier(this, new THREE.Vector3(4,0,0), new THREE.Vector3(1,1,1))
    }

    _addPostProcessing() {
        this.composer = new EffectComposer(this.renderer)
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const DitherPassInit = DitherPassGen({ THREE, Pass, FullScreenQuad });
        const ditherPass = new DitherPassInit({
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
            bias: 0.25
        });

        this.composer.addPass(ditherPass);
    }
}

