import { Vector3, Matrix4, Quaternion, WebGLRenderer, PerspectiveCamera } from "three";
import { onMounted, onUnmounted, Ref } from "vue";

export function debugMat(m: Matrix4) {
    const trans = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    m.decompose(trans, rotation, scale);
    console.log('translation', trans);
    console.log('rotation   ', rotation);
    console.log('scale      ', scale);
}

export function attachRenderer(el: Ref<Element | null>, renderer: WebGLRenderer) {
    const onResize = () => {
        const rect = el.value!.getBoundingClientRect();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(rect.width, rect.height);
    }
    onMounted(() => {
        onResize();
        window.addEventListener('resize', onResize);
        el.value!.appendChild(renderer.domElement);
    })
    onUnmounted(() => {
        window.removeEventListener('resize', onResize);
        renderer.dispose();
    });
}

export function attachCamera(el: Ref<Element | null>, camera: PerspectiveCamera) {
    const onResize = () => {
        const rect = el.value!.getBoundingClientRect();
		camera.aspect = rect.width / rect.height;
		camera.updateProjectionMatrix();
    }
    onMounted(() => {
        onResize();
        window.addEventListener('resize', onResize);
    })
	onUnmounted(() => { window.removeEventListener('resize', onResize); });
}
