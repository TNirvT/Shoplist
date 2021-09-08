TABLES = {}

TABLES["Users"] = ("""
    CREATE TABLE `Users` (
        `id` int(10) NOT NULL AUTO_INCREMENT,
        `email` varchar(30) NOT NULL UNIQUE,
        `user_name` varchar(30) NOT NULL,
        `password_hash` varchar(200) NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB
""")