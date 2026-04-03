import { EventBus } from '../lib/eventbus.js'
import { LoadTemplate } from '../lib/template.js'

export class AddPlayerUI {
  constructor() {
    this.template = null
    this.init()
  }

  async init() {
    this.template = await LoadTemplate('players-editor-hud.html')
    this.createElement()
    this.findElements()
    this.bindEvents()
  }

  async loadTemplate(url) {
    return await (await fetch(url)).text()
  }

  createElement() {
    this.element = document.createElement('div')
    this.element.innerHTML = this.template
    const parent = document.querySelector('.hud')
    if (!parent) {
      console.error('No parent element found for AddPlayerUI')
      return
    }
    this.element.classList.add('player-actions')
    parent.appendChild(this.element)
  }

  hide(e) {
    this.element.style.display = 'none'
  }

  show(e) {
    this.element.style.display = 'unset'
  }

  findElements() {
    this.addButtonEl = this.element.querySelector('.player-actions__button')
  }

  bindEvents() {
    this.addButtonEl.addEventListener('click', () => {
      EventBus.emit('player:add', {})
    })
  }
}
