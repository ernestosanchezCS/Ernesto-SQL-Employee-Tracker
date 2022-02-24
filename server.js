const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

require("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const options = [
    "View employees",
    "Add employee",
    "Update employee role",
    "View roles",
    "Add role",
    "View departments",
    "Add department",
    "View employees by department",
    "Delete a department",
    "Delete a role",
    "Delete an employee",
    "View department budgets",
    "Quit",
];

const cycle = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "choices",
                message: "What would you like to do?",
                choices: options,
            },
        ])
        .then((answers) => {
            const { choices } = answers;
            if (choices === "View employees") {
                viewEmployees();
            } else if (choices === "Add employee") {
                addEmployee();
            } else if (choices === "Update employee role") {
                updateEmployee();
            } else if (choices === "View roles") {
                viewRoles();
            } else if (choices === "Add role") {
                addRole();
            } else if (choices === "View departments") {
                viewDepartments();
            } else if (choices === "Add department") {
                addDepartment();
            } else if (choices === "View employees by department") {
                employeeByDepartment();
            } else if (choices === "Delete a department") {
                deleteDepartment();
            } else if (choices === "Delete a role") {
                deleteRole();
            } else if (choices === "Delete an employee") {
                deleteEmployee();
            } else if (choices === "View department budgets") {
                viewDepartmentBudgets();
            } else if (choices === "Quit") {
                connection.end();
            }
        });
};

viewEmployees = () => {
    console.log("\n...Showing all employees...\n");
    connection.query(
        `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department,
    role.salary, 
    CONCAT (manager.first_name, " ", manager.last_name) AS manager
FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`,
        (err, rows) => {
            if (err) throw err;
            //to display simply console.table rows thats returned from our sql query
            console.table(rows);
            cycle();
        }
    );
};

addEmployee = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "first",
                message: "Enter Employee's First Name:",
            },
            {
                type: "input",
                name: "last",
                message: "Enter Employee's Last Name:",
            },
        ])
        .then((answer) => {
            const params = [answer.first, answer.last];
            connection.query(
                `SELECT role.id, role.title FROM role`,
                (err, data) => {
                    if (err) throw err;
                    const roles = data.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                name: "role",
                                message: "Please Select Employee's Role: ",
                                choices: roles,
                            },
                        ])
                        .then((roleChoice) => {
                            params.push(roleChoice.role);

                            connection.query(
                                `SELECT * FROM employee`,
                                (err, data) => {
                                    if (err) throw err;

                                    const managers = data.map(
                                        ({ id, first_name, last_name }) => ({
                                            name: first_name + " " + last_name,
                                            value: id,
                                        })
                                    );

                                    inquirer
                                        .prompt([
                                            {
                                                type: "list",
                                                name: "manager",
                                                message:
                                                    "Select Employee's Manager: ",
                                                choices: managers,
                                            },
                                        ])
                                        .then((managerChoice) => {
                                            const manager =
                                                managerChoice.manager;
                                            params.push(manager);
                                            //we have all info needed here in params to query DB
                                            connection.query(
                                                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`,
                                                params,
                                                (err, result) => {
                                                    if (err) throw err;
                                                    console.log(
                                                        "\n...Employee Added!..."
                                                    );
                                                    viewEmployees();
                                                }
                                            );
                                        });
                                }
                            );
                        });
                }
            );
        });
};

updateEmployee = () => {
    connection.query(`SELECT * FROM employee`, (err, data) => {
        if (err) throw err;

        const employeeList = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
        }));

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "name",
                    message: "Select Employee: ",
                    choices: employeeList,
                },
            ])
            .then((employeeChoice) => {
                const params = [employeeChoice.name];

                connection.query(`SELECT * FROM role`, (err, data) => {
                    if (err) throw err;
                    const roles = data.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                name: "role",
                                message: "Select New Role: ",
                                choices: roles,
                            },
                        ])
                        .then((roleChoice) => {
                            const role = roleChoice.role;
                            params.push(role);
                            //re-arrange the order of params
                            params[1] = params[0];
                            params[0] = role;

                            connection.query(
                                `UPDATE employee SET role_id = ? WHERE id = ?`,
                                params,
                                (err, result) => {
                                    if (err) throw err;
                                    console.log(
                                        "\n...Employee Role Updated!..."
                                    );
                                    viewEmployees();
                                }
                            );
                        });
                });
            });
    });
};

viewRoles = () => {
    console.log("\n...Showing all roles...\n");

    connection.query(
        `SELECT role.id, role.title AS roles FROM role`,
        (err, rows) => {
            if (err) throw err;
            console.table(rows);
            cycle();
        }
    );
};

addRole = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "role",
                message: "Enter New Role: ",
            },
            {
                type: "input",
                name: "salary",
                message: "Enter New Role Salary: ",
            },
        ])
        .then((answer) => {
            const params = [answer.role, answer.salary];

            connection.query(`SELECT name, id FROM department`, (err, data) => {
                if (err) throw err;

                const deptList = data.map(({ name, id }) => ({
                    name: name,
                    value: id,
                }));

                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "dept",
                            message: "Select Department: ",
                            choices: deptList,
                        },
                    ])
                    .then((deptChoice) => {
                        params.push(deptChoice.dept);

                        connection.query(
                            `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`,
                            params,
                            (err, result) => {
                                if (err) throw err;
                                console.log(
                                    "\n...Added " + params[0] + " to roles!..."
                                );
                                viewRoles();
                            }
                        );
                    });
            });
        });
};

viewDepartments = () => {
    console.log("\n...Showing Departments...\n");
    connection.query(
        `SELECT department.id, department.name AS department FROM department`,
        (err, rows) => {
            if (err) throw err;
            console.table(rows);
            cycle();
        }
    );
};

addDepartment = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "addDept",
                message: "What department do you want to add?",
            },
        ])
        .then((answer) => {
            connection.query(
                `INSERT INTO department (name)
            VALUES (?)`,
                answer.addDept,
                (err, result) => {
                    if (err) throw err;
                    console.log(
                        "\n...Added " + answer.addDept + " to departments!..."
                    );
                    viewDepartments();
                }
            );
        });
};

employeeByDepartment = () => {
    console.log("\n...Displaying Employees by departments...\n");
    connection.query(
        `SELECT employee.first_name, 
    employee.last_name, 
    department.name AS department
FROM employee 
LEFT JOIN role ON employee.role_id = role.id 
LEFT JOIN department ON role.department_id = department.id`,
        (err, rows) => {
            if (err) throw err;
            console.table(rows);
            cycle();
        }
    );
};

deleteDepartment = () => {
    connection.query(`SELECT * FROM department`, (err, data) => {
        if (err) throw err;

        const departmentList = data.map(({ name, id }) => ({
            name: name,
            value: id,
        }));
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "departmentSelect",
                    message: "Select Department to Delete: ",
                    choices: departmentList,
                },
            ])
            .then((departmentChoice) => {
                connection.query(
                    `DELETE FROM department WHERE id = ?`,
                    departmentChoice.departmentSelect,
                    (err, result) => {
                        if (err) throw err;
                        console.log("\n...Department Successfully deleted!...");
                        viewDepartments();
                    }
                );
            });
    });
};

deleteRole = () => {
    connection.query(`SELECT * FROM role`, (err, data) => {
        if (err) throw err;

        const roleList = data.map(({ title, id }) => ({
            name: title,
            value: id,
        }));
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "roleSelected",
                    message: "Select a Role to Delete: ",
                    choices: roleList,
                },
            ])
            .then((roleChoice) => {
                connection.query(
                    `DELETE FROM role WHERE id = ?`,
                    roleChoice.roleSelected,
                    (err, result) => {
                        if (err) throw err;
                        console.log("Role Deleted!");
                        viewRoles();
                    }
                );
            });
    });
};

deleteEmployee = () => {
    connection.query(`SELECT * FROM employee`, (err, data) => {
        if (err) throw err;

        const employeeList = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
        }));

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "name",
                    message: "Select Employee to Delete: ",
                    choices: employeeList,
                },
            ])
            .then((empChoice) => {
                connection.query(
                    `DELETE FROM employee WHERE id = ?`,
                    empChoice.name,
                    (err, result) => {
                        if (err) throw err;
                        console.log("Successfully Deleted!");

                        viewEmployees();
                    }
                );
            });
    });
};

viewDepartmentBudgets = () => {
    console.log("\n...Department Budgets...\n");

    const sql = `SELECT department_id AS id, 
                      department.name AS department,
                      SUM(salary) AS budget
               FROM  role  
               JOIN department ON role.department_id = department.id GROUP BY  department_id`;

    connection.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        cycle();
    });
};

connection.connect((err) => {
    if (err) throw err;
    successfulConnection();
});

successfulConnection = () => {
    console.log("***********************************");
    console.log("*                                 *");
    console.log("*                                 *");
    console.log("*           WELCOME TO:           *");
    console.log("*        EMPLOYEE MANAGER         *");
    console.log("*                                 *");
    console.log("*                                 *");
    console.log("*      BY: ERNESTO SANCHEZ        *");
    console.log("*                                 *");
    console.log("***********************************");
    cycle();
};
