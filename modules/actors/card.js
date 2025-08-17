import * as THREE from "three";
import { Actor } from "./actor.js";
import { Interaction } from "../lib/interaction.js";
import { CardUI } from "../UI/card.js";
import { TextRenderer } from "../lib/text-renderer.js";
import { LocalStorageManager } from "../lib/manage-local-storage.js";

export class Card extends Actor {
  constructor(controller, name, uuid, imageSrc, playerType, modifier, color) {
    super(controller, "name", 0);
    this.textRenderer = new TextRenderer(this.controller);
    this.position = new THREE.Vector3(0, -2, 0);
    this.desiredPosition = null;
    this.desiredRotation = null;
    this.scale = new THREE.Vector3(0.75, 0.75, 0.75);
    this.imageSrc = imageSrc;
    this.name = name;
    this.uuid = uuid;
    this.image = null;
    this.type = playerType || playerType;
    this.modifier = modifier || 0;
    this.color = color || 0xff00ff;

    this.init();
  }
  static empty(controller) {
    return new Card(
      controller,
      "change me",
      `card-${(crypto.randomUUID(), "assets/models/textures/dragon.jpg")}`
    );
  }

  static dungeonMaster(controller) {
    return new Card(
      controller,
      "Dungeon master",
      `card-${crypto.randomUUID()}`,
      null,
      "dm"
    );
  }

  async init() {
    await this.generateCard();

    this.controller.interactions.push(
      new Interaction(
        this.mesh.uuid,
        this.onClick.bind(this),
        this.onHover.bind(this)
      )
    );

    await this.updateLocalStorage();
    this.register();
    this.controller.cardManager.registerCard(this);
  }

  async updateLocalStorage() {
    try {
      const storageManager = LocalStorageManager.getInstance();
      const saveData = storageManager.getCurrentSave();
      const players = await saveData.get("players");

      if (!Array.isArray(players)) {
        console.warn("Card.updateLocalStorage: players array missing or invalid:", players);
        return;
      }

      const index = players.findIndex((p) => p.uuid === this.uuid);
      const payload = {
        name: this.name,
        uuid: this.uuid,
        imageSrc: this.imageSrc,
        type: this.type,
        modifier: this.modifier,
        color: this.color,
      };

      if (index !== -1) {
        players[index] = payload;
      } else {
        players.push(payload);
      }

      await storageManager.saveToExistingSlot("players", players);
      console.log("Card.updateLocalStorage: saved player entry", this.uuid);
    } catch (error) {
      console.error("Card.updateLocalStorage failed:", error);
    }
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
    this.controller.setSelectedObjects([this.mesh]);
  }

  updateName(newName) {
    this.name = newName;
    this.updateCardImage(0);
    this.updateLocalStorage();
  }

  updateModifier(newModifier) {
    this.modifier = newModifier;
    this.updateLocalStorage();
  }

  updateDieColor(color) {
    this.color = color;
    this.die.updateDieMat(color);
    this.updateLocalStorage();
  }

  async updateImageSrc(imageSrc) {
    this.imageSrc = imageSrc;
    this.updateCardImage(0);
    await this.updateLocalStorage();
    // notify linked player owner if exists (avoid triggering a loop)
    if (this.owner) {
      try {
        // update owner's property directly and persist
        this.owner.imageSrc = imageSrc;
        if (typeof this.owner.saveUpdate === 'function') {
          this.owner.saveUpdate();
        }
        console.log('Card.updateImageSrc: owner updated imageSrc for', this.uuid);
      } catch (err) {
        console.warn('Failed to notify player of image change', err);
      }
    }
  }

  setRoll() {}

  update() {
    if (!this.mesh) return;

    if (this.desiredRotation) {
      this.mesh.quaternion.slerp(this.desiredRotation, 0.02);
    }

    if (this.desiredPosition) {
      this.mesh.position.lerp(this.desiredPosition, 0.05);
    }
  }

  delete() {
    this.controller.setSelectedObjects([]);

    if (this.mesh) {
      this.controller.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.forEach((mat) => mat.dispose());
    }
  }

  randomCharacters(length = 4) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  async generateCardTexture(idx) {
    if (!this.imageSrc) {
      this.imageSrc = "assets/models/textures/dragon.jpg";
    }

    const texture = await this.controller.loadTexture(this.imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");

    //Background
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 25;
    const glyphX = padding / 2;
    const glyphY = padding;
    const glyphWidth = canvas.width - padding;
    const glyphHeight = canvas.height - padding * 2;

    //Glyph Background Rect
    ctx.fillStyle = "#1A1B20";
    ctx.fillRect(glyphX, glyphY, glyphWidth, glyphHeight);

    //Inner Padded Rect
    const innerPadding = padding / 2;
    const innerX = glyphX + innerPadding;
    const innerY = glyphY + innerPadding;
    const innerWidth = glyphWidth - innerPadding * 2;
    const innerHeight = glyphHeight - innerPadding * 2;

    //Glyph Text (with clipping and Y-centering)
    const text = this.name.length > 4 ? this.name.slice(0, 4) : this.name;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#595959";

    // Use large font size
    let fontSize = innerHeight * 1.4;
    ctx.font = `${fontSize}px lithops, sans-serif`;

    const centerX = innerX + innerWidth / 2;

    // Measure for vertical alignment
    const metrics = ctx.measureText(text);
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const centerY =
      innerY +
      innerHeight / 2 +
      (metrics.actualBoundingBoxAscent - textHeight / 2);

    //Clip to padded box
    ctx.save();
    ctx.beginPath();
    ctx.rect(innerX, innerY, innerWidth, innerHeight);
    ctx.clip();

    ctx.fillText(text, centerX, centerY);
    ctx.restore();

    //Optional Debug (Visual Aid for Alignment)
    // ctx.strokeStyle = 'red';
    // ctx.strokeRect(glyphX, glyphY, glyphWidth, glyphHeight);
    // ctx.strokeStyle = 'lime';
    // ctx.strokeRect(innerX, innerY, innerWidth, innerHeight);

    //Oval Clipping Path for Character Image
    const xRadius = canvas.width / 2 - padding * 2;
    const yRadius = canvas.height / 2 - padding * 2;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2,
      xRadius + 20,
      yRadius,
      0,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(texture.image, 30, 50, 452, 668);
    ctx.restore();

    //Top-left index number
    ctx.fillStyle = "yellow";
    ctx.font = "bold 250px jacquard12, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const size = ctx.measureText(idx | 0);
    ctx.fillText(
      idx | 0,
      padding,
      size.actualBoundingBoxAscent + padding * 1.5
    );

    //Bottom Name Centered
    ctx.font = "bold 120px jacquard12, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.name, canvas.width / 2, canvas.height - padding * 2);

    return new THREE.CanvasTexture(canvas);
  }

  async generateCard() {
    const frontTexture = await this.generateCardTexture(1);

    // const link = document.createElement('a');
    // link.download = `${this.name}.png`
    // link.href = frontTexture.image.toDataURL('image/png');
    // link.click();

    const frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      transparent: true,
    });

    const backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sideMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });

    const materials = [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      backMaterial,
      frontMaterial,
    ];
    const height = 4;
    const ratio = 2 / 3;
    const geometry = new THREE.BoxGeometry(height * ratio, height, 0.02);
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.position.copy(this.position);

    this.controller.scene.add(this.mesh);
  }

  async updateCardImage(idx) {
    if (!this.mesh) return;
    const frontTexture = await this.generateCardTexture(idx);
    this.mesh.material[5].map = frontTexture;
    this.mesh.material[5].needsUpdate = true;
  }
}
