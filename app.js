import {test} from "./modules/test.js"

export const app = () => {
    const h1 = document.createElement("h1")
    h1.innerHTML = test
    document.body.appendChild(h1)
}

app()

