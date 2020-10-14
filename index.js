const inquirer = require("inquirer");
const chalk = require("chalk");
const mysql = require("mysql2");
const chalkTable = require("chalk-table");


//Connect to mysql
var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "password",
    database: "employees_db"
  });
//Make conntection
  connection.connect(function(err) {
    if (err) {
        throw err;
    }else {
    console.log("connected as id " + connection.threadId);
    promptUser();
    }
})
//Create Questions for user
function promptUser() {
    inquirer.prompt([
        {
            name: "start",
            message: "What would you like to do?",
            type: "list",
            choices: ["Add an Employee", "Add a Role", "Add a Department", "Search","Budget", "Update Records", "Delete Records", "Quit"]
        }
    ]).then(function(response) {
        switch(response.start) {
            case "Add an Employee":``
                connection.query("SELECT * FROM department", function (err, response) {
                    if(err) {
                        throw err;
                    }else{
                    inquirer.prompt({
                        name: "addWhere",
                        message: "What department would you like to add the employee to?",
                        type: "list",
                        choices: function() {
                            let departmentArr = [];
                            for (let i = 0; i < response.length; i++) {
                                departmentArr.push(response[i].name);
                            }
                            return departmentArr;
                            }
                        }
                    ).then(function(answer) {
                        let currentDepartment = answer.addWhere
                        connection.query("SELECT roles.title FROM roles JOIN department ON roles.department_id = department.department_id WHERE department.name = ?", answer.addWhere, function(err, data) {
                            if(err) {
                                throw err;
                            }else {
                                inquirer.prompt({
                                    name: "whichRole",
                                    message: "What role is the new employee going to have?",
                                    type: "list",
                                    choices: function() {
                                        let roleArr = [];
                                        for (let i = 0; i < data.length; i++) {
                                            roleArr.push(data[i].title);
                                        }
                                        return roleArr;
                                        }
                                }).then(function(answer) {
                                    // console.log(answer.whichRole);
                                    // console.log(currentDepartment);
                                    connection.query("SELECT roles.role_id, roles.title, department.department_id, department.name FROM roles JOIN department ON roles.department_id = department.department_id WHERE roles.title = ? AND department.name = ?", [answer.whichRole, currentDepartment], function(err,dataResponse) {
                                        if(err) {
                                            throw err;
                                        }
                                        else{ 
                                            let employeeInfo = dataResponse;
                                                console.log(employeeInfo);
                                            inquirer.prompt([
                                             {
                                                name: "first",
                                                message: "What is the new employees first name?",
                                                type: "input"
                                            },
                                            {
                                                name: "last",
                                                message: "What is the new employees last name?",
                                                type: "input"
                                            },
                                            {
                                                name: "manager",
                                                message: "Who is the new employees manager?",
                                                type: "input"
                                            }
                                            ]).then(function(answer) {
                                                let manager = answer.manager.split(' ');
                                                console.log(manager);
                                                connection.query("SELECT * FROM employee WHERE first_name = ? AND last_name = ?", [manager[0], manager[1]], function(err,data) {
                                                    if(err) {
                                                        throw err;
                                                    }else if (data.length === 0) {
                                                        console.log("Not a manager, please try again");
                                                    }else {
                                                    connection.query("INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)", [answer.first, answer.last,employeeInfo[0].role_id, data[0].employee_id], function (err,data) {
                                                        if(err) {
                                                            throw err;
                                                        }else {
                                                            console.log("Employee Added!")
                                                        }
                                                        promptUser();
                                                    })
                                                    }
                                                })
                                    })}})
                            })
                        }})

                    })
                }})
                break;
            case "Add a Role":
                connection.query("SELECT * FROM department", function (err, response) {
                    let departmentInfo = response
                    if(err) {
                        throw err;
                    }else{
                    inquirer.prompt({
                        name: "addWhere",
                        message: "What department would you like to add the new role to?",
                        type: "list",
                        choices: function() {
                            let departmentArr = [];
                            for (let i = 0; i < response.length; i++) {
                                departmentArr.push(response[i].name);
                            }
                            return departmentArr;
                            }
                        }
                    ).then(function(answer) {
                        let currentDepartment = answer.addWhere
                        inquirer.prompt([
                        {
                            name: "title",
                            message: "What is the name of the role?",
                            type: "input"
                        },
                        {
                            name: "salary",
                            message: "What is the annual salary for the role?",
                            type: "number"
                        }
                    ]).then(function(answer) {
                        let dept_id = 0;
                        for(let i = 0; i < departmentInfo.length; i++) {
                            if (departmentInfo[i].name === currentDepartment) {
                                 dept_id = departmentInfo[i].department_id;
                            }
                        }
                        console.log(dept_id);
                        connection.query("INSERT INTO roles(title, salary, department_id) VALUES(?,?,?)", [answer.title, answer.salary, dept_id], function(err, data) {
                            if(err) {
                                throw err;
                            }else {
                                console.log("Role was Added!")
                            }
                            promptUser();
                        })
                    })
                    })
                }})
                    break;
            case "Add a Department":
                inquirer.prompt({
                    name: "newDepartment",
                    message: "What would you like the new Department to be named?",
                    type: "input"
                }).then(function(answer) {
                    connection.query("INSERT INTO department(name) VALUES(?)", answer.newDepartment, function(err, data) {
                        if(err) {
                            throw err;
                        }else {
                            console.log("Department was Added!")
                        }
                        promptUser();
                    })
                })
                break;
            case "Search":
                // console.log(chalk.blue("Hello World"));
                inquirer.prompt(
                        {
                        name: "Search",
                        message: "What would you like to search by?",
                        type: "list",
                        choices: ["All Employees", "Role", "Department", "Manager"]
                        }
                ).then(function(answer) {
                    switch(answer.Search) {
                        case "All Employees":
                            allEmployees();
                            break;
                        case "Role":
                            allRoles();
                            break;

                        case "Department":
                            connection.query("SELECT * FROM department", function (err, response) {
                                inquirer.prompt(
                                    {
                                     name: "department",
                                        message: "Which department would you like to view",
                                        type: "list",
                                        choices: function() {
                                            let departmentArr = [];
                                            for (let i = 0; i < response.length; i++) {
                                                departmentArr.push(response[i].name);
                                            }
                                            return departmentArr;
                                        }
        
                                    }
                                ).then(function(result) {
                                    connection.query("SELECT employee.first_name, employee.last_name, roles.title, department.name AS Department FROM employee JOIN roles JOIN department ON employee.role_id = roles.role_id AND roles.department_id = department.department_id WHERE department.name = ?",result.department, function(err,data) {
                                        if(err) {
                                            throw err;
                                        }else {
                                            console.table(data);
                                        }
                                        promptUser();
                                    })
                                })
                            })
                            break;

                        case "Manager":
                            inquirer.prompt( 
                                {
                                    name: "manager",
                                    message: "What manager would you like to see the employees of? Please use FIRST and LAST name.",
                                    type: "input"
                                }
                            ).then(function(answer) {
                                let manager = answer.manager.split(' ');
                                console.log(manager);
                                connection.query("SELECT * FROM employee WHERE first_name = ? AND last_name = ?", [manager[0], manager[1]], function(err,data) {
                                    if(err) {
                                        throw err;
                                    }else {
                                    connection.query("SELECT employee.first_name, employee.last_name, roles.title FROM employee JOIN roles ON employee.role_id = roles.role_id WHERE manager_id = ?", [data[0].employee_id], function(err,data) {
                                        if(err) {
                                         throw err;
                                        }else if (data.length === 0) {
                                            console.log("Not a manager");
                                        }else {
                                            console.table(data);
                                        }
                                    promptUser();
                                    })
                                }})
                            })  
                        default:

                        }
                        
                });
                break;
            case "Budget":
                connection.query("SELECT * FROM department", function (err, response) {
                    if(err) {
                        throw err;
                    }else{
                    inquirer.prompt({
                        name: "addWhere",
                        message: "What department would you like to see the budget for?",
                        type: "list",
                        choices: function() {
                            let departmentArr = ["Total Company Budget"];
                            for (let i = 0; i < response.length; i++) {
                                departmentArr.push(response[i].name);
                            }
                            return departmentArr;
                            }
                        }
                    ).then(function(answer) {
                        connection.query("SELECT department.name AS Department, SUM(roles.salary) AS Total_Budget FROM employee JOIN roles JOIN department ON employee.role_id = roles.role_id AND roles.department_id = department.department_id WHERE department.name = ?", answer.addWhere, function(err,data) {
                            if(err) {
                                throw err;
                            }else {
                                console.table(data)
                            }
                            promptUser();
                        })
                    })}
                })
                break;
            case "Update Records":
                connection.query("SELECT * FROM department", function (err, response) {
                    let departmentInfo = response
                    if(err) {
                        throw err;
                    }else{
                    inquirer.prompt({
                        name: "addWhere",
                        message: "What department is the employee you would like to update in?",
                        type: "list",
                        choices: function() {
                            let departmentArr = [];
                            for (let i = 0; i < response.length; i++) {
                                departmentArr.push(response[i].name);
                            }
                            return departmentArr;
                            }
                        }
                    ).then(function(answer) {
                        connection.query("SELECT employee.employee_id, employee.first_name, employee.last_name, roles.title, department.name FROM employee JOIN roles JOIN department ON employee.role_id = roles.role_id AND roles.department_id = department.department_id WHERE department.name = ?",answer.addWhere, function(err,data) {
                            if(err) {
                                throw err;
                            }else {
                            inquirer.prompt({
                            name: "update",
                            message: "Who would you like to update?",
                            type: "list",
                            choices: function() {
                                let employeeArr = [];
                            for (let i = 0; i < data.length; i++) {
                                employeeArr.push(data[i].employee_id + "/" + data[i].first_name + "/" + data[i].last_name + "/" + data[i].title + "/" + data[i].name);
                            }
                            return employeeArr;
                            }  
                        }).then(function(answer) {
                            console.log(answer)
                            let employeeInfo = answer.update.split("/")
                            inquirer.prompt({
                                name: "whatupdate",
                                message: "Which would you like to update?",
                                type: "list",
                                choices: ["Role", "Manager"]
                            }).then(function(result) {
                                switch (result.whatupdate) {
                                    case "Role":
                                        connection.query("SELECT roles.role_id, roles.title, department.name FROM roles LEFT JOIN department ON roles.department_id = department.department_id", function(err,response) {
                                            if(err) {
                                                throw err;
                                            }else {
                                                inquirer.prompt({
                                                    name: "whichRole",
                                                    messsage: "What is the role you would like to move this employee to?",
                                                    type: "list",
                                                    choices: function() {
                                                        let roleArr = [];
                                                        for (let i = 0; i < response.length; i++) {
                                                            roleArr.push(response[i].role_id + "/" + response[i].title + "/" + response[i].name );
                                                        }
                                                        return roleArr;
                                                        } 
                                                        }).then(function(answer) {
                                                            let roleInfo = answer.whichRole.split("/")
                                                            connection.query("UPDATE employee SET employee.role_id = ? WHERE employee.employee_id = ?", [roleInfo[0], employeeInfo[0]], function(err, data) {
                                                                if(err) {
                                                                    throw err;
                                                                }else {
                                                                    console.log("Sucessfully updated employee's role to " + roleInfo[1] + "!");
                                                                }
                                                                promptUser();
                                                            })
                                                    })
                                                }})
                                        break;
                                    case "Manager":
                                        break;
                                }
                            })
                        })
                    }})
                })
            }})
                break;
            case "Delete Records":
                break;
            default:
                console.log("Good-Bye!")
                connection.end();
                break;
       }
    })
}


//Create funciton to select all roles
function allRoles() {
    connection.query("SELECT roles.title, roles.salary, department.name FROM roles LEFT JOIN department ON roles.department_id = department.department_id", function(err,data) {
        if(err) {
            throw err;
        }else {
            console.table((data));
        }
        promptUser();
    })
}

//Create function to select all employees
function allEmployees() {
    connection.query("SELECT * FROM employee", function(err,data) {
        if(err) {
            throw err;
        }else {
            console.table((data));
        }
        promptUser();
    })
}

//Create function to get the budget for each department

//Create function to get employees by manager

