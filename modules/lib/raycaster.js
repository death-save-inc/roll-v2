import * as THREE from "three";
export class Raycaster {
    constructor(controller) {
        this.controller = controller
        this.init()
    }

    init() {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2(-10,-10);
        this.currentHover = null

        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this))
    }

    onPointerMove(event) {
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera( this.pointer.clone(), this.controller.camera );
        this.hover()
    }

    update() {
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.pointer, this.controller.camera);
        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(this.controller.scene.children);
    }

    hover(){
        for (let i = 0; i < this.intersects.length; i++) {
            if (this.intersects[i].object.type === "Mesh"){
                if (this.intersects[i].object.parent){
                    const action = this.controller.interactions.find(action => action.id === this.intersects[i].object.parent.uuid )
                    if (action && action.hover){
                        action.hover()
                        return
                    }
                }
            }
        }
    }

    onClick() {
        for (let i = 0; i < this.intersects.length; i++) {
            if (this.intersects[i].object.type === "Mesh"){
                if (this.intersects[i].object.parent){
                    const action = this.controller.interactions.find(action => action.id === this.intersects[i].object.parent.uuid )
                    if (action && action.click){
                        action.click()
                        return
                    }
                }
            }
        }
    }
}

