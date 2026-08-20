"""Prompt for extracting covenants from a credit agreement."""

EXTRACTION_SYSTEM = """You extract covenants from credit agreement text. Return a JSON \
array. Each covenant is an object with these fields:
- "metric": short name of the covenant (e.g. "Net Debt / EBITDA", "Indebtedness", "Liens")
- "covenant_type": "financial" if it has a numeric threshold, else "negative" or "affirmative"
- "operator": one of "<=", ">=", "<", ">", or null if there is no numeric threshold
- "threshold": the numeric limit as a number, or null if none
- "unit": e.g. "x", "%", "USD", or null
- "source_quote": the exact sentence from the text stating this covenant

Extract every covenant you find. Output ONLY the JSON array, nothing else."""