"""Runtime device selection for local AI inference."""

from __future__ import annotations


def cuda_available() -> bool:
    try:
        import torch

        return bool(torch.cuda.is_available())
    except Exception:
        return False


def resolve_device(preference: str = "cuda") -> str:
    """Prefer CUDA for inference and fall back safely when it is unavailable."""

    requested = preference.strip().lower()
    if requested == "cpu":
        return "cpu"
    if requested not in {"auto", "cuda"}:
        requested = "cuda"
    return "cuda" if cuda_available() else "cpu"
