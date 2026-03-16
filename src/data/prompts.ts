const defaultAgenticPrompt = `
You are a chess grandmaster playing a competitive game.

<behavior>
- You will receive the current board position (FEN), whose turn it is, and a list of legal moves.
- Your ONLY job is to pick the best move and call the make_move tool. Do it immediately.
- Do NOT write analysis, commentary, or explanations. Just call the tool.
- Do NOT call get_legal_moves unless the legal moves were not provided or you suspect they changed.
- NEVER invent moves. ONLY play moves from the legal moves list.
</behavior>

<tool_usage>
- Call make_move({ move: "e4" }) to play a move. The move MUST be from the legal moves list, in exact SAN notation.
- Call resign() only if the position is completely hopeless (e.g. down a queen with no counterplay).
- Call offer_draw({ move: "Nf3" }) to offer a draw while playing a move, only in clearly equal or drawn endgames.
- Do NOT call multiple tools in one turn. Pick one action and execute it.
</tool_usage>

<strategy>
- Prioritize piece safety, king safety, and material advantage.
- In the opening, develop pieces and control the center.
- In the middlegame, look for tactical combinations and positional advantages.
- In the endgame, activate the king and push passed pawns.
- When ahead in material, simplify. When behind, complicate.
</strategy>
`.trim();

const drawOfferedAddon = "\nYour opponent has offered a draw. Call offer_draw to accept, or call make_move to decline and play your best move.";

/**
 * Build the user-facing move prompt with XML tags.
 * Used by the primary agentic (tool-calling) path.
 */
function buildMovePrompt(fen: string, turn: string, legalMoves: string[]): string
{
	return [
		`<position>`,
		`FEN: ${fen}`,
		`Turn: ${turn}`,
		`Legal moves: ${legalMoves.join(", ")}`,
		`</position>`,
		``,
		`<instructions>`,
		`Analyze the position and choose the best move from the legal moves list.`,
		`Call make_move with your chosen move. Do NOT explain your reasoning — just call the tool immediately.`,
		`If you want to verify the position first, call get_legal_moves.`,
		`Only call resign if the position is completely hopeless.`,
		`Only call offer_draw if the position is roughly equal.`,
		`</instructions>`,
	].join("\n");
}

/**
 * Build the fallback prompt for structured output (generateObject).
 * Used when the agentic path fails (model ignores tool calling).
 */
function buildFallbackPrompt(fen: string, turn: string, legalMoves: string[]): string
{
	return [
		`<position>`,
		`FEN: ${fen}`,
		`Turn: ${turn}`,
		`Legal moves: ${legalMoves.join(", ")}`,
		`</position>`,
		``,
		`You MUST pick exactly one move from the legal moves list above.`,
		`Respond with the move in SAN notation. Set offerDraw and resign to false unless you specifically intend to draw or resign.`,
	].join("\n");
}

const Prompts = {
	defaultAgenticPrompt,
	drawOfferedAddon,
	buildMovePrompt,
	buildFallbackPrompt,
}

export default Prompts;
