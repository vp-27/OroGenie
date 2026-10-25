import re


def is_valid_email(email):
    if not isinstance(email, str):
        return False
    return re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", email) is not None


def is_valid_password(password):
    if not isinstance(password, str) or len(password) < 8:
        return False
    # Require at least three character classes.
    return sum(bool(re.search(pattern, password)) for pattern in (
        r"[a-z]", r"[A-Z]", r"[0-9]", r"[^A-Za-z0-9]"
    )) >= 3
