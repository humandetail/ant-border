# Ant Border

An ant-border ui base on canvas.

## Install

```bash 
pnpm install ant-border
# or
npm install ant-border
# or
yarn add ant-border
```

## Usage

```typescript
import {
  createAntBorder
} from '../src'

import './style.css'

const antBorder = createAntBorder()

antBorder.mount(document.querySelector('#app')!)
  .on('change', (changeSetting, currentSetting, defaultSetting) => {
    console.log({ changeSetting, currentSetting, defaultSetting })
  })
```

## Params

|name|type|default|description|
|-|-|-|-|
|width|number|320|canvas width|
|height|number|200|canvas height|
|fixedRatio|boolean|false|fixed ratio when resize|
|draggable|boolean|true|-|
|resizable|boolean|true|-|
|animation|boolean|true|-|
|dasharray|[number, number]|[20, 6]|seems like svg dasharray|
|pointStyle|PointStyle \| SinglePointStyle|{ r: 4, stroke: '#333', fill: '#fff' }|-|
|borderStyle|{ width: number, stroke: string }|{ width: 1, stroke: '#333' }|-|
|translate|{ x: number, y: number }|{ x: 0, y: 0 }|canvas default transform.translate|

## License

[MIT LICENSE](https://github.com/humandetail/ant-border/LICENSE)
