CREATE DATABASE IF NOT EXISTS NotesDB;
USE NotesDB;

/*Funkcje do tworzenia bazy danych wraz z tabelkami jezeli nie istnieja*/

CREATE TABLE IF NOT EXISTS Passwords(
    id INT PRIMARY KEY AUTO_INCREMENT,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_id INT NOT NULL,
    FOREIGN KEY (password_id) REFERENCES Passwords(id)
);

CREATE TABLE IF NOT EXISTS Categories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS UserCategories(
    user_id INT,
    category_id INT,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Notes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    note_name VARCHAR(50),
    content TEXT
);

CREATE TABLE IF NOT EXISTS UserNotes(
    user_id INT,
    note_id INT,
    permission INT,
    PRIMARY KEY (user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id)
);

CREATE TABLE IF NOT EXISTS CategoryNotes(
    category_id INT,
    note_id INT,
    permission INT,
    PRIMARY KEY (category_id, note_id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id)
);

/*
Permissions:
0 - no permission
1 - READ ONLY
2 - READ / WRITE
3 - OWNER
*/

/*Reszta funkcji do bazy danych*/


