
export class Actor {
    constructor(controller,name, order){
        this.controller = controller
        this.name = name
        this.renderOrder = order
        this.ready = false
    }

    async _init(){
        console.error("init not implemented")
    }

    update(){
        console.error("update not implemented")
    }

    register(){
        this.controller.registerRenderAction(this.name, this.renderOrder, ()=>this.update());
    }
}