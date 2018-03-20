const program = require('commander');
const { prompt } = require('inquirer');

program
  .version('0.0.1')
  .description('TODO app');

// Craft questions to present to users
const createTODOs = [
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

const todos = [];

program
  .command('create')
  .alias('cr')
  .description('Create new TODO item')
  .action(() => {
    prompt(createTODOs).then(answers => {
      todos.push(answers);
    });
  });

  program
    .command('read')
    .alias('r')
    .description('Show TODO item by ID')
    .action(() => {
      prompt().then(answers => {
        console.log(answers);
    });
  });

  program
    .command('list')
    .alias('ls')
    .description('List all TODOs')
    .action(() => {
      prompt().then(answers => {
        console.log(todos[]);
    });
  });


program.parse(process.argv);
