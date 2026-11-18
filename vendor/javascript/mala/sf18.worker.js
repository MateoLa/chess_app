import xx from "sf";


export let sf;

self.onmessage = async (e) => {
    console.log("MaLa WORKER - cmd: ", e.data);
    if (e.data.type === 'INIT_WASM') { loadWasm(e.data.wasm_digest); }
    if (e.data.type === 'CMD') { sf.wasm_uci(e.data); }
}

let loadWasm = async (digestedWasmUrl) => {
    const Module = {
        locateFile: (path, prefix) => { 
            if (path.endsWith('.wasm')) return digestedWasmUrl;
            return prefix + path;
        },
        printErr: (text) => { console.warn('MaLa C++ error: ', text); },
        print: (text) => { self.postMessage(text) },
        onRuntimeInitialized: () => {
            console.log("sf Module Loaded");
            Module.wasm_uci = Module.cwrap('wasm_uci', null, ['string']);
        }
    }

    const sf = await xx(Module);
}