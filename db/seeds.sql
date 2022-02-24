INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Maintenance");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 95000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 180000, 2),
       ("Software Engineer", 130000, 2),
       ("Account Manager", 120000, 3),
       ("Accountant", 110000, 3),
       ("Legal Team Lead", 190000, 4),
       ("Lawyer", 130000, 4),
       ("Janitor", 760000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John","Doe" ,1, NULL),
       ("Mike","Chan" ,2, 1),
       ("Ashley","Rodriguez" ,3, NULL),
       ("Kevin","Tupik" ,4, 3),
       ("Kunal","Singh" ,5, NULL),
       ("Malia","Brown" ,6, 5),
       ("Sarah","Lourd" ,7, NULL),
       ("Tom","Allan" ,8, 7),
       ("Ricky","Bobby", 9, NULL);