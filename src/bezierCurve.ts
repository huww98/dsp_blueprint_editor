import { Vector } from "three";

export class BezierCurve<T extends Vector>  {
    a_b: T;
    b_c: T;
    c_d: T;

    constructor(public a: T, public b: T, public c: T, public d: T) {
        this.a_b = (b.clone() as T).sub(a);
        this.b_c = (c.clone() as T).sub(b);
        this.c_d = (d.clone() as T).sub(c);
    }

    getPoint(t: number, point: T, dir?: T) {
        const { a, b, c, d } = this;
        const s = 1 - t;
        const ss = s * s;
        const tt = t * t;

        point.copy(a).multiplyScalar(ss * s)
            .add(b.clone().multiplyScalar(3 * ss * t))
            .add(c.clone().multiplyScalar(3 * s * tt))
            .add(d.clone().multiplyScalar(tt * t));

        if (dir) {
            const { a_b, b_c, c_d } = this;
            dir.copy(a_b).multiplyScalar(3 * ss)
                .add(b_c.clone().multiplyScalar(6 * s * t))
                .add(c_d.clone().multiplyScalar(3 * tt));
        }
    }
}
