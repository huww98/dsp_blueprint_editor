import { EventDispatcher, MOUSE, PerspectiveCamera, Quaternion, Spherical, TOUCH, Vector2, Vector3 } from 'three';

enum STATE {
    NONE,
    ROTATE,
    DOLLY,
    PAN,
    TOUCH_ROTATE,
    TOUCH_PAN,
    TOUCH_DOLLY_PAN,
    TOUCH_DOLLY_ROTATE,
}

const EPS = 0.000001;

// Like three/examples/jsm/controls/OrbitControls
export class PlanetMapControls extends EventDispatcher {

    static changeEvent = { type: 'change' } as const;
    static startEvent = { type: 'start' } as const;
    static endEvent = { type: 'end' } as const;

    enabled = true;

    /** sets the location of focus, where the object orbits around */
    target = new Vector3();
    /** focus when dolly and rotate */
    targetRadius = 0;

    // How far you can dolly in and out ( PerspectiveCamera only )
    minDistance = 0;
    maxDistance = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    minPolarAngle = 0; // radians
    maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    minAzimuthAngle = - Infinity; // radians
    maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    enableDamping = false;
    dampingFactor = 0.05;

    enableDolly = true;
    dollySpeed = 1.0;
    wheelDollyBase = 0.999;

    enableRotate = true;
    rotateSpeed = 1.0;

    keys: Record<string, { rotate: Vector2 }> = {
        KeyW: { rotate: new Vector2( 0,  1) },
        KeyS: { rotate: new Vector2( 0, -1) },
        KeyA: { rotate: new Vector2( 1,  0) },
        KeyD: { rotate: new Vector2(-1,  0) },
    };
    keyRotateSpeed = 100.0;

    mouseButtons = { LEFT: -1 as MOUSE, MIDDLE: MOUSE.ROTATE, RIGHT: -1 as MOUSE };

    touches = { ONE: -1 as TOUCH, TWO: TOUCH.ROTATE };

    constructor(public object: PerspectiveCamera, public domElement: HTMLElement) {
        super();
        domElement.style.touchAction = 'none';

        this.onContextMenu = this.onContextMenu.bind(this);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);

        this.domElement.addEventListener('pointerdown', this.onPointerDown);
        this.domElement.addEventListener('pointercancel', this.onPointerCancel);
        this.domElement.addEventListener('wheel', this.onMouseWheel, { passive: false });

        // force an update at start
        this.update();
    }

    private domElementKeyEvents: GlobalEventHandlers | null = null;
    listenToKeyEvents(domElement: GlobalEventHandlers) {
        domElement.addEventListener('keydown', this.onKeyDown);
        domElement.addEventListener('keyup', this.onKeyUp);
        this.domElementKeyEvents = domElement;
    }

    protected spherical = new Spherical();
    protected sphericalDelta = new Spherical();
    protected scale = 1.0;
    protected panOffset = new Vector3();

    getPolarAngle() {
        return this.spherical.phi;
    }

    getAzimuthalAngle() {
        return this.spherical.theta;
    }

    getDistance() {
        return this.object.position.distanceTo(this.target);
    }

    private keyRotate = new Vector2();
    updateTimeDelta(deltaTimeInSeconds: number) {
        for (const code of this.downKeys) {
            const act = this.keys[code];
            if (act === undefined)
                continue;
            this.keyRotate.copy(act.rotate).multiplyScalar(this.keyRotateSpeed * deltaTimeInSeconds);
            this.rotate(this.keyRotate.x, this.keyRotate.y);
        }
    }

    private lastPosition = new Vector3();
    private lastQuaternion = new Quaternion();
    update() {
        const twoPI = Math.PI * 2;
        // so camera.up is the orbit axis
        const quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();
        const offset = new Vector3();

        const position = this.object.position;

        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        this.spherical.setFromVector3(offset);

        if (this.enableDamping) {
            this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
            this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
        } else {
            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;
        }

        // restrict theta to be between desired limits

        let min = this.minAzimuthAngle;
        let max = this.maxAzimuthAngle;

        if (isFinite(min) && isFinite(max)) {
            if (min < - Math.PI)
                min += twoPI;
            else if (min > Math.PI)
                min -= twoPI;

            if (max < - Math.PI)
                max += twoPI;
            else if (max > Math.PI)
                max -= twoPI;

            if (min <= max) {
                this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));
            } else {
                this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
                    Math.max(min, this.spherical.theta) :
                    Math.min(max, this.spherical.theta);
            }

        }

        // restrict phi to be between desired limits
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
        this.spherical.makeSafe();

        this.spherical.radius = this.targetRadius + (this.spherical.radius - this.targetRadius) * this.scale;

        // restrict radius to be between desired limits
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        // move target to panned location

        if (this.enableDamping) {
            this.target.addScaledVector(this.panOffset, this.dampingFactor);
        } else {
            this.target.add(this.panOffset);
        }

        offset.setFromSpherical(this.spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(this.target).add(offset);

        this.object.lookAt(this.target);

        if (this.enableDamping === true) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);

            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);
        }

        this.scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if (this.lastPosition.distanceToSquared(this.object.position) > EPS ||
            8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > EPS) {

            this.dispatchEvent(PlanetMapControls.changeEvent);

            this.lastPosition.copy(this.object.position);
            this.lastQuaternion.copy(this.object.quaternion);

            return true;
        }
        return false;
    }

    dispose() {
        this.domElement.removeEventListener('contextmenu', this.onContextMenu);

        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.domElement.removeEventListener('pointercancel', this.onPointerCancel);
        this.domElement.removeEventListener('wheel', this.onMouseWheel);

        this.domElement.removeEventListener('pointermove', this.onPointerMove);
        this.domElement.removeEventListener('pointerup', this.onPointerUp);

        if (this.domElementKeyEvents !== null) {
            this.domElementKeyEvents.removeEventListener('keydown', this.onKeyDown);
            this.domElementKeyEvents.removeEventListener('keyup', this.onKeyUp);
        }
    }

    private state = STATE.NONE;

    private rotateStart = new Vector2();
    private rotateEnd = new Vector2();
    private rotateDelta = new Vector2();

    private dollyStart = new Vector2();
    private dollyEnd = new Vector2();
    private dollyDelta = new Vector2();

    private pointers: PointerEvent[] = [];
    private pointerPositions: Record<number, Vector2> = {};

    rotateLeft(angle: number) {
        this.sphericalDelta.theta -= angle;
    }

    rotateUp(angle: number) {
        this.sphericalDelta.phi -= angle;
    }

    /** unit: css pixel */
    rotate(deltaX: number, deltaY: number) {
        const offset = new Vector3();
        offset.copy(this.object.position).sub(this.target);
        const targetDistance = offset.length() - this.targetRadius;
        const unitAngle = targetDistance * Math.tan(this.object.fov / 2 * (Math.PI / 180.0)) * 2 / this.targetRadius / this.domElement.clientHeight;

        this.rotateLeft(deltaX * unitAngle);
        this.rotateUp(deltaY * unitAngle);
    }

    dollyOut(dollyScale: number) {
        this.scale /= dollyScale;
    }

    dollyIn( dollyScale: number ) {
        this.scale *= dollyScale;
    }

    //
    // event callbacks - update the object state
    //
    handleMouseDownRotate(event: PointerEvent) {
        this.rotateStart.set(event.clientX, event.clientY);
    }

    handleMouseDownDolly(event: PointerEvent) {
        this.dollyStart.set(event.clientX, event.clientY);
    }

    handleMouseMoveRotate(event: PointerEvent) {
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart)
            .multiplyScalar(this.rotateSpeed);

        this.rotate(this.rotateDelta.x, this.rotateDelta.y);

        this.rotateStart.copy(this.rotateEnd);
        this.update();
    }


    handleMouseWheel(event: WheelEvent) {
        this.dollyOut(Math.pow(this.wheelDollyBase, event.deltaY));
        this.update();
    }

    private downKeys = new Set<string>();

    protected handleKeyDown(event: KeyboardEvent) {
        if (event.code in this.keys) {
            this.downKeys.add(event.code);
            event.preventDefault();
            this.update();
        }
    }

    protected handleKeyUp(event: KeyboardEvent) {
        this.downKeys.delete(event.code);
    }

    handleTouchStartRotate() {
        if (this.pointers.length === 1) {
            this.rotateStart.set(this.pointers[0].pageX, this.pointers[0].pageY);
        } else {
            const x = 0.5 * (this.pointers[0].pageX + this.pointers[1].pageX);
            const y = 0.5 * (this.pointers[0].pageY + this.pointers[1].pageY);
            this.rotateStart.set(x, y);
        }
    }

	handleTouchStartDolly() {
        const dx = this.pointers[ 0 ].pageX - this.pointers[ 1 ].pageX;
        const dy = this.pointers[ 0 ].pageY - this.pointers[ 1 ].pageY;

        const distance = Math.sqrt( dx * dx + dy * dy );

        this.dollyStart.set( 0, distance );
    }

    handleTouchStartDollyRotate() {
        if (this.enableDolly)
            this.handleTouchStartDolly();

        if (this.enableRotate)
            this.handleTouchStartRotate();
    }

    handleTouchMoveRotate(event: PointerEvent) {
        if (this.pointers.length == 1) {
            this.rotateEnd.set(event.pageX, event.pageY);
        } else {
            const position = this.getSecondPointerPosition(event);

            const x = 0.5 * (event.pageX + position.x);
            const y = 0.5 * (event.pageY + position.y);

            this.rotateEnd.set(x, y);
        }

        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        const element = this.domElement;
        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        this.rotateStart.copy(this.rotateEnd);

    }

    handleTouchMoveDolly(event: PointerEvent) {
        const position = this.getSecondPointerPosition(event);

        const dx = event.pageX - position.x;
        const dy = event.pageY - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.dollyEnd.set(0, distance);
        this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.dollySpeed));

        this.dollyOut(this.dollyDelta.y);

        this.dollyStart.copy(this.dollyEnd);
    }

    handleTouchMoveDollyRotate(event: PointerEvent) {
        if (this.enableDolly)
            this.handleTouchMoveDolly(event);

        if (this.enableRotate)
            this.handleTouchMoveRotate(event);
    }

    //
    // event handlers - FSM: listen for events and reset state
    //
    onPointerDown = (event: PointerEvent) => {
        if (!this.enabled)
            return;

        if (this.pointers.length === 0) {
            this.domElement.setPointerCapture(event.pointerId);
            this.domElement.addEventListener('pointermove', this.onPointerMove);
            this.domElement.addEventListener('pointerup', this.onPointerUp);
        }

        this.addPointer(event);
        if (event.pointerType === 'touch')
            this.onTouchStart(event);
        else
            this.onMouseDown(event);
    }

    onPointerMove = (event: PointerEvent) => {
        if (!this.enabled)
            return;

        if (event.pointerType === 'touch')
            this.onTouchMove(event);
        else
            this.onMouseMove(event);
    }

    onPointerUp = (event: PointerEvent) => {
        this.removePointer(event);

        if (this.pointers.length === 0) {
            this.domElement.releasePointerCapture(event.pointerId);

            this.domElement.removeEventListener('pointermove', this.onPointerMove);
            this.domElement.removeEventListener('pointerup', this.onPointerUp);

        }
        this.dispatchEvent(PlanetMapControls.endEvent);
        this.state = STATE.NONE;
    }

    onPointerCancel = (event: PointerEvent) => {
        this.removePointer(event);
    }

    onMouseDown(event: PointerEvent) {
        let mouseAction = -1;
        switch (event.button) {
            case 0:
                mouseAction = this.mouseButtons.LEFT;
                break;
            case 1:
                mouseAction = this.mouseButtons.MIDDLE;
                break;
            case 2:
                mouseAction = this.mouseButtons.RIGHT;
                break;
        }

        switch (mouseAction) {
            case MOUSE.DOLLY:
                if (!this.enableDolly)
                    return;
                this.handleMouseDownDolly(event);
                this.state = STATE.DOLLY;
                break;

            case MOUSE.ROTATE:
                if (!this.enableRotate)
                    return;
                this.handleMouseDownRotate(event);
                this.state = STATE.ROTATE;
                break;

            default:
                this.state = STATE.NONE;

        }

        if (this.state !== STATE.NONE)
            this.dispatchEvent(PlanetMapControls.startEvent);
    }

    onMouseMove(event: PointerEvent) {
        if (!this.enabled)
            return;

        switch (this.state) {
            case STATE.ROTATE:
                if (!this.enableRotate)
                    return;
                this.handleMouseMoveRotate(event);
                break;
        }
    }

    onMouseWheel = (event: WheelEvent) => {
        if (!this.enabled || !this.enableDolly || this.state !== STATE.NONE)
            return;
        event.preventDefault();

        this.dispatchEvent(PlanetMapControls.startEvent);
        this.handleMouseWheel(event);
        this.dispatchEvent(PlanetMapControls.endEvent);
    }

    onKeyDown = (event: KeyboardEvent) => {
        if (!this.enabled)
            return;
        this.handleKeyDown(event);
    }

    onKeyUp = (event: KeyboardEvent) => {
        this.handleKeyUp(event);
    }

    onTouchStart(event: PointerEvent) {
        this.trackPointer(event);
        switch (this.pointers.length) {
            case 1:
                switch (this.touches.ONE) {
                    case TOUCH.ROTATE:
                        if (this.enableRotate === false)
                            return;
                        this.handleTouchStartRotate();
                        this.state = STATE.TOUCH_ROTATE;
                        break;

                    default:
                        this.state = STATE.NONE;
                }
                break;
            case 2:
                switch (this.touches.TWO) {
                    case TOUCH.DOLLY_ROTATE:
                        if (!this.enableDolly && !this.enableRotate)
                            return;
                        this.handleTouchStartDollyRotate();
                        this.state = STATE.TOUCH_DOLLY_ROTATE;
                        break;
                    default:
                        this.state = STATE.NONE;
                }
                break;
            default:
                this.state = STATE.NONE;
        }

        if (this.state !== STATE.NONE)
            this.dispatchEvent(PlanetMapControls.startEvent);
    }

    onTouchMove(event: PointerEvent) {
        this.trackPointer(event);
        switch (this.state) {
            case STATE.TOUCH_ROTATE:
                if (!this.enableRotate)
                    return;
                this.handleTouchMoveRotate(event);
                this.update();
                break;
            case STATE.TOUCH_DOLLY_ROTATE:
                if (!this.enableDolly && !this.enableRotate)
                    return;
                this.handleTouchMoveDollyRotate(event);
                this.update();
                break;
            default:
                this.state = STATE.NONE;
        }
    }

    onContextMenu = (event: Event) => {
        if (this.enabled === false)
            return;
        event.preventDefault();
    }

    protected addPointer(event: PointerEvent) {
        this.pointers.push(event);
    }

    protected removePointer(event: PointerEvent) {
        delete this.pointerPositions[event.pointerId];
        for (let i = 0; i < this.pointers.length; i++) {
            if (this.pointers[i].pointerId == event.pointerId) {
                this.pointers.splice(i, 1);
                return;
            }
        }
    }

    trackPointer(event: PointerEvent) {
        let position = this.pointerPositions[event.pointerId];
        if (position === undefined) {
            position = new Vector2();
            this.pointerPositions[event.pointerId] = position;
        }
        position.set(event.pageX, event.pageY);
    }

    getSecondPointerPosition(event: PointerEvent) {
        const pointer = (event.pointerId === this.pointers[0].pointerId) ? this.pointers[1] : this.pointers[0];
        return this.pointerPositions[pointer.pointerId];
    }
}
