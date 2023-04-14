import {
  createAntBorder
} from '../src'

import './style.css'

const antBorder = createAntBorder()

const oResult = document.querySelector<HTMLDivElement>('#result')!

antBorder.mount(document.querySelector('#app')!)
  .on('change', (change) => {
    oResult.innerHTML = `
      <h2>结果</h2>
      <ul>
        <li>width: ${change.width}px</li>
        <li>height: ${change.height}px</li>
        <li>x: ${change.x}px</li>
        <li>y: ${change.y}px</li>
      </ul>
    `
  })
