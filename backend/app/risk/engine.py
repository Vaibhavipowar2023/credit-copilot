"""Risk engine : Compare a reported value against a covenant threshold.
it is pure python"""


def check_breach(operator: str, threshold: float, actual: float) -> dict:
    """Return status + headroom for one covenant vs a reported value."""
    ops = {
        "<=": actual <= threshold,
        "<":  actual < threshold,
        ">=": actual >= threshold,
        ">":  actual > threshold,
    }
    compliant = ops.get(operator, False)

    # headroom: how much room before breach (sign depends on direction)
    if operator in ("<=", "<"):
        headroom = threshold - actual      # positive = safe
    else:
        headroom = actual - threshold

    return {
        "status": "compliant" if compliant else "breached",
        "headroom": round(headroom, 4),
    }