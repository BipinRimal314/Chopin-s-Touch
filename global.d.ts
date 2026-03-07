export {};

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }

  // Web MIDI API (available in Chrome/Edge, not in Safari/WKWebView)
  interface MIDIAccess extends EventTarget {
    inputs: Map<string, MIDIInput>;
    outputs: Map<string, MIDIOutput>;
  }

  interface MIDIInput extends EventTarget {
    name: string | null;
    id: string;
  }

  interface MIDIOutput extends EventTarget {
    name: string | null;
    id: string;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }

  interface Navigator {
    requestMIDIAccess?: () => Promise<MIDIAccess>;
  }
}
