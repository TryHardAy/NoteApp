CREATE DATABASE IF NOT EXISTS NotesDB;
USE NotesDB;

/*Funkcje do tworzenia bazy danych wraz z tabelkami jezeli nie istnieja*/

CREATE TABLE IF NOT EXISTS Users(
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Categories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS UserCategories(
    user_id VARCHAR(50),
    category_id INT,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Notes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50),
    content TEXT
);

CREATE TABLE IF NOT EXISTS UserNotes(
    user_id VARCHAR(50),
    note_id INT,
    permission INT NOT NULL,
    PRIMARY KEY (user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id)
);

CREATE TABLE IF NOT EXISTS CategoryNotes(
    category_id INT,
    note_id INT,
    permission INT NOT NULL,
    PRIMARY KEY (category_id, note_id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (note_id) REFERENCES Notes(id)
);


DELIMITER $$

CREATE PROCEDURE CreateNote(
    IN Title VARCHAR(50), 
    IN Content TEXT, 
    IN UserID VARCHAR(50)
    )
BEGIN
    INSERT INTO Notes(title, content)
    VALUES(Title, Content);

    INSERT INTO UserNotes (user_id, note_id, permission)
    VALUES (UserID, LAST_INSERT_ID(), 3);
END $$

DELIMITER ;
