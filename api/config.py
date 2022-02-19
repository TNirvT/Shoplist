import string
import json
from random import choice, randint
from pathlib import Path

def phrase_gen(min_len, max_len):
    characters = string.ascii_letters + string.digits
    phrase =  "".join(choice(characters) for _ in range(randint(min_len, max_len)))
    return phrase

# directory for login/password/encryption storage
secret_dir = Path.cwd() / ".secret"
if not secret_dir.is_dir():
    Path.mkdir(secret_dir)

# secret phrase required by flask
secret_phrase_path = secret_dir / "flask_secret.secr"
if not secret_phrase_path.is_file():
    with open(secret_phrase_path, "w") as f:
        secret_phrase = f.write(phrase_gen(24, 28))
with open(secret_phrase_path, "r") as f:
    secret_phrase = f.read()

# mysql database login info
# {"host":"uri/ip", "port":1234, "user":"user login", "password":"***"}
db_credential_path = secret_dir / "db_credential.json"
if not db_credential_path:
    db_credential = None
    print("Config Error! MySQL database credential is missing!")
else:
    with open(db_credential_path, "r") as f:
        db_credential = json.load(f)

# database name
db_name = "shoplist_db"

# bestbuy api key
bestbuy_api_key_path = secret_dir / "bestbuy_api.key"
if not bestbuy_api_key_path.is_file():
    bestbuy_api_key = None
else:
    with open(bestbuy_api_key_path, "r") as f:
        bestbuy_api_key = f.read()
