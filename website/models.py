TABLES = {}

TABLES["users"] = ("""
    CREATE TABLE `users` (
        `id` int(10) NOT NULL AUTO_INCREMENT,
        `email` varchar(30) NOT NULL,
        `user_name` varchar(30) NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB
""")