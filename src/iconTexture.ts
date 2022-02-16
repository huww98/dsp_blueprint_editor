import { TextureLoader, WebGLRenderer, Texture, RGBAFormat, UnsignedByteType, Vector2, DataTexture } from 'three';
import { itemsMap, recipesMap } from '@/data';

const WIDTH = 16;
const HEIGHT = 16;
const ICON_SIZE = 80;

export class IconTexture {
    texture: Texture;
    private itemIds = new Map<number, number>();
    private recipeIds = new Map<number, number>();
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
        const getNextId = () => {
            if (nextId >= WIDTH * HEIGHT)
                throw new Error('IconTexture too small');
            return nextId++;
        }
        for (const i of itemsMap.values())
            this.itemIds.set(i.id, getNextId());

        for (const r of recipesMap.values()) {
            const iconId = r.icon === undefined ? this.itemIds.get(r.to[0].item.id)! : getNextId();
            this.recipeIds.set(r.id, iconId);
        }

        for (let i = 0; i < this.loaded.length; i++)
            this.loaded[i] = false;
    }

    private async loadItemRecipeIcon(iconId: number, name: string) {
        const url = await import(/* webpackMode: "eager" */`@/assets/icons/item_recipe/${name}.png`);
        const texture = await this.loader.loadAsync(url.default);
        const pos = new Vector2(iconId % WIDTH, Math.floor(iconId / WIDTH));
        pos.multiplyScalar(ICON_SIZE);
        // console.log(pos, texture, this.texture);
        this.renderer.copyTextureToTexture(pos, texture, this.texture);
        texture.dispose();
    }

    private requestIcon(iconId: number, loadFn: () => Promise<void>) {
        if (this.loaded[iconId])
            return;

        this.loaded[iconId] = true;
        loadFn();
    }

    requestItemIcon(itemId: number) {
        const iconId = this.itemIds.get(itemId);
        if (iconId === undefined)
            throw new Error('unknown item ' + itemId);
        this.requestIcon(iconId, () => this.loadItemRecipeIcon(iconId, itemsMap.get(itemId)!.icon));
        return iconId;
    }

    requestRecipeIcon(recipeId: number) {
        const iconId = this.recipeIds.get(recipeId);
        if (iconId === undefined)
            throw new Error('unknown recipe ' + recipeId);

        this.requestIcon(iconId, () => {
            const r = recipesMap.get(recipeId)!;
            return this.loadItemRecipeIcon(iconId, r.icon ?? itemsMap.get(r.to[0].item.id)!.icon);
        });
        return iconId;
    }
}
