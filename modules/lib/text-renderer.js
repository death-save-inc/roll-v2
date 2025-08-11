import { FontLoader } from "three/addons/loaders/FontLoader.js";
import * as THREE from "three";

export class TextRenderer {
  constructor(controller) {
    this.controller = controller;
    this.loader = new FontLoader();
  }

  createTextTexture(text, meshSize, scaleFactor = 1024,maxFontSize= null, font = "jacquard12", backgroundColor = "#00000000") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Initial large canvas to measure text size
    canvas.width = (meshSize.z ) * scaleFactor;
    canvas.height = (meshSize.y )* scaleFactor; 

   // Apply flipping before drawing
    ctx.save();

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";

    // Dynamically adjust font size to fit snugly
    let fontSize = Math.min(canvas.width / text.length, canvas.height * 0.8);
    if (maxFontSize && fontSize > maxFontSize){
      fontSize = maxFontSize
    }

    ctx.font = `${fontSize}px ${font}`;

    // Measure actual text size
    let metrics = ctx.measureText(text);
    let textWidth = metrics.width;
    let textHeight = fontSize * 1.2; // Approximate height
    // Resize the canvas to match the text size exactly
    canvas.width =textWidth < 1500 ?  Math.ceil(textWidth + 200) :  Math.ceil(textWidth + 40) // Add a small margin
    canvas.height = Math.ceil(textHeight + 0);

    // Redraw text on the resized canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `${fontSize}px ${font}`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create high-resolution texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;  // Allows horizontal flipping
    texture.wrapT = THREE.RepeatWrapping;  // Allows vertical flipping
    texture.repeat.set(1, -1);  // Flip horizontally
    texture.center.set(0.5,0.5)

    return texture;
  }
}
