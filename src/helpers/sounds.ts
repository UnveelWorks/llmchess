import { useSettingsStore } from "../store/store";

const sounds = {
	move: new Audio('/audio/move.mp3'),
	capture: new Audio('/audio/capture.mp3'),
	check: new Audio('/audio/check.mp3'),
	'game-start': new Audio('/audio/game-start.mp3'),
	'game-end': new Audio('/audio/game-end.mp3'),
};

type SoundType = keyof typeof sounds;

function playSound(type: SoundType) {
	const { soundEnabled } = useSettingsStore.getState();
	if (!soundEnabled) return;
	const audio = sounds[type].cloneNode() as HTMLAudioElement;
	audio.play();
}

export { playSound };
export type { SoundType };
