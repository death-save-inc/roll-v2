import * as THREE from "three";
import { Actor } from "./actor.js";
import { Interaction } from "../lib/interaction.js";

export class Card extends Actor {
    constructor(controller, name, order, position, scale) {
        super(controller, name, order);
        this.position = position;
        this.scale = scale;
        this.name = name
        this._init();
        this.register();
    }

    async _init() {

        this.model = await this.loadModel()
        this.setParts(this.model)

        await this.setName()
        await this.setRoll()
        await this.setPicture()
        this.controller.scene.add(this.model.scene);

        this.controller.interactions.push(
            new Interaction(this.model.scene.uuid, this.onClick.bind(this), this.onHover.bind(this))
        )

        console.log("group init", this.model.scene.uuid)
    }

    onClick() {
        if (!this.cardUI) {
            this.cardUI = new CardUI(this)
        }

        this.cardUI.show()
    }

    onHover(){
        console.log('hover', this.group)
        this.controller.setSelectedObjects(this.parts.picture)
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
        this.group = model.scene.children[0].children

        this.parts = {
            name: this.group.find(part => part.name === "name"),
            picture: this.group.find(part => part.name === "picture"),
            roll: this.group.find(part => part.name === "roll")
        }
    }

    async setPicture(url) {
        const pictures = ["dragon", "dwarf", "monsters", "wizard"]
        if (!url) return
        this.picture = await this.controller.loadTexture(url)
        this.parts.picture.material = new THREE.MeshBasicMaterial({
            map: this.picture
        });

    }

    async setRoll() {
        const text = await this.controller.loadText("12+1")
        this.controller.scene.add(text)
        this._fitText(text, this.parts.roll)
        this.parts.roll.attach(text)
    }

    async setName() {
        this.nameText = await this.controller.loadText(this.name)
        this.controller.scene.add(this.nameText)
        this._fitText(this.nameText, this.parts.name, true)
        this.parts.name.attach(this.nameText)
    }

    async updateName(newName) {
        this.name = newName
        this.controller.scene.remove(this.nameText);
        this.parts.name.remove(this.nameText)
        this.nameText = await this.controller.loadText(this.name)
        this.controller.scene.add(this.nameText)
        this._fitText(this.nameText, this.parts.name, false)
    }

    _getHeight(mesh) {
        const cube_bbox = new THREE.Box3();
        cube_bbox.setFromObject(mesh);
        return cube_bbox.max.y - cube_bbox.min.y;
    }

    _fitText(text, mesh, useZ = false) {

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
        const scaleFactor = useZ ? (meshSize.z / (textSize.x + 550)) : (meshSize.x / (textSize.x + 300))

        // update text size
        text.scale.set(scaleFactor, scaleFactor, scaleFactor)

        // update bounding box for calulating center of text
        text.updateMatrix()
        const center = getCenterPoint(mesh)
        const offset = (boundingBoxText.max.y - boundingBoxText.min.y) / 2

        console.log(center.x, center.y - (offset / 2) / 100, center.z - 0.05)
        text.position.set(center.x, (center.y - (offset / 2) / 100) + 0.15, center.z - 0.05)
        console.log("fitting")
    }

    update() {

    }
}


function getCenterPoint(mesh) {
    const middle = new THREE.Vector3();
    const geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld(middle);
    return middle;
}


class CardUI {
    constructor(card) {
        this.card = card
    }

    async init() {
        await this.loadTemplate()
        this.findElements()
        this.findElements()
        this.bindEvents()
        await this.render()
    }

    async show() {
        const event = new CustomEvent("raycaster:inactive", {
            bubbles: true,
        });
        document.dispatchEvent(event);
        await this.init()

    }

    async loadTemplate() {
        this.element = document.createElement("div")
        this.element.classList.add("modal")
        this.element.innerHTML = await (await fetch('../templates/card.html')).text();
        document.body.appendChild(this.element)
    }

    hide(e) {
        this.element.remove()
        setTimeout(() => {
            const event = new CustomEvent("raycaster:active", {
                bubbles: true,
            });
            document.dispatchEvent(event);
        }, 500);
    }

    findElements() {
        this.imageEl = this.element.querySelector(".card-editor__image")
        this.inputNameEl = this.element.querySelector(".card-editor__input-name")
        this.closeBtnEl = this.element.querySelector(".card-editor__close")
        this.inputImageEl = this.element.querySelector(".card-editor__input-image")
    }

    bindEvents() {
        this.closeBtnEl.addEventListener("click", this.hide.bind(this))
        this.inputNameEl.addEventListener("change", this.onNameChange.bind(this))
        this.inputImageEl.addEventListener("change", this.onImageChange.bind(this))

    }

    async onNameChange(e) {
        console.log(e)
        await this.card.updateName(e.target.value)
    }

    async onImageChange(e) {
        console.log(e.target.files[0])

        let url = window.URL.createObjectURL(e.target.files[0]);
        this.card.setPicture(url)
        this.imageEl.src = url
    }

    async render() {
        this.inputNameEl.value = this.card.name
    }
}