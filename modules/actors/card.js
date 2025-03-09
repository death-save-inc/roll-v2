import * as THREE from "three";
import { Actor } from "./actor.js";
import { Interaction } from "../lib/interaction.js";
import {CardUI} from "../UI/card.js"
import { TextRenderer } from "../lib/text-renderer.js";

export class Card extends Actor {
  constructor(controller, name, uuid, imageSrc, playerType="player") {
    super(controller, "name", 0);
    this.textRenderer = new TextRenderer(this.controller)
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
    this.setup()

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
          color: new THREE.Color().setRGB(100 / 255, 100 / 255, 100 / 255),
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
    const texture = this.textRenderer.createTextTexture(this.roll,  this.rollMeshSize, 1024, true,false)
    console.log(texture, this.rollMeshSize, this.roll)
    this.parts.roll.material = new THREE.MeshBasicMaterial({ map: texture });
  }

  setup(){
    this.centerMesh(this.parts.name)
    this.centerMesh(this.parts.roll)
    // Get boundingboxes
    // Get sizes of text component and mesh component
    this.nameMeshSize = this.messureMesh(this.parts.name)
    this.rollMeshSize = this.messureMesh(this.parts.roll)

  }

  centerMesh (mesh){
    mesh.updateMatrix();
    mesh.geometry.computeBoundingBox();  // Get size
    const center = new THREE.Vector3();
    mesh.geometry.boundingBox.getCenter(center);
    mesh.geometry.center();  // Move geometry center to (0,0,0)
    mesh.position.copy(center);
  }

  messureMesh(mesh){
    const boundingBoxNameMesh = new THREE.Box3().setFromObject(mesh);
    return boundingBoxNameMesh.getSize(new THREE.Vector3(0, 0, 0));
  }

  async setName() {
    const texture = this.textRenderer.createTextTexture(this.name,  this.nameMeshSize, 1024, true,false)
    this.parts.name.material = new THREE.MeshBasicMaterial({ map: texture });
  }

  async updateName(newName) {
    this.name = newName;
    this.setName()
    this.updateLocalStorage();
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
