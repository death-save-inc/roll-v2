import * as THREE from 'three';
import { RenderAction } from '../modules/renderable.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import {DitherShader} from "../modules/shaders/dither.js"
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DitherPassGen } from '../modules/shaders/ditherPass.js';
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

export class Scene{
    constructor(addExample=false){
        this._init()
        this._addPostProcessing()
        this._createExampleWorld()
        this._startAnimationLoop()
    }

    _init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderActions = []

        document.body.appendChild( this.renderer.domElement );
    }

    _startAnimationLoop(){
        this.renderer.setAnimationLoop( this._update.bind(this) );
    }

    _update() {
        this.renderActions.forEach((action) => action.render('add timestmap'))
        // this.renderer.render( this.scene, this.camera );
        this.composer.render();
    }

    registerRenderAction(name, order, callback) {
        const renderAction = new RenderAction(name, order, callback)
        this.renderActions.push(renderAction)
        this.renderActions.sort((a, b) => {
          return a.order - b.order
        })
      }

    _createExampleWorld() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );

        const rotateCube = ()=>{
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        }

        this.scene.add( this.cube );
        this.registerRenderAction("rotate_cube", 1, rotateCube.bind(this))
        this.camera.position.z = 5;
    }

    _addPostProcessing() {

        this.composer = new EffectComposer( this.renderer )
        const renderPass = new RenderPass( this.scene, this.camera );
        this.composer.addPass( renderPass );

        const DitherPassInit = DitherPassGen({ THREE, Pass, FullScreenQuad }); 
        const ditherPass = new DitherPassInit({
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
          bias: 0.025
        });

        this.composer.addPass(ditherPass);

        // const ditherPass = new ShaderPass( DitherPassGen )
        console.log(ditherPass)
        
        this.composer.addPass( ditherPass )
    }
}

