const program = require('commander');
const { addTodo, getTodo } = require('./logic');

program
  .version('0.0.1')
  .description('TODO app');

program
  .command('addTodo <title> <description>')
  .alias('a')
  .description('Add TODO')
  .action((title,description) => {
    addTodo({title,description});
  });

program
  .command('getTodo <id>')
  .alias('r')
  .description('Get Todo')
  .action(id => getTodo(id));

program.parse(process.argv);
