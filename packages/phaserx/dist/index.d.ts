import { Observable } from 'rxjs';
import { CoordMap } from '@latticexyz/utils';
import * as mobx from 'mobx';

type TweenBuilderConfig = {
    targets: Phaser.GameObjects.Sprite;
} & Omit<Phaser.Types.Tweens.TweenBuilderConfig, "targets">;
/**
 * Add a tween to the provided game object.
 * @returns Promise that resolves when the tween is done.
 */
declare function tween(config: TweenBuilderConfig, options?: {
    keepExistingTweens?: boolean;
}): Promise<void>;
declare function removeAllTweens(gameObject: Phaser.GameObjects.GameObject): void;

declare function mod(a: number, b: number): number;

declare function defineScene(options: {
    key: string;
    preload?: (scene: Phaser.Scene) => void;
    create?: (scene: Phaser.Scene) => void;
    update?: (scene: Phaser.Scene) => void;
}): {
    new (): {
        preload(): void;
        create(): void;
        update(): void;
        sys: Phaser.Scenes.Systems;
        game: Phaser.Game;
        anims: Phaser.Animations.AnimationManager;
        cache: Phaser.Cache.CacheManager;
        registry: Phaser.Data.DataManager;
        sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager;
        textures: Phaser.Textures.TextureManager;
        events: Phaser.Events.EventEmitter;
        cameras: Phaser.Cameras.Scene2D.CameraManager;
        add: Phaser.GameObjects.GameObjectFactory;
        make: Phaser.GameObjects.GameObjectCreator;
        scene: Phaser.Scenes.ScenePlugin;
        children: Phaser.GameObjects.DisplayList;
        lights: Phaser.GameObjects.LightsManager;
        data: Phaser.Data.DataManager;
        input: Phaser.Input.InputPlugin;
        load: Phaser.Loader.LoaderPlugin;
        time: Phaser.Time.Clock;
        tweens: Phaser.Tweens.TweenManager;
        physics: Phaser.Physics.Arcade.ArcadePhysics;
        matter: Phaser.Physics.Matter.MatterPhysics;
        facebook: Phaser.FacebookInstantGamesPlugin;
        scale: Phaser.Scale.ScaleManager;
        plugins: Phaser.Plugins.PluginManager;
        renderer: Phaser.Renderer.WebGL.WebGLRenderer | Phaser.Renderer.Canvas.CanvasRenderer;
    };
};

declare function createChunks(worldView$: Observable<Area>, chunkSize: number, padding?: number): {
    addedChunks$: Observable<Coord>;
    removedChunks$: Observable<Coord>;
    chunkSize: number;
    visibleChunks: {
        current: CoordMap<boolean>;
    };
};

type ObjectPoolReturnType<Type> = Type extends keyof GameObjectTypes ? EmbodiedEntity<Type> : EmbodiedEntity<keyof GameObjectTypes> | undefined;
declare function createObjectPool(scene: Phaser.Scene): {
    get: <Type extends "Sprite" | "Rectangle" | "Line" | "Text" | "Existing">(entity: number | string, type: Type) => ObjectPoolReturnType<Type>;
    remove: (entity: number | string) => void;
    objects: mobx.ObservableMap<string, EmbodiedEntity<"Sprite" | "Rectangle" | "Line" | "Text">>;
    groups: {
        Sprite: Phaser.GameObjects.Group;
        Rectangle: Phaser.GameObjects.Group;
        Line: Phaser.GameObjects.Group;
        Text: Phaser.GameObjects.Group;
    };
    ignoreCamera: (cameraId: number, ignore: boolean) => void;
};

declare enum AssetType {
    Image = 0,
    SpriteSheet = 1,
    MultiAtlas = 2
}
declare const GameObjectClasses: {
    Sprite: typeof Phaser.GameObjects.Sprite;
    Rectangle: typeof Phaser.GameObjects.Rectangle;
    Line: typeof Phaser.GameObjects.Line;
    Text: typeof Phaser.GameObjects.Text;
};

declare function createCulling(objectPool: ObjectPool, camera: Camera, chunks: Chunks): {
    dispose: () => void;
};

interface ChunkedTilemap<TileKeys extends number, LayerKeys extends string> {
    size: () => number;
    putTileAt: (coord: WorldCoord, tile: TileKeys, layer?: LayerKeys, tint?: number) => void;
    dispose: () => void;
    setVisible: (visible: boolean) => void;
    visible: {
        current: boolean;
    };
    tileWidth: number;
    tileHeight: number;
}
interface VirtualTilemap<TileKeys extends number, LayerKeys extends string> extends ChunkedTilemap<TileKeys, LayerKeys> {
    tiles: {
        [key in LayerKeys]: CoordMap<number>;
    };
}
interface AnimatedTilemap<TileKeys extends number, LayerKeys extends string, AnimationKeys extends string> extends VirtualTilemap<TileKeys, LayerKeys> {
    putAnimationAt: (coord: WorldCoord, animationKey: AnimationKeys, layer?: LayerKeys) => void;
    removeAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
    pauseAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
    resumeAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
    registerAnimation: (animationKey: AnimationKeys, frames: TileAnimation<TileKeys>) => void;
}
type TileAnimation<TileKeys extends number> = TileKeys[];

type ChunkedTilemapConfig<TileKeys extends number, LayerKeys extends string> = {
    scene: Phaser.Scene;
    tilesets: {
        [key: string]: Phaser.Tilemaps.Tileset;
    };
    layerConfig: {
        layers: {
            [id in LayerKeys]: {
                tilesets: string[];
                hasHueTintShader?: boolean;
            };
        };
        defaultLayer: LayerKeys;
    };
    chunks: Chunks;
    backgroundTile: [number, ...number[]];
    tiles: {
        [layer in LayerKeys]: CoordMap<TileKeys>;
    };
    tileWidth: number;
    tileHeight: number;
};
declare function createChunkedTilemap<TileKeys extends number, LayerKeys extends string>(params: ChunkedTilemapConfig<TileKeys, LayerKeys>): ChunkedTilemap<TileKeys, LayerKeys>;

declare function createVirtualTilemap<TileKeys extends number, LayerKeys extends string>(config: Omit<ChunkedTilemapConfig<TileKeys, LayerKeys>, "tiles">): VirtualTilemap<TileKeys, LayerKeys>;

declare function createAnimatedTilemap<TileKeys extends number, LayerKeys extends string, AnimationKeys extends string>(config: Omit<ChunkedTilemapConfig<TileKeys, string>, "tiles"> & {
    animationInterval: number;
}): AnimatedTilemap<TileKeys, LayerKeys, AnimationKeys>;

type Key = keyof typeof Phaser.Input.Keyboard.KeyCodes | "POINTER_LEFT" | "POINTER_RIGHT";
declare function createInput(inputPlugin: Phaser.Input.InputPlugin): {
    keyboard$: Observable<Phaser.Input.Keyboard.Key>;
    pointermove$: Observable<{
        pointer: Phaser.Input.Pointer;
    }>;
    pointerdown$: Observable<{
        pointer: Phaser.Input.Pointer;
        event: MouseEvent;
    }>;
    pointerup$: Observable<{
        pointer: Phaser.Input.Pointer;
        event: MouseEvent;
    }>;
    click$: Observable<Phaser.Input.Pointer>;
    doubleClick$: Observable<Phaser.Input.Pointer>;
    rightClick$: Observable<Phaser.Input.Pointer>;
    drag$: Observable<Area | undefined>;
    pressedKeys: mobx.ObservableSet<Key>;
    dispose: () => void;
    disableInput: () => void;
    enableInput: () => void;
    setCursor: (cursor: string) => void;
    enabled: {
        current: boolean;
    };
    onKeyPress: (keySelector: (pressedKeys: Set<Key>) => boolean, callback: () => void) => void;
};

type Camera = {
    phaserCamera: Phaser.Cameras.Scene2D.Camera;
    worldView$: Observable<Phaser.Cameras.Scene2D.Camera["worldView"]>;
    zoom$: Observable<number>;
    ignore: (objectPool: ObjectPool, ignore: boolean) => void;
    dispose: () => void;
    centerOnCoord: (tileCoord: Coord, tileWidth: number, tileHeight: number) => void;
    centerOn: (x: number, y: number) => void;
    setScroll: (x: number, y: number) => void;
    setZoom: (zoom: number) => void;
};
type GameObjectTypes = typeof GameObjectClasses;
type GameObject<Type extends keyof GameObjectTypes> = InstanceType<GameObjectTypes[Type]>;
type GameObjectFunction<Type extends keyof GameObjectTypes> = (gameObject: GameObject<Type>) => Promise<void> | void;
type GameScene = ReturnType<typeof defineScene>;
/**
 * @id: Unique id of the component to handle updating the same component
 * @now: Use for things like visual effects that are only relevant in this moment
 * @once: Use for setting parameters that should be set when initializing
 * @update: Use for adding update functions that are called at 60 FPS
 */
type GameObjectComponent<Type extends keyof GameObjectTypes> = {
    id: string;
    now?: GameObjectFunction<Type>;
    once?: GameObjectFunction<Type>;
    update?: GameObjectFunction<Type>;
};
type Area = {
    x: number;
    y: number;
    width: number;
    height: number;
};
type Coord = {
    x: number;
    y: number;
};
type PixelCoord = Coord;
type ChunkCoord = Coord;
type WorldCoord = Coord;
type Chunks = ReturnType<typeof createChunks>;
type ObjectPool = ReturnType<typeof createObjectPool>;
type Culling = ReturnType<typeof createCulling>;
type Input = ReturnType<typeof createInput>;
type EmbodiedEntity<Type extends keyof GameObjectTypes> = {
    setComponent: (component: GameObjectComponent<Type>) => void;
    hasComponent: (id: string) => boolean;
    removeComponent: (id: string, stop?: boolean) => void;
    spawn: () => void;
    despawn: () => void;
    position: Coord;
    id: string;
    setCameraFilter: (filter: number) => void;
    type: Type;
};
type Assets = {
    [key: string]: Asset;
};
type TilesetConfig<A extends Assets> = {
    [key: string]: {
        assetKey: keyof A & string;
        tileWidth: number;
        tileHeight: number;
    };
};
type LayerConfig<A extends Assets, T extends TilesetConfig<A>> = {
    [key: string]: {
        tilesets: (keyof T & string)[];
        hasHueTintShader?: boolean;
    };
};
type MapConfig<A extends Assets, T extends TilesetConfig<A>, L extends LayerConfig<A, T>> = {
    chunkSize: number;
    tileWidth: number;
    tileHeight: number;
    layers: {
        layers: L;
        defaultLayer: keyof L & string;
    };
    backgroundTile: [number, ...number[]];
    animationInterval: number;
    tileAnimations?: {
        [key: string]: TileAnimation<number>;
    };
};
type AnyMapConfig<A extends Assets, T extends TilesetConfig<A>> = MapConfig<A, T, LayerConfig<A, T>>;
type AnyTilesetConfig = TilesetConfig<Assets>;
type AnySceneConfig = SceneConfig<Assets, {
    [key: string]: Sprite<Assets>;
}, AnyTilesetConfig, MapsConfig<Assets, AnyTilesetConfig>, Animation<Assets>[]>;
type MapsConfig<A extends Assets, T extends TilesetConfig<A>> = {
    [key: string]: AnyMapConfig<A, T>;
};
type Sprite<A extends Assets> = {
    assetKey: keyof A & string;
    frame?: string | number;
};
type Animation<A extends Assets> = {
    key: string;
    assetKey: keyof A & string;
    startFrame: number;
    endFrame: number;
    frameRate: number;
    repeat: number;
    prefix?: string;
    suffix?: string;
};
type SceneConfig<A extends Assets, S extends {
    [key: string]: Sprite<Assets>;
}, T extends TilesetConfig<A>, M extends MapsConfig<A, T>, Ans extends Animation<A>[]> = {
    preload?: (scene: Phaser.Scene) => void;
    create?: (scene: Phaser.Scene) => void;
    update?: (scene: Phaser.Scene) => void;
    assets: A;
    sprites: S;
    tilesets: T;
    maps: M;
    animations: Ans;
};
type ScenesConfig = {
    [key: string]: AnySceneConfig;
};
type Scene<C extends AnySceneConfig> = {
    phaserScene: Phaser.Scene;
    objectPool: ObjectPool;
    camera: Camera;
    culling: Culling;
    maps: Maps<keyof C["maps"]>;
    input: Input;
    config: C;
};
type Scenes<C extends ScenesConfig> = {
    [key in keyof C]: Scene<C[key]>;
};
type Maps<Keys extends string | number | symbol> = {
    [key in Keys]: AnimatedTilemap<number, string, string>;
};
type Asset = {
    type: AssetType.Image;
    key: string;
    path: string;
} | {
    type: AssetType.SpriteSheet;
    key: string;
    path: string;
    options: {
        frameWidth: number;
        frameHeight: number;
    };
} | {
    type: AssetType.MultiAtlas;
    key: string;
    path: string;
    options: {
        imagePath: string;
    };
};
type CameraConfig = {
    pinchSpeed: number;
    wheelSpeed: number;
    minZoom: number;
    maxZoom: number;
};
type PhaserEngineConfig<S extends ScenesConfig> = {
    sceneConfig: S;
    scale: Phaser.Types.Core.ScaleConfig;
    cameraConfig: CameraConfig;
    cullingChunkSize: number;
};

declare const ZERO_VECTOR: Coord;
declare function cornerTileCoordsFromRegionCoords(regionCoords: WorldCoord[], regionLength: number): Coord[];
declare function isTileInArea(tileCoord: WorldCoord, area: Area): boolean;
declare function coordEq(a?: Coord, b?: Coord): boolean;
declare function addCoords(a: Coord, b: Coord): {
    x: number;
    y: number;
};
declare function pixelToChunkCoord(pixelCoord: PixelCoord, chunkSize: number): ChunkCoord;
declare function chunkToPixelCoord(chunkCoord: ChunkCoord, chunkSize: number): PixelCoord;
declare function pixelCoordToTileCoord(pixelCoord: PixelCoord, tileWidth: number, tileHeight: number): WorldCoord;
declare function tileCoordToPixelCoord(tileCoord: WorldCoord, tileWidth: number, tileHeight: number): PixelCoord;
declare function tileCoordToChunkCoord(tileCoord: WorldCoord, tileWidth: number, tileHeight: number, chunkSize: number): ChunkCoord;
declare function chunkCoordToTileCoord(chunkCoord: ChunkCoord, tileWidth: number, tileHeight: number, chunkSize: number): WorldCoord;

declare function load(scene: Phaser.Scene, callback: (loader: Phaser.Loader.LoaderPlugin) => void): Promise<void>;

declare function getChunksInArea(area: Area, chunkSize: number): CoordMap<boolean>;

declare function getObjectsInArea(groups: Phaser.GameObjects.Group[], area: Phaser.Geom.Rectangle): any[];

declare function generateFrames<A extends Assets>(anims: Phaser.Animations.AnimationManager, animation: Animation<A>): Phaser.Types.Animations.AnimationFrame[];

declare function createPhaserEngine<S extends ScenesConfig>(options: PhaserEngineConfig<S>): Promise<{
    game: Phaser.Game;
    scenes: Scenes<S>;
    dispose: () => void;
}>;

declare function definePhaserConfig(options: {
    scenes: GameScene[];
    scale: Phaser.Types.Core.GameConfig["scale"];
}): Phaser.Types.Core.GameConfig;

declare function createCamera(phaserCamera: Phaser.Cameras.Scene2D.Camera, options: CameraConfig): Camera;

declare function createDebugger(camera: Camera, chunks: Chunks, scene: Phaser.Scene, objectPool: ObjectPool, map: AnimatedTilemap<number, string, string>): void;

declare function defineAssetsConfig<A extends Assets>(assets: A): A;
declare function defineMapConfig<A extends Assets, T extends TilesetConfig<A>, L extends LayerConfig<A, T>>(config: MapConfig<A, T, L>): MapConfig<A, T, L>;
declare function defineSceneConfig<A extends Assets, S extends {
    [key: string]: Sprite<Assets>;
}, T extends TilesetConfig<A>, M extends MapsConfig<A, T>, Ans extends Animation<A>[]>(config: SceneConfig<A, S, T, M, Ans>): SceneConfig<A, S, T, M, Ans>;
declare function defineScaleConfig(config: Phaser.Types.Core.ScaleConfig): Phaser.Types.Core.ScaleConfig;
declare function defineCameraConfig(config: CameraConfig): CameraConfig;
declare function isSprite(gameObject: Phaser.GameObjects.GameObject, type: keyof GameObjectTypes): gameObject is GameObject<"Sprite">;
declare function isRectangle(gameObject: Phaser.GameObjects.GameObject, type: keyof GameObjectTypes): gameObject is GameObject<"Rectangle">;

declare const SpritePipeline: typeof Phaser.Renderer.WebGL.Pipelines.SpriteFXPipeline;
declare class HueTintAndOutlineFXPipeline extends SpritePipeline {
    static readonly KEY = "HueTintFXPipeline";
    private _tintColor;
    private _outline;
    private _outlineColor;
    constructor(game: Phaser.Game);
    onDrawSprite(obj: Phaser.GameObjects.Sprite): void;
    onDraw(renderTarget: Phaser.Renderer.WebGL.RenderTarget): void;
}

declare class MultiHueTintPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
    static readonly KEY = "MultiHueTintPipeline";
    constructor(game: Phaser.Game);
}

export { AnimatedTilemap, Asset, AssetType, Camera, ChunkedTilemap, Coord, GameObjectClasses, HueTintAndOutlineFXPipeline, Key, MultiHueTintPipeline, TileAnimation, VirtualTilemap, ZERO_VECTOR, addCoords, chunkCoordToTileCoord, chunkToPixelCoord, coordEq, cornerTileCoordsFromRegionCoords, createAnimatedTilemap, createCamera, createChunkedTilemap, createChunks, createCulling, createDebugger, createInput, createObjectPool, createPhaserEngine, createVirtualTilemap, defineAssetsConfig, defineCameraConfig, defineMapConfig, definePhaserConfig, defineScaleConfig, defineScene, defineSceneConfig, generateFrames, getChunksInArea, getObjectsInArea, isRectangle, isSprite, isTileInArea, load, mod, pixelCoordToTileCoord, pixelToChunkCoord, removeAllTweens, tileCoordToChunkCoord, tileCoordToPixelCoord, tween };
