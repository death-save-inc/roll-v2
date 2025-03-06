import * as THREE from "three";
import { Actor } from "./actor.js";
import { Interaction } from "../lib/interaction.js";
import { compress } from "../lib/compress.js";

export class Card extends Actor {
  constructor(controller, name, uuid, imageSrc, playerType="player") {
    super(controller, "name", 0);
    this.position = new THREE.Vector3(0, 2, 0);
    this.desiredPosition = null;
    this.desiredRotation = null;
    this.scale = new THREE.Vector3(0.75, 0.75, 0.75);
    this.imageSrc = imageSrc;
    this.name = name;
    this.uuid = uuid;
    this.image = null;
    this.type = playerType
    this.modifier = 0

    this._init();
    this.register();
  }
  static empty(controller) {
    return new Card(controller, "change me", `card-${crypto.randomUUID()}`);
  }

  static dungeonMaster(controller) {
    return new Card(controller, "Dungeon master", `card-${crypto.randomUUID()}`,null, "dm");
  }

  async _init() {
    this.model = await this.loadModel();
    this.setParts(this.model);

    await this.setName();
    await this.setRoll();
    await this.setPicture(this.imageSrc, false);
    this.controller.scene.add(this.model.scene);

    this.controller.interactions.push(
      new Interaction(
        this.model.scene.uuid,
        this.onClick.bind(this),
        this.onHover.bind(this)
      )
    );
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem(
      this.uuid,
      JSON.stringify({
        name: this.name,
        uuid: this.uuid,
        imageSrc: this.imageSrc,
        type: this.type
      })
    );
    console.log("updating card:", localStorage.getItem(this.uuid));
  }

  onClick() {
    this.showUI();
  }

  showUI() {
    if (!this.cardUI) {
      this.cardUI = new CardUI(this);
    }
    this.cardUI.show();
  }

  onHover() {
    this.controller.setSelectedObjects([this.parts.background]);
  }

  async loadModel() {
    const model = await this.controller.loadModel("assets/models/cardtest.glb");
    model.scene.traverse((mesh) => {
      //Ugly, need to fix later
      if (mesh.type === "Mesh") {
        mesh.material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setRGB(0 / 255, 0 / 255, 0 / 255),
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    model.scene.position.fromArray(this.position.toArray());
    model.scene.children[0].scale.fromArray(this.scale.toArray());
    model.scene.children[0].quaternion.setFromEuler(
      new THREE.Euler(0, 90 * (Math.PI / 180), 0, "XYZ")
    );
    model.scene.quaternion.setFromEuler(
      new THREE.Euler(-90 * (Math.PI / 180), 0, 0, "XYZ")
    );
    return model;
  }

  setParts(model) {
    this.group = model.scene.children[0].children;

    this.parts = {
      background: model.scene.children[0],
      name: this.group.find((part) => part.name === "name"),
      picture: this.group.find((part) => part.name === "picture"),
      roll: this.group.find((part) => part.name === "roll"),
    };
  }

  async setPicture(url, updateState) {
    if (!url) return;
    this.picture = await this.controller.loadTexture(url);
    this.imageSrc = url;
    this.parts.picture.material = new THREE.MeshBasicMaterial({
      map: this.picture,
    });

    if (updateState) {
      this.updateLocalStorage();
    }
  }

  async setRoll() {
    const text = await this.controller.loadText("12+1");
    this.controller.scene.add(text);
    this._fitText(text, this.parts.roll);
    this.parts.roll.attach(text);
  }

  async setName() {
    console.log(this.name);
    this.nameText = await this.controller.loadText(
      this.name || " name not found"
    );
    this.controller.scene.add(this.nameText);
    this._fitText(this.nameText, this.parts.name, true);
    this.parts.name.attach(this.nameText);
  }

  async updateName(newName) {
    this.name = newName;
    this.controller.scene.remove(this.nameText);
    this.parts.name.remove(this.nameText);
    this.nameText = await this.controller.loadText(this.name);
    this.controller.scene.add(this.nameText);
    this._fitText(this.nameText, this.parts.name, false);
    this.updateLocalStorage();
  }

  _getHeight(mesh) {
    const cube_bbox = new THREE.Box3();
    cube_bbox.setFromObject(mesh);
    return cube_bbox.max.y - cube_bbox.min.y;
  }

  _fitText(text, mesh, useZ = false) {
    //make sure boundingboxes are up to date
    text.updateMatrix();
    mesh.updateMatrix();

    // Get boundingboxes
    const boundingBoxText = new THREE.Box3().setFromObject(text);
    const boundingBoxMesh = new THREE.Box3().setFromObject(mesh);

    // Get sizes of text component and mesh component
    const textSize = boundingBoxText.getSize(new THREE.Vector3(0, 0, 0));
    const meshSize = boundingBoxMesh.getSize(new THREE.Vector3(0, 0, 0));

    // calculate scale factor
    const scaleFactor = useZ
      ? meshSize.z / (textSize.x + 550)
      : meshSize.x / (textSize.x + 300);

    // update text size
    text.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // update bounding box for calulating center of text
    text.updateMatrix();
    const center = this.getCenterPoint(mesh);
    const offset = (boundingBoxText.max.y - boundingBoxText.min.y) / 2;

    text.position.set(
      center.x,
      center.y - offset / 2 / 100 + 0.15,
      center.z - 0.05
    );

    text.rotateX(90 * (Math.PI / 180))
  }
  getCenterPoint(mesh) {
    const middle = new THREE.Vector3();
    const geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld(middle);
    return middle;
  }
  update() {
    if (!this.model) return;

    if (this.desiredRotation) {
      this.model.scene.quaternion.slerp(this.desiredRotation, 0.02);
    }

    if (this.desiredPosition) {
      this.model.scene.position.lerp(this.desiredPosition, 0.05);
    }
  }
}

class CardUI {
  constructor(card) {
    this.card = card;
  }

  async init() {
    await this.loadTemplate();
    this.findElements();
    this.findElements();
    this.bindEvents();
    await this.render();
  }

  async show() {
    const event = new CustomEvent("raycaster:inactive", {
      bubbles: true,
    });
    document.dispatchEvent(event);
    await this.init();
  }

  async loadTemplate() {
    this.element = document.createElement("div");
    this.element.classList.add("modal");
    this.element.innerHTML = await (
      // await fetch("../templates/card.html")
      await fetch("https://raw.githubusercontent.com/Roll-for-Initiative/roll-v2/refs/heads/main/templates/card.html")
    ).text();
    document.body.appendChild(this.element);
  }

  hide(e) {
    this.element.remove();
    setTimeout(() => {
      const event = new CustomEvent("raycaster:active", {
        bubbles: true,
      });
      document.dispatchEvent(event);
    }, 500);
  }

  findElements() {
    this.imageEl = this.element.querySelector(".card-editor__image");
    this.inputNameEl = this.element.querySelector(".card-editor__input-name");
    this.closeBtnEl = this.element.querySelector(".card-editor__close");
    this.inputImageEl = this.element.querySelector(".card-editor__input-image");
  }

  bindEvents() {
    this.closeBtnEl.addEventListener("click", this.hide.bind(this));
    this.inputNameEl.addEventListener("change", this.onNameChange.bind(this));
    this.inputImageEl.addEventListener("change", this.onImageChange.bind(this));
  }

  async onNameChange(e) {
    await this.card.updateName(e.target.value);
  }

  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  async onImageChange(e) {
    // let url = window.URL.createObjectURL(e.target.files[0]);
    const url = await compress(e.target.files[0], 140);
    this.card.setPicture(url, true);
    this.imageEl.src = url;
  }

  async render() {
    this.inputNameEl.value = this.card.name;
    if (this.card.imageSrc) {
      this.imageEl.src = this.card.imageSrc;
    }
  }
}
