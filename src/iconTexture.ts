import { TextureLoader, WebGLRenderer, Texture, RGBAFormat, UnsignedByteType, Vector2 } from 'three';
import { allIconIds, iconUrl } from './data/icons';

const WIDTH = 24;
const HEIGHT = 24;
const ICON_SIZE = 80;

export class IconTexture {
    static readonly WIDTH = WIDTH;
    static readonly HEIGHT = HEIGHT;

    texture: Texture;
    private iconIds = new Map<number, number>();
    private loaded = new Array<boolean>(WIDTH * HEIGHT);
    private loader = new TextureLoader();

    constructor(private renderer: WebGLRenderer) {
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = WIDTH * ICON_SIZE;
        emptyCanvas.height = HEIGHT * ICON_SIZE;
        this.texture = new Texture(emptyCanvas);
        this.texture.name = 'icons';
        this.texture.format = RGBAFormat;
        this.texture.type = UnsignedByteType;
        this.texture.flipY = true;
        this.texture.needsUpdate = true;
        this.renderer.initTexture(this.texture);

        let nextIndex = 1; // 0 is reserved for empty icon
        for (const i of allIconIds()) {
            if (nextIndex >= WIDTH * HEIGHT)
                throw new Error('IconTexture too small');
            this.iconIds.set(i, nextIndex);
            nextIndex++;
        }

        for (let i = 0; i < this.loaded.length; i++)
            this.loaded[i] = false;
    }

    requestIcon(iconId: number) {
        const index = this.iconIds.get(iconId);
        if (index === undefined) {
            console.warn(`Unknown icon ${iconId}`)
            return 0;
        }

        if (this.loaded[iconId])
            return index;
        this.loaded[iconId] = true;

        (async () => {
            const texture = await this.loader.loadAsync(await iconUrl(iconId));
            const pos = new Vector2(index % WIDTH, Math.floor(index / WIDTH));
            pos.multiplyScalar(ICON_SIZE);
            this.renderer.copyTextureToTexture(pos, texture, this.texture);
            texture.dispose();
        })();

        return index;
    }
}
