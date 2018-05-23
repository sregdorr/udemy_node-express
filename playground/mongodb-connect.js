const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err){
    return console.log('Error connecting to mongodb: ', err);
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // db.collection('Todos').insertOne({
  //   //   text: 'Something to do',
  //   //   completed: false
  //   // }, (err, res) => {
  //   //   if (err) {
  //   //     return console.log('Unable to insert todo', err);
  //   //   }
  //   //
  //   //   console.log(JSON.stringify(res.ops, undefined, 2));
  //   // });

  // db.collection('Users').insertOne({
  //   name: 'Russ',
  //   age: 34,
  //   location: 'Weatherford, TX'
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('Unable to add user: ', err);
  //   }
  //
  //   console.log(JSON.stringify(res.ops[0]._id.getTimestamp()));
  // });



  client.close();
});