import { epoxyFetch, initWisp } from "./connection/epoxy";
import { makeFakeWebSocket } from "./connection/fakewebsocket";

//@ts-expect-error this gets filled in by rollup
export const VERSION = self.VERSION;
//@ts-expect-error this too
export const COMMITHASH = self.COMMITHASH;

export let wispUrl: string;

const nativeFetch = fetch;

export function setWispUrl(wisp: string) {
	const wispUrlUrl = new URL(wisp);
	if (!wispUrlUrl.pathname.endsWith("/")) {
		wispUrlUrl.pathname += "/";
	}
	wispUrl = wispUrlUrl.href;
}

wispUrl =
	((window as any).anura && (window as any).anura.wsproxyURL) ||
	new URL(window.location.href).searchParams.get("wisp") ||
	localStorage["wispcraft_wispurl"] ||
	"wss://anura.pro/";

try {
	setWispUrl(wispUrl);
} catch (e) {
	console.error(e);
}

// replace websocket with our own
window.WebSocket = makeFakeWebSocket();

// eagler will fetch texture packs, will fail if cors isn't set
// should really fix this but whatever
window.fetch = async function (url: RequestInfo | URL, init?: RequestInit) {
	try {
		return await nativeFetch(url, init);
	} catch (e) {
		return await epoxyFetch("" + url, init);
	}
};

initWisp(wispUrl);
