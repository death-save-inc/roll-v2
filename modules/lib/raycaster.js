import * as THREE from "three";
export class Raycaster {
    constructor(controller) {
        this.controller = controller
        this.active = true
        this.init()
    }

    init() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(0)
        this.pointer = new THREE.Vector2(-10,-10);
        this.currentHover = null

        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this))
        window.addEventListener('raycaster:active',()=>{this.active = true; console.log('active!')})
        window.addEventListener('raycaster:inactive',()=>{this.active = false;console.log('inctive!')})
    }

    onPointerMove(event) {
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera( this.pointer.clone(), this.controller.camera );
        this.hover()
    }

    update() {
        if (!this.active) return
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.pointer, this.controller.camera);
        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(this.controller.scene.children);
    }

    hover(){
        if (!this.active) return

        if (!this.intersects || this.intersects.length === 0){
            this.controller.setSelectedObjects([])
        }else{
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
    }

    onClick() {
        if (!this.active) return
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

