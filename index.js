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
            choices: ["Add an Employee", "Add a Role", "Add a Department", "Search","Budget", "Quit"]
        }
    ]).then(function(response) {
        switch(response.start) {
            case "Add an Employee":
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
                // console.log(chalk.cyanBright("Hello World"));
            case "Add a Department":
                // console.log(chalk.red("Hello World"));
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
            case "Quit":
                console.log("Good-Bye!")
                connection.end();
                break;
            
            default:
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

