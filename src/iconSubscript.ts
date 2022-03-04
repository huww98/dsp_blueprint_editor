import { InstancedBufferAttribute, InstancedMesh, Matrix4, Texture, Vector2, Vector3 } from "three";
import { IconGeometry, IconsMaterial } from "./icons";

class FontTexture {
    height;
    cWidth;
    cStride;
    texture;
    static readonly allText = '0123456789k';

    constructor() {
        const stroke = 3;
        const padding = 1;
        const height = 100;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw Error('Canvas 2D unsupported')

        const font = `bold ${height}px monospace`;
        ctx.font = font;
        this.cWidth = ctx.measureText(FontTexture.allText[0]).width;
        this.cStride = this.cWidth + 2 * stroke + 2 * padding;
        const measure = ctx.measureText(FontTexture.allText);
        const y = measure.actualBoundingBoxAscent + stroke + padding;
        canvas.height = this.height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 2 * stroke + 2 * padding;
        canvas.width = this.cStride * FontTexture.allText.length;

        ctx.font = font;
        ctx.strokeStyle = '#4448';
        ctx.lineWidth = 2 * stroke;
        ctx.fillStyle = 'white';
        for (let i = 0; i < FontTexture.allText.length; i++) {
            const c = FontTexture.allText[i];
            const x = this.cStride * i + stroke + padding
            ctx.strokeText(c, x, y);
            ctx.fillText(c, x, y);
        }

        this.texture = new Texture(canvas);
        this.texture.needsUpdate = true;
    }
}

export class IconSubscript extends InstancedMesh {
    fontTexture;
    cWidth = 0.2;

    constructor(numChars: number) {
        const fontTexture = new FontTexture();
        const material = new IconsMaterial(fontTexture.texture);
        material.iMapSize.set(FontTexture.allText.length, 1);
        const geometry = new IconGeometry();
        super(geometry, material, numChars);

        const initTrans = new Matrix4().makeScale(
            fontTexture.cStride / fontTexture.cWidth * this.cWidth,
            fontTexture.height / fontTexture.cWidth * this.cWidth,
            1.0
        );
        initTrans.multiply(new Matrix4().makeTranslation(0.5 * fontTexture.cWidth / fontTexture.cStride, 0.5, 0.0));
        geometry.applyMatrix4(initTrans);

        this.fontTexture = fontTexture;
        this.geometry.setAttribute('iconId', new InstancedBufferAttribute(new Int32Array(numChars), 1));
        this.geometry.setAttribute('iconPos', new InstancedBufferAttribute(new Float32Array(numChars * 3), 3));
        this.geometry.setAttribute('offset', new InstancedBufferAttribute(new Float32Array(numChars * 2), 2));
    }

    setText(index: number, pos: Vector3, scale: Vector2, text: string) {
        const offset = new Vector2();
        for (let i = 0; i < text.length; i++) {
            const iconId = FontTexture.allText.indexOf(text[i]);
            (this.geometry.getAttribute('iconId').array as Int32Array)[index + i] = iconId;
            pos.toArray(this.geometry.getAttribute('iconPos').array, (index + i) * 3);

            offset.copy(scale).multiplyScalar(0.5);
            offset.x -= scale.x * this.cWidth * (text.length - i);
            offset.y = -offset.y;
            console.log(offset);
            offset.toArray(this.geometry.getAttribute('offset').array, (index + i) * 2)
        }
    }

    needsUpdate() {
        this.geometry.getAttribute('iconId').needsUpdate = true;
        this.geometry.getAttribute('iconPos').needsUpdate = true;
        this.geometry.getAttribute('offset').needsUpdate = true;
    }
}
