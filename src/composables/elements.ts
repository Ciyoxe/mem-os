import {
    type Ref,
    onMounted,
    onUnmounted,
    watch,
} from "vue";

export function useInterval(timeout_ms: number, fn: (stopInterval: ()=> void)=> void) {
    let interval: ReturnType<typeof setInterval>;
    onMounted(()=> interval = setInterval(()=> fn(()=> clearInterval(interval)), timeout_ms));
    onUnmounted(()=> clearInterval(interval));
};

export function useEvent<T extends Event>(ref: Ref<HTMLElement | undefined>, event: keyof HTMLElementEventMap, handle: (ev: T)=> void) {
    watch(ref, (value, prevValue)=> {
        if (value)
            value.addEventListener(event, handle as (_: Event)=> void);
        else
            prevValue?.removeEventListener(event, handle as (_: Event)=> void);
    },
    { flush: "post" });
}

export function useAnimation(fn: (stop: ()=> void, time_ms: number)=> void) {
    let start   = performance.now();
    let stopped = false;
    const stop = ()=> {
        stopped = true;
    }
    const handle = ()=> {
        if (stopped)
            return;
        fn(stop, performance.now() - start);
        requestAnimationFrame(handle);
    }
    requestAnimationFrame(handle);
}
