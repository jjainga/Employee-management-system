const inquirer = require("inquirer");
const chalk = require("chalk");
const mysql = require("mysql2");
const chalkTable = require("chalk-table");
const consoleTable = require("table");


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
        //Switch case to direct the user to the correct series of prompts based on thier first selection
        switch(response.start) {
            case "Add an Employee":
                //Selecting all departments to generate a list for the user to select 
                connection.query("SELECT * FROM department", function (err, response) {
                    if(err) {
                        throw err;
                    }else{
                    inquirer.prompt({
                        name: "addWhere",
                        message: "What department would you like to add the employee to?",
                        type: "list",
                        choices: function() {
                            //looping through the department table to give the user choices for each department
                            let departmentArr = [];
                            for (let i = 0; i < response.length; i++) {
                                departmentArr.push(response[i].name);
                            }
                            return departmentArr;
                            }
                        }
                    ).then(function(answer) {
                        //creating a variable to hold current department
                        let currentDepartment = answer.addWhere
                        //selecting all the roles with in the current department
                        connection.query("SELECT roles.title FROM roles JOIN department ON roles.department_id = department.department_id WHERE department.name = ?", answer.addWhere, function(err, data) {
                            if(err) {
                                throw err;
                            }else {
                                inquirer.prompt({
                                    name: "whichRole",
                                    message: "What role is the new employee going to have?",
                                    type: "list",
                                    choices: function() {
                                        //looping through the roles array and only pushing the roles for the current department
                                        let roleArr = [];
                                        for (let i = 0; i < data.length; i++) {
                                            roleArr.push(data[i].title);
                                        }
                                        return roleArr;
                                        }
                                }).then(function(answer) {
                                    //selecting employess and creating a variable below inorder to save employee id nunmbers
                                    connection.query("SELECT roles.role_id, roles.title, department.department_id, department.name FROM roles JOIN department ON roles.department_id = department.department_id WHERE roles.title = ? AND department.name = ?", [answer.whichRole, currentDepartment], function(err,dataResponse) {
                                        if(err) {
                                            throw err;
                                        }
                                        else{ 
                                            let employeeInfo = dataResponse;
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
                                                //Turning the manager selected into an array in order to put both names into the nest query
                                                let manager = answer.manager.split(' ');
                                                //selecting employees by id inorder to set manager id
                                                connection.query("SELECT * FROM employee WHERE first_name = ? AND last_name = ?", [manager[0], manager[1]], function(err,data) {
                                                    if(err) {
                                                        throw err;
                                                    }else if (data.length === 0) {
                                                        console.log("Not a manager, please try again");
                                                    }else {
                                                    //Inserting into the employee table with a new employee who has a role, department and a manager
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
                //Selecting all departments to generate a list for the user to select 
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
                        //looking through the department table to find the correct id
                        let dept_id = 0;
                        for(let i = 0; i < departmentInfo.length; i++) {
                            if (departmentInfo[i].name === currentDepartment) {
                                 dept_id = departmentInfo[i].department_id;
                            }
                        }
                        //Creating a new role for the selected department and inserting it into the roles table
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
                //Asking user what department they want to create
                inquirer.prompt({
                    name: "newDepartment",
                    message: "What would you like the new Department to be named?",
                    type: "input"
                }).then(function(answer) {
                    //Inserting new departmenet into the department table
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
                            //calling a function that selects all employees
                            allEmployees();
                            break;
                        case "Role":
                            //Calling a function that selects all roles
                            allRoles();
                            break;

                        case "Department":
                            //Selects the depatment table and gives the departments as choices for the user
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
                                    //Selects all the employees in a selected department
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
                            //User inputs the name of the manager that want to look up
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
                                        //selecting all employees under the selected manager
                                    connection.query("SELECT employee.first_name, employee.last_name, roles.title FROM employee JOIN roles ON employee.role_id = roles.role_id WHERE manager_id = ?", [data[0].employee_id], function(err,data) {
                                        if(err) {
                                         throw err;
                                         //selected manager is not in the employee table it will not execute
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
                            break;
                        }
                        
                });
                break;
            case "Budget":
                //Selects the department
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
                        //Selects all employees in the department and sums their salarys to give the department budget
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
                //Selects department
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
                        //Selects employees in the selected department and displays them as choices for the user
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
                            //Creating a variable to save the users response to and then transforming it into an array to select values
                            let employeeInfo = answer.update.split("/")
                            inquirer.prompt({
                                name: "whatupdate",
                                message: "Which would you like to update?",
                                type: "list",
                                choices: ["Role", "Manager"]
                            }).then(function(result) {
                                switch (result.whatupdate) {
                                    case "Role":
                                        //After selected department the user is then prompted to select which role the employee is going to change to 
                                        connection.query("SELECT roles.role_id, roles.title, department.name FROM roles LEFT JOIN department ON roles.department_id = department.department_id", function(err,response) {
                                            if(err) {
                                                throw err;
                                            }else {
                                                inquirer.prompt({
                                                    name: "whichRole",
                                                    messsage: "What is the role you would like to move this employee to?",
                                                    type: "list",
                                                    choices: function() {
                                                        //loops through all roles
                                                        let roleArr = [];
                                                        for (let i = 0; i < response.length; i++) {
                                                            roleArr.push(response[i].role_id + "/" + response[i].title + "/" + response[i].name );
                                                        }
                                                        return roleArr;
                                                        } 
                                                        }).then(function(answer) {
                                                            //Create vaiable to save answer to and transform into an array in order to select values from them
                                                            let roleInfo = answer.whichRole.split("/")
                                                            //updates selected employee with new role
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
                                        //Ask user for the manager_id
                                        inquirer.prompt([
                                            {
                                                name: "manager_id",
                                                message: "What is the ID of the manager you wish to move to?",
                                                type: "number" 
                                            },
                                            {
                                                name: "employee_id",
                                                message: "What is the ID on the employee you are updating?",
                                                type: "number"
                                            }]).then(function(answer) {
                                                let newManager = answer.manager_id;
                                                let currentEmployee = answer.employee_id;
                                                console.log(newManager);
                                                console.log(currentEmployee);
                                                //Create update query and set the new manager id as the vale where the employee id matches
                                               
                                                    connection.query("UPDATE employee SET manager_id = ? WHERE employee_id = ?", [newManager, currentEmployee], function(err, data) {
                                                    if(err) {
                                                        throw err;
                                                    }else {
                                                        
                                                        console.log("Sucess!")
                                                    }
                                                })
                                                        //Select all employees
                                                
                                                    connection.query("SELECT first_name, last_name FROM employee WHERE employee_id IN (?,?)",[newManager, currentEmployee], function(err, result) {
                                                    if(err) {
                                                        throw err;
                                                    }else {
                                                        console.log(result)
                                                       console.log(result[0].first_name + " " + result[0].last_name + " is the new manager for " + result[1].first_name + " " + result[1].last_name + "!");
                                                    }   
                                                    promptUser();
                                                })
                                                 
                                            })
                                        break;
                                }
                            })
                        })
                    }})
                })
            }})
                break;
            case "Delete Records":
                inquirer.prompt(
                    {
                        name: "choice",
                        message: "What record would you like to delete?",
                        type: "list",
                        choices: ["Employee", "Role", "Department"]
                    }
                ).then(function(response) {
                    switch (response.choice) {
                        case "Employee":
                            inquirer.prompt( {
                                name: "employee",
                                message: "What is the ID of the employee you wish to delete?",
                                type: "number"
                            }).then(function(answer) {
                                connection.query("DELETE FROM employee WHERE employee_id = ?", answer.employee, function(err,data) {
                                    if(err) {
                                        throw err;
                                    }else {
                                        console.log("Employee was deleted!")
                                    }
                                })
                            })
                            break;
                        case "Role":
                            inquirer.prompt( {
                                name: "role",
                                message: "What is the ID of the role you wish to delete?",
                                type: "number"
                            }).then(function(answer) {
                                connection.query("DELETE FROM roles WHERE role_id = ?", answer.role, function(err,data) {
                                    if(err) {
                                        throw err;
                                    }else {
                                        console.log("Role was deleted!")
                                    }
                                })
                            })
                            break;
                        case "Department":
                            inquirer.prompt( {
                                name: "department",
                                message: "What is the ID of the department you wish to delete?",
                                type: "number"
                            }).then(function(answer) {
                                connection.query("DELETE FROM department WHERE department_id = ?", answer.department, function(err,data) {
                                    if(err) {
                                        throw err;
                                    }else {
                                        console.log("department was deleted!")
                                    }
                                })
                            })
                            break;
                    }
                })
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
    connection.query("SELECT roles.role_id, roles.title, roles.salary, department.name FROM roles LEFT JOIN department ON roles.department_id = department.department_id", function(err,data) {
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


