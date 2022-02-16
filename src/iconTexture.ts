import { TextureLoader, WebGLRenderer, Texture, RGBAFormat, UnsignedByteType, Vector2, DataTexture } from 'three';
import { itemsMap } from '@/data';

const WIDTH = 16;
const HEIGHT = 16;
const ICON_SIZE = 80;

export class IconTexture {
    texture: Texture;
    private itemIds = new Map<number, number>();
    private loaded = new Array<boolean>(WIDTH * HEIGHT);
    private loader = new TextureLoader();

    constructor(private renderer: WebGLRenderer) {
        this.texture = new DataTexture(
            new Uint8Array(WIDTH * ICON_SIZE * HEIGHT * ICON_SIZE * 4),
            WIDTH * ICON_SIZE, HEIGHT * ICON_SIZE,
        );
        this.texture.name = 'icons';
        this.texture.format = RGBAFormat;
        this.texture.type = UnsignedByteType;
        this.texture.flipY = true;
        this.texture.needsUpdate = true;
        this.renderer.initTexture(this.texture);

        let nextId = 0;
        for (const i of itemsMap.values()) {
            if (nextId >= WIDTH * HEIGHT)
                throw new Error('IconTexture too small');
            this.itemIds.set(i.id, nextId);
            nextId++;
        }

        for (let i = 0; i < this.loaded.length; i++)
            this.loaded[i] = false;
    }

    requestItemIcon(itemId: number) {
        const iconId = this.itemIds.get(itemId);
        if (iconId === undefined)
            throw new Error('unknown item ' + itemId);
        if (this.loaded[iconId])
            return iconId;

        this.loaded[iconId] = true;
        (async () => {
            const url = await import(/* webpackMode: "eager" */`@/assets/icons/item_recipe/${itemsMap.get(itemId)!.icon}.png`);
            const texture = await this.loader.loadAsync(url.default);
            const pos = new Vector2(iconId % WIDTH, Math.floor(iconId / WIDTH));
            pos.multiplyScalar(ICON_SIZE);
            // console.log(pos, texture, this.texture);
            this.renderer.copyTextureToTexture(pos, texture, this.texture);
            texture.dispose();
        })();
        return iconId;
    }
}
