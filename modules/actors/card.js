import * as THREE from "three";
import { Actor } from "./actor.js";

export class Card extends Actor {
    constructor(controller, name, order, position, scale) {
        super(controller, name, order);
        this.position = position;
        this.scale = scale;
        this._init();
        this.register();
    }

    async _init() {

        const model = await this.loadModel()
        this.setParts(model)
        await this.setName()
        await this.setRoll()
        await this.setPicture()

        this.controller.scene.add(model.scene);
    }

    async loadModel() {
        const model = await this.controller.loadModel("assets/models/cardtest.glb");
        model.scene.traverse((mesh) => {
            //Ugly, need to fix later
            console.log(mesh)
            if (mesh.type === "Mesh") {
                mesh.material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setRGB(0 / 255, 0 / 255, 0 / 255),
                });
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        })

        model.scene.position.fromArray(this.position.toArray());
        model.scene.scale.fromArray(this.scale.toArray());
        model.scene.rotateY(90 * (Math.PI / 180))
        return model
    }

    setParts(model) {
        const group = model.scene.children[0].children

        this.parts = {
            name: group.find(part => part.name === "name"),
            picture: group.find(part => part.name === "picture"),
            roll: group.find(part => part.name === "roll")
        }
    }

    async setPicture() {


        const pictures = ["dragon", "dwarf", "monsters", "wizard"]
        const random = Math.floor(Math.random() * pictures.length);

        const picture = await this.controller.loadTexture(`assets/models/textures/${pictures[random]}.jpg`)
        this.parts.picture.material = new THREE.MeshBasicMaterial({
            map: picture
        });
    }

    async setRoll() {
        const text = await this.controller.loadText("12+1")
        this.controller.scene.add(text)
        this._fitText(text, this.parts.roll)
        this.parts.roll.attach(text)
    }

    async setName() {
        const text = await this.controller.loadText(this.name)
        this.controller.scene.add(text)
        this._fitText(text, this.parts.name, true)
        this.parts.name.attach(text)
    }

    _getHeight(mesh) {
        const cube_bbox = new THREE.Box3();
        cube_bbox.setFromObject(mesh);
        return cube_bbox.max.y - cube_bbox.min.y;
    }

    _fitText(text, mesh, useZ=false) {
       
        //make sure boundingboxes are up to date
        text.updateMatrix()
        mesh.updateMatrix()
       
        // Get boundingboxes
        const boundingBoxText = new THREE.Box3().setFromObject(text)
        const boundingBoxMesh = new THREE.Box3().setFromObject(mesh)
       
        // Get sizes of text component and mesh component
        const textSize = boundingBoxText.getSize(new THREE.Vector3(0, 0, 0))
        const meshSize = boundingBoxMesh.getSize(new THREE.Vector3(0, 0, 0))

        // calculate scale factor
        const scaleFactor = useZ? (meshSize.z / (textSize.x + 550)) : (meshSize.x / (textSize.x + 300)) 

        // update text size
        text.scale.set( scaleFactor, scaleFactor, scaleFactor)

        // update bounding box for calulating center of text
        text.updateMatrix()
        const center = getCenterPoint(mesh)
        const offset = (boundingBoxText.max.y - boundingBoxText.min.y) /2
        
        console.log(center.x, center.y - (offset/2)/100 , center.z - 0.05)
        text.position.set(center.x, (center.y - (offset/2)/100) + 0.15 , center.z - 0.05)
    }

    update() {

    }
}


function getCenterPoint(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld(middle);
    return middle;
}