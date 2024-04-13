const express = require('express')
const cors = require('cors');
require('dotenv').config();
const jwt= require('jsonwebtoken');   
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

// username :dbjohnn1
// password:tx6kerv7KsEGK6Nz


const uri =process.env. MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


function verifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'Unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
    if(err){
      return res.status(403).send({message: 'Forbidden access'})
    }
    req.decoded= decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const partscollection = client.db('car-parts-manufacturer').collection('carParts')
    const ordercollection = client.db('car-parts-manufacturer').collection('order')
   const  usercollection = client.db('car-parts-manufacturer') .collection('user')
   const  reviewcollection = client.db('car-parts-manufacturer') .collection('review')


    //     ////////////data mongo thaka naouea\\\\\\\\\\\\
    app.get('/parts',async(req,res) => {
        const query = {};
        const cursor = partscollection.find(query)
        const part = await cursor.toArray();
        res.send(part)
    })

     ///////delet\\\\\\\\\\\
        app.delete('/parts/:id',async(req,res) => {
          const id = req.params.id;
          const query = {_id:new ObjectId(id)}
          const result = await partscollection.deleteOne(query)
          res.send(result)
    
        })

    // //////////data mongo tae daoue \\\\\\\\\\\\\\\
    app.post('/parts',async(req,res)=>{
      const order = req.body;
      const result = await partscollection.insertOne(order)
      res.send(result)
    })


    // //////////find one\\\\\\\\\\\\
    app.get('/parts/:id',async(req,res) => {
        const id =req.params.id;
        const query = {_id:new ObjectId(id)}
        const product = await partscollection.findOne(query)
        res.send(product)
    })

    // /////////cart order\\\\\\\\\\\
    app.post('/order',async(req,res)=>{
      const order = req.body;
      const result = await ordercollection.insertOne(order)
      res.send(result)
    })

    // /////////order Load korae\\\\\\\\
    app.get('/orders',async(req,res) => {
      const email =  req.query.email;
      const query = {Email:email}
      const order = await ordercollection.find(query).toArray()
      res.send(order)
  })

      // //////////put mane update if exists or insert if does not exist\\\\\\\\
      app.put('/user/:email',async(req,res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = {email: email};
        const options = {upsert : true}
        const updateDoc = {
          $set: user,  
        };
        const result = await usercollection.updateOne(filter,updateDoc,options);
        const token = jwt.sign({email:user.email},process.env.ACCESS_TOKEN_SECRET)
        res.send({result ,token})
  
      })

      // //////////user gulie kae load korae\\\\\\\\\\\
      app.get('/users',async(req,res) => {
        const query = {};
        const cursor = usercollection.find(query)
        const users = await cursor.toArray();
        res.send(users)
    })

    // /////////admin banano \\\\\\\
    app.put('/user/admin/:email',async(req,res) => {
      const email = req.params.email;
      const requester = req.params.email;
      
      const requesteraccount = await usercollection.findOne({email:requester})
     
      // if(requesteraccount.role == 'admin'){
        // console.log(requesteraccount)
        
        const filter = {email: email};
        // console.log(filter)
        const updateDoc = {
          $set: {role:'admin'},
        };
        const result = await usercollection.updateOne(filter,updateDoc);
        res.send(result )
    })

    // ////admin chara oi jaigae guli dakhabae naa\\\\\\\\\

    app.get('/admin/:email',async(req,res) => {
      const email = req.params.email;
      const user= await usercollection.findOne({email:email});
      const isAdmin = user.role === 'admin';
      res.send({admin: isAdmin})
    })
        ///////delet\\\\\\\\\\\
        app.delete('/users/:id',async(req,res) => {
          const id = req.params.id;
          const query = {_id:new ObjectId(id)}
          const result = await usercollection.deleteOne(query)
          res.send(result)
    
        })



    // /////////review gulikae mongo thakae naouea\\\\\\\\
    app.get('/review',async(req,res) => {
      const query = {};
      const cursor = reviewcollection.find(query)
      const part = await cursor.toArray();
      res.send(part)
  })

    // //////////data mongo tae daoue \\\\\\\\\\\\\\\
      app.post('/review',async(req,res)=>{
        const order = req.body;
        const result = await reviewcollection.insertOne(order)
        res.send(result)
      })




  } catch(error) {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})