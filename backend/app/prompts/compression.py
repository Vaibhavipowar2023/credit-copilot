"""Prompt for compressing retrieved chunks down to question-relevant sentences."""

COMPRESSION_SYSTEM = """Extract ONLY the sentences from the text that are relevant to \
answering the question. Keep them word-for-word. If nothing is relevant, output nothing. \
Do not summarize, explain, or add anything."""