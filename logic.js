const mongoose = require('mongoose');
const assert = require('assert');

mongoose.Promise = global.Promise;

function toLower() {
  return v.toLowerCase();
}

const todoSchema = mongoose.Schema({
  title: { type: String, set: toLower },
  description: { type: String, set: toLower }
});

const Todos = mongoose.model('Todos', todoSchema);

const addTodo = (todo) => {
  Todos.create(todo, (err) => {
    assert.equal(null, err);
    console.info('New TODO added');
    db.disconnect();
  });
};

const getTodo = (id) => {
  const search = new RegExp(id, 'i');
  Todos.find({$or: [{title: search }, {description: search }]})
  .exec((err, todo) => {
    assert.equal(null, err);
    console.info(todo);
    console.info(`${todo.length} matches`);
    db.disconnect();
  });
};

module.exports = {addTodo, getTodo};
