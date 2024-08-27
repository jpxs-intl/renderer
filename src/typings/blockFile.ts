export interface BlockFile {
  version: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  floor: number;
  ceiling: number;
  wallNX: number;
  wallPZ: number;
  wallPX: number;
  wallNZ: number;
  surfaces: Surface[];
  boxes: Box[];
}

export interface Box {
  vertices: number[][];
  textures: number[];
  sideFlag: number;
}

export interface Surface {
  orderX: number;
  orderY: number;
  tessX: number;
  tessY: number;
  texture: number;
  projectTexture: number;
  data: {
    vertex: [number, number, number];
    texCoord: [number, number];
  }[][]
}

export interface PortalFile {
  version: number
  portals: Portal[]
}

export interface Portal {
  type: number
  x: number
  width: number
  y: number
  height: number
  doors: Door[]
  windows: Window[]
  beams: Beam[]
}

export interface Door {
  doorType: number
  x: number
  y: number
}

export interface Window {
  windowType: number
  x: number
  y: number
  width: number
  height: number
}

export interface Beam {
  beamType: number
  x: number
  y: number
  width: number
  height: number
}