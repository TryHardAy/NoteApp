CREATE DATABASE IF NOT EXISTS NotesDB;
USE NotesDB;

/*Tworzenie potrzebnych tabelek jeżeli jeszcze, jakaś z nich nie istnieje*/

CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    FOREIGN KEY (password_id) REFERENCES Passwords(id)
);

CREATE TABLE IF NOT EXISTS Passwords (
    id INT PRIMARY KEY AUTO_INCREMENT,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS UserCategories (
    user_id INT,
    category_id INT,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT
);

CREATE TABLE IF NOT EXISTS UserNotes (
    user_id INT,
    note_id INT,
    permission_id INT,
    PRIMARY KEY (user_id, note_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(id)
);

CREATE TABLE IF NOT EXISTS CategoryNotes (
    category_id INT,
    note_id INT,
    permission_id INT,
    PRIMARY KEY (category_id, note_id, permission_id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(id)
);

CREATE TABLE IF NOT EXISTS Permissions (
    id INT PRIMARY KEY,
    permission INT PRIMARY KEY
);

/*Reszta funkcji do bazy danych*/

/*
0 - no permission
1 - READ ONLY
2 - READ / WRITE
*/
INSERT IGNORE INTO Permissions (id, permission)
VALUES (0, 0), (1, 1), (2, 2);
