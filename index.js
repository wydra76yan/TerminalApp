const program = require('commander');
const { prompt } = require('inquirer');

program
  .version('0.0.1')
  .description('TODO app');

// Craft questions to present to users
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

const todos = [];

program
  .command('create')
  .alias('cr')
  .description('Create new TODO item')
  .action(() => {
    prompt(createQuestions).then(answers => {
      console.log(answers);
    });
  });


program.parse(process.argv);
