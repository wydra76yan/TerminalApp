
const program = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs');
const path = require('path');
const util = require('util');

program
  .version('0.0.1')
  .description('This is a TODO application');

const STORAGE_PATH = path.resolve('./TODOs.json');
const ACCOUNT_ID = 1;
const { O_APPEND, O_RDONLY, O_CREAT } = fs.constants;

//turn async func into promise
const fsOpen = util.promisify(fs.open);
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);


function getAllTodos() {
  return fsReadFile(STORAGE_PATH, { encoding: 'utf8', flag: O_RDONLY | O_CREAT })
    .then((data) => {
      let jsonText = data;
      return JSON.parse(jsonText);
    })
    .then((storage) => {
      return storage.todos;
    });
}

function saveAllTodos(todos) {
  return fsOpen(STORAGE_PATH, O_APPEND | O_CREAT)
    .then(() => {
      fsWriteFile(STORAGE_PATH, JSON.stringify({ todos }));
    });
}

function guid() {
  function s4() {
    return Math.floor(( Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + '-' + s4();
}

function print(...args) {
  console.info(...args);
}

function createTodo(data) {
  return {
    id: guid(),
    ...data,
    comment: null,
    isLiked: false,
  };
}

function createTodoItem(data) {
   let todoId;
  return getAllTodos()
    .then((todos) => {
      const todo = createTodo(data);
      todoId = todo.id;
      const result = [...todos, todo];
      return saveAllTodos(result);
    })
    .then(() => todoId);
}


const createQuestions = [
  {
    type : 'input',
    name : 'title',
    message : 'Enter title ...'
  },
  {
    type : 'input',
    name : 'description',
    message : 'Enter description ...'
  },
];


program
  .command('create')
  .description('Create new TODO item')
  .action(() => {
    prompt(createQuestions)
      .then(({ title, description }) => createTodoItem({ title, description }))
      .then(print)
      .catch((error) => {
        throw error;
      });
  });

program.parse(process.argv);
