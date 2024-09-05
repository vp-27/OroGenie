import re

def is_valid_email(email):
    # Regular expression to validate email format
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.match(regex, email)

def is_valid_password(password):
    # Check if password meets the requirements:
    # - Length more that 8 characters
    # - Contains at least 3 of the following: lowercase letter, uppercase letter, digit, special character
    if len(password) < 8:
        return False
    if sum(bool(re.search(p, password)) for p in [r'[a-z]', r'[A-Z]', r'[0-9]', r'[\W]']) < 3:
        return False
    return True