const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
app = express();
const  knex = require('knex');

  const db =   knex({
  client: 'pg',
  connection: {
  host : '127.0.0.1',
  user : 'postgres',
  password : 'test',
  database : 'smartbrain'
  }
  });



// //custom databases
// database = {

// users:
//  [
//      {
//        id:'123',
//        name:'Muhammad Faisal',
//        email:"Mf@gmail.com",
//        password:'professional',
//        entries:0,
//        joined: new Date(),
//      },

//      {
//        id:'124',
//        name:'Adnan Qureshi',
//        email:"aq@gmail.com",
//        password:'pass123',
//        entries:0,
//        joined: new Date(),
//      },

//      {
//        id:'125',
//        name:'Khezer Abbasi',
//        email:"ka@gmail.com",
//        password:'abbasi',
//        entries:0,
//        joined: new Date(),
//      },

     
//    ]

//  }

    //parse midlleware------------------------------------------------------

    app.use(bodyParser.json());
    app.use(cors());

    //root Server router ----------------------------------------------------

    app.get('/' ,  (req,res)=>{
    db.select('*').from('users')
    .then(user=>{
      res.json(user)
      })
    .catch(err=>
      res.json('couldnot get users'))
    
    })

    //SignIn Server router------------------------------------------------------


app.post('/signin' , (req,res) =>
     {
      const {email ,password} = req.body;
   
     if(!email || !password){
      return res.status(400).json('UnValid form Submission')
    }
    db.select('email' ,'hash').from('login').where('email' , '=' , email)
    .then(data =>{
    const isValid = bcrypt.compareSync(password , data[0].hash);
    if(isValid){
    db.select('*').from('users').where('email', '=' , email)
    .then(user=>{
      res.json(user[0])
    })
    .catch(err=>{
      res.status(400).json('Unable to get user!')
    })
    }else{
      res.status(400).json('wrong credentials')
    }
    })
    .catch(err=>{
       res.status(400).json('wrong credentials')
 
    })
    })

//Rgister Server router---------------------------------------------------


    app.post('/register' , (req,res)=>{
    const {name , email , password} = req.body;
    if(!name || !email || !password){
      return res.status(400).json('UnValid form Submission')
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx =>{
    trx.insert({
      hash:hash,
      email:email
    })
    .into('login')
    .returning('email')
    .then(loginEmail=>{

      db('users')
    .returning('*')
    .insert({

    name:name,
    email:loginEmail[0],
    joined: new Date()
    })
    .then(user=>{
     res.json(user[0]);
    })
    })
    .then(trx.commit)
    .catch(trx.rollback)
    })
    .catch(err =>
    res.status(400).json('Unable To joing'))

   
    })
//profile id router------------------------------------------------

    app.get('/profile/:id' , (req,res)=>{
    const { id } = req.params;
    db('users').select('*').where({
    id:id
    })
    .then(user=>{
    if(user.length){
      res.json(user)
    }
    else{
      res.status(400).json("User does'nt Exist")
        }

    })

    })


//increasing enteries router------------------------------------------------

      app.put('/image' , (req,res)=>{
      const { id } = req.body;
      db('users').where('id' , '=' , id)
      .increment('entries' , 1)
      .returning('entries')
      .then(entries =>{
        res.json(entries[0])
      })
      .catch(err =>{
        res.json('you cannot enter')
      })

      })


//listing at port 3000  --------------------------------------------


    app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`App is Running on Port 3000 ${process.env.PORT}`)
    });


//End points -----------------------------------------------------

/*
1) => '/' ---> it's working
2) => '/signin' ---> post = Success Or Fail
3) => '/Regiter' ---> post = user
4) => '/profile/:userid' ---> get = user
5) => '/image' -----------> put=user
*/