
const program = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs');
const path = require('path');
const util = require('util');

const jsonObj = '{"todos":[]}';
const removeJsonObj = '{"removedItems":[]}';

program
  .version('0.0.1')
  .description('This is a TODO application');

const STORAGE_PATH = path.resolve('./TODOs.json');
const REMOVED_TODOS_PATH = path.resolve('./RemovedItems.json');
const { O_APPEND, O_RDONLY, O_CREAT } = fs.constants;

//turn async func into promise
const fsOpen = util.promisify(fs.open);
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);


function getAllTodos() {
  return fsReadFile(STORAGE_PATH, { encoding: 'utf8', flag: O_RDONLY | O_CREAT })
    .then((data) => {
      if (data=='')
        data = jsonObj;
      return JSON.parse(data);
    })
    .then((storage) => {
      return storage.todos;
    });
}

function getAllRemovedTodos() {
  return fsReadFile(REMOVED_TODOS_PATH, { encoding: 'utf8', flag: O_RDONLY | O_CREAT })
    .then((data) => {
      if (data=='')
        data = removeJsonObj;
      return JSON.parse(data);
    })
    .then((storage) => {
      return storage.removedTodos;
    });
}

function saveAllTodos(todos) {
  return fsOpen(STORAGE_PATH, O_APPEND | O_CREAT)
    .then(() => {
      fsWriteFile(STORAGE_PATH, JSON.stringify({ todos }));
    });
}

function saveAllRemovedTodos(removedTodos) {
  return fsOpen(REMOVED_TODOS_PATH, O_APPEND | O_CREAT)
    .then(() => {
      fsWriteFile(REMOVED_TODOS_PATH, JSON.stringify({ removedTodos }));
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

function findTodoIndex(id, todos) {
  return todos.findIndex((todo) => todo.id === id);
}

function createTodo(data) {
  return {
    id: guid(),
    ...data,
    comment: null,
    isLiked: false,
  };
}

function updateTodo(change, todo) {
  return {
    ...todo,
    ...change
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

function readTodoItem(id) {
  return getAllTodos()
  .then((todos) => {
    const index = findTodoIndex(id, todos);
    const target = todos[index];
    if (target != undefined) {
      return target;
    }
    else {
      return 'TODO item not found';
    }
  })
}

function removeTodoItem(id) {
  return getAllTodos()
  .then((todos) => {
    const index = findTodoIndex(id, todos);
    const result = [...todos];
    const target = todos[index];
    if (target != undefined) {
      const removedItem = ((result.splice(index, 1))[0]);
      return saveAllTodos(result)
      .then (() => {
        return getAllRemovedTodos()
        .then((removedTodos) =>{
        removedResult = [...removedTodos, removedItem]
        return saveAllRemovedTodos(removedResult)
        })
        .then(() => 'Removed items: ' + removedResult.length)
      });
    }else{
      return 'TODO item not found';
    }
  })
}

function updateTodoItem(id, change) {

  return getAllTodos()
  .then((todos) => {
     const index = findTodoIndex(id, todos);
     const result = [...todos];
     const target = todos[index];

    result.splice(index, 1, updateTodo(change, target));
    return saveAllTodos(result);

  })
  .then(() => (id))
}

function likeTodoItem(id, change) {
  return getAllTodos()
  .then((todos) => {
    const index = findTodoIndex(id, todos);
    const result = [...todos];
    const target = todos[index];
    if (target != undefined) {
      result.splice(index, 1, updateTodo(change, target));
      console.log("Like status: " + result[index].isLiked);
      return  saveAllTodos(result);
    }else {
      console.log('TODO item not found');
    }
  })
}

function commentTodoItem(id, change) {
  return getAllTodos()
  .then((todos) => {
    const index = findTodoIndex(id, todos);
    const result = [...todos];
    const target = todos[index];
      result.splice(index, 1, updateTodo(change, target));
      return  saveAllTodos(result);
  })
  .then(() => (id))
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

const updateQuestions = [
  {
    type : 'input',
    name : 'title',
    message : 'New title...',
  },
  {
    type : 'input',
    name : 'description',
    message : 'New description...',
  },
];

const commentQuestions = [
  {
    type : 'input',
    name : 'comment',
    message : 'Comment...',
  },
];


program
  .command('create')
  .alias('cr')
  .description('Create new TODO item')
  .action(() => {
    prompt(createQuestions)
      .then(({ title, description }) => createTodoItem({ title, description }))
      .then(print)
      .catch((e) => {
        throw e;
      });
  });

  program
  .command('list')
  .alias('ls')
  .description('List all TODOs')
  .action(() => {
    getAllTodos().then(print)
  });

  program
  .command('read <id>')
  .alias('r')
  .description('Print TODO item')
  .action((id) => {
    readTodoItem(id)
    .then(print)
    .catch((e) => {
      throw e;
    })
  })

  program
  .command('remove <id>')
  .alias('re')
  .description('Remove TODO item')
  .action((id) =>{
    removeTodoItem(id)
    .then(print)
    .catch((e) => {
      throw e;
    })
  })

  program
  .command('update <id>')
  .alias('up')
  .description('Update TODO item')
  .action((id) => {
    return getAllTodos()
    .then((todos) => {
      const index = findTodoIndex(id, todos);
    //  const result = [...todos];
      const target = todos[index];
      if (target != undefined) {
        prompt(updateQuestions)
        .then(({ title, description }) => updateTodoItem(id, { title, description }))
        .then(print)
        .catch((e) => {
          throw e;
        })
      }else {
        console.log('TODO item not found')
      }

    })
  })

  program
  .command('like <id>')
  .alias('l')
  .description('Like TODO item')
  .action((id) => {
    likeTodoItem(id, {isLiked:true})
    //.then(print)
      .catch((e) => {
      throw e;
      })
  })

  program
  .command('unlike <id>')
  .alias('ul')
  .description('Like TODO item')
  .action((id) => {
    likeTodoItem(id, {isLiked:false})
    //.then(print)
      .catch((e) => {
      throw e;
      })
  })

  program
  .command('comment <id>')
  .alias('cm')
  .description('Comment TODO item')
  .action((id) => {
    prompt(commentQuestions)
    .then(({comment}) => commentTodoItem(id, {comment}))
    .then(print)
      .catch((e) => {
      throw e;
      })
  })

program.parse(process.argv);
