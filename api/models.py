TABLES = {}

TABLES["users"] = ("""
    CREATE TABLE users (
        id INT(10) AUTO_INCREMENT,
        email VARCHAR(30) NOT NULL UNIQUE,
        user_name VARCHAR(30) NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB
""")

TABLES["products"] = ("""
    CREATE TABLE products (
        id INT(10) AUTO_INCREMENT,
        user_id INT(10),
        item_name VARCHAR(300) NOT NULL,
        user_alias VARCHAR(30) DEFAULT '',
        brand VARCHAR(30) DEFAULT '',
        type VARCHAR(30) DEFAULT '',
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB
""")

TABLES["sources"] = ("""
    CREATE TABLE sources (
        id INT(10) AUTO_INCREMENT,
        url VARCHAR(500) NOT NULL UNIQUE,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB
""")

TABLES["product_source_links"] = ("""
    CREATE TABLE product_source_links (
        product_id INT(10),
        source_id INT(10),
        PRIMARY KEY (product_id, source_id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (source_id) REFERENCES sources(id)
    ) ENGINE=InnoDB
""")

TABLES["product_types"] = ("""
    CREATE TABLE product_types (
        id INT(10),
        type VARCHAR(30) NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB
""")

TABLES["shops"] = ("""
    CREATE TABLE shops (
        id INT(10),
        shop VARCHAR(30) NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB
""")

TABLES["price_history"] = ("""
    CREATE TABLE price_history (
        source_id INT(10),
        date DATE,
        price DEC(10,2) NOT NULL,
        PRIMARY KEY (source_id, date),
        FOREIGN KEY (source_id) REFERENCES sources(id)
    ) ENGINE=InnoDB
""")
