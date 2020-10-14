DROP DATABASE IF EXISTS employees_db;

CREATE DATABASE employees_db;

USE employees_db;

-- Create Table for departments --
CREATE TABLE department(
  department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30)
);
-- Create table for roles --
CREATE TABLE roles(
  role_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL,
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES department(department_id)
);
-- Create table for employee --
CREATE TABLE employee(
  employee_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
);

-- Create Departments --
INSERT INTO department(name) VALUE("Outbound");
INSERT INTO department(name) VALUE("Inbound");
INSERT INTO department(name) VALUE("PCF");
INSERT INTO department(name) VALUE("Vender Return");
INSERT INTO department(name) VALUE("Procurment");
INSERT INTO department(name) VALUE("Safety");
INSERT INTO department(name) VALUE("IT");
INSERT INTO department(name) VALUE("Finance");

-- Create Roles For OutBound Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Associate","25000", 1);
INSERT INTO roles(title, salary, department_id) VALUE ("Process Assistant","35000", 1);
INSERT INTO roles(title, salary, department_id) VALUE ("Area Manager","70000", 1);
INSERT INTO roles(title, salary, department_id) VALUE ("Operations Manager","100000", 1);
INSERT INTO roles(title, salary, department_id) VALUE ("Senior Operations Manager","140000", 1);
-- Create Roles For InBound Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Associate","25000", 2);
INSERT INTO roles(title, salary, department_id) VALUE ("Process Assistant","35000", 2);
INSERT INTO roles(title, salary, department_id) VALUE ("Area Manager","70000", 2);
INSERT INTO roles(title, salary, department_id) VALUE ("Operations Manager","100000", 2);
INSERT INTO roles(title, salary, department_id) VALUE ("Senior Operations Manager","140000", 2);
-- Create Roles For PCF Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Associate","25000", 3);
INSERT INTO roles(title, salary, department_id) VALUE ("Process Assistant","35000", 3);
INSERT INTO roles(title, salary, department_id) VALUE ("Area Manager","70000", 3);
INSERT INTO roles(title, salary, department_id) VALUE ("Operations Manager","100000", 3);
INSERT INTO roles(title, salary, department_id) VALUE ("Senior Operations Manager","140000", 3);
-- Create Roles For Vendor Returns Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Process Assistant","35000", 4);
INSERT INTO roles(title, salary, department_id) VALUE ("Area Manager","70000", 4);

-- Create Roles For Procurment Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Material-Handler","25000", 5);
INSERT INTO roles(title, salary, department_id) VALUE ("Non-Inventory Receiver","35000", 5);
INSERT INTO roles(title, salary, department_id) VALUE ("Procurment Analyst","80000", 5);
INSERT INTO roles(title, salary, department_id) VALUE ("Procurment Operations Manager","100000", 5);

-- Create Roles For Safety Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Haz-Waste Handler","35000", 6);
INSERT INTO roles(title, salary, department_id) VALUE ("Safety Coordinator","42000", 6);
INSERT INTO roles(title, salary, department_id) VALUE ("On-Site Medical Representative","75000", 6);
INSERT INTO roles(title, salary, department_id) VALUE ("Senior EHS Manager","140000", 6);
-- Create Roles For IT Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Tech support Associate","28000", 7);
INSERT INTO roles(title, salary, department_id) VALUE ("Engineer","65000", 7);
INSERT INTO roles(title, salary, department_id) VALUE ("IT Operations Manager","100000", 7);
-- Create Roles For Finance Department --
INSERT INTO roles(title, salary, department_id) VALUE ("Finance Manager","85000", 8);
INSERT INTO roles(title, salary, department_id) VALUE ("Senior Finance Manager","150000", 8);
-- Create GM --
INSERT INTO roles(title, salary) VALUE ("General Manager","200000");


-- Create Employees --

-- GM --
INSERT INTO employee(first_name, last_name, role_id) VALUE ("Joe","Shmoe", 31);
-- Senior Team --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Bill","Mason", 5, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Sally","Cooper", 10, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Tom","Heath", 15, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Larry","Cobb", 21, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Debbie","Le", 25, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Linda","Booth", 28, 1);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Gary","Wise", 30, 1);
-- Ops Managers -- 

-- Outbound --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Betty","Bull", 4, 2);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Alexia","Whittaker", 4, 2);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Jay","Rees", 4, 2);

-- Inbound --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Samantha","Rawlings", 9, 3);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Fleur","Butler", 9, 3);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("May","Ward", 9, 3);

-- PCF --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Katy","Perry", 15, 4);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Elizabeth","Figueroa", 15, 4);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Salma","Russell", 15, 4);

-- Procurment --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Feorgie","Cross", 20, 5);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Kaitlyn","Carlson", 20, 5);
-- Safety --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Ayla","Santos", 24, 6);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Alice","Stevens", 24, 6);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Hugo","Dickenson", 23, 6);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Tommy","Pickles", 23, 6);

-- IT --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Ayla","Santos", 27, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Alice","Stevens", 27, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Hugo","Dickenson", 26, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Tommy","Pickles", 26, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Chuck","Booth", 26, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Tim","Dim", 26, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Fillet","Mignon", 26, 7);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Arthor","Camelot", 26, 7);

-- Finance -- 
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Luke","SkyWalker", 29, 8);
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Obi Wan","Kenobi", 29, 8);

-- Area Managers --
-- Outbound -- 

-- Vender Returns --
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Ciaran","Peters", 4, 2;
INSERT INTO employee(first_name, last_name, role_id,manager_id) VALUE ("Lola","Goodwin", 4, 2);




