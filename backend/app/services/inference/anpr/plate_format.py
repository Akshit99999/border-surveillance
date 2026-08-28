"""Normalization and validation rules for common Indian registration plates.

The ANPR integration is adapted from the Apache-2.0 licensed module supplied
in ``IBVAP-modules/anpr-module``. See ``backend/THIRD_PARTY_NOTICES.md``.
"""

from __future__ import annotations

import re


INDIAN_PLATE_PATTERN = re.compile(r"^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$")
_DIGIT_TO_LETTER = {"0": "O", "1": "I", "2": "Z", "5": "S", "8": "B"}
_LETTER_TO_DIGIT = {"O": "0", "D": "0", "Q": "0", "I": "1", "L": "1", "Z": "2", "S": "5", "B": "8"}


def normalize_indian_plate(value: str) -> str:
    """Normalize common OCR substitutions without accepting an invalid plate."""

    text = re.sub(r"[^A-Z0-9]", "", (value or "").upper())
    if len(text) not in (9, 10):
        return text

    letter_positions = {0, 1, 4}
    if len(text) == 10:
        letter_positions.add(5)

    normalized = []
    for index, character in enumerate(text):
        if index in letter_positions:
            normalized.append(_DIGIT_TO_LETTER.get(character, character))
        else:
            normalized.append(_LETTER_TO_DIGIT.get(character, character))
    return "".join(normalized)


def is_indian_plate(value: str) -> bool:
    """Return whether ``value`` matches the supported Indian plate formats."""

    return bool(INDIAN_PLATE_PATTERN.fullmatch(normalize_indian_plate(value)))
