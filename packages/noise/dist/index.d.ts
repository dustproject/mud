declare function fetchAndCompileWasmModule(url: URL | string): Promise<WebAssembly.Module>;
declare function lerp(t: number, a: number, b: number): number;
declare function createSplines(splines: [number, number][]): (x: number) => number;
type Perlin = (_x: number, _y: number, _z: number, denom: number) => number;
declare function createPerlin(): Promise<Perlin>;

<<<<<<< HEAD
export { createPerlin, createSplines, fetchAndCompileWasmModule, lerp };
=======
export { Perlin, createPerlin, createSplines, fetchAndCompileWasmModule, lerp };
>>>>>>> a4f03cd4 (chore: export types)
