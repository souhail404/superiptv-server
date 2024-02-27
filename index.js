// dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');

// import ROUTERS
const UserRouter = require('./routes/UserRoute');
const CodeRouter = require('./routes/CodeRoute');
const ServerRouter = require('./routes/ServerRoute');
const PanelRouter = require('./routes/PanelRoute');
const OrderServerRouter = require('./routes/OrderServerRoute');
const OrderCodeRouter = require('./routes/OrderCodeRoute');
const OrderPanelRouter = require('./routes/OrderPanelRoute');
const SoldHistoryRouter = require('./routes/SoldHistoryRoute');
const ShopRouter = require('./routes/ShopRoute');
const LinkRouter = require('./routes/LinkRoute');

// start the app
const app = express(); 

// variables
const PORT = process.env.PORT || 4000;
const MONGO_DB = process.env.MONGO_DB;

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use((err, req, res, next) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }
});


// database connection
mongoose.connect(MONGO_DB) 
        .then(()=>{
            // listen to requests
            app.listen(PORT, () =>{
                console.log('listning to port' , process.env.PORT , 'and connected to db' )
            });
        })
        .catch((error)=>{
            console.log(error)
        });

// api routes
app.use('/api/user/', UserRouter);
app.use('/api/code/', CodeRouter);
app.use('/api/server/', ServerRouter);
app.use('/api/panel/', PanelRouter);
app.use('/api/link/', LinkRouter);
app.use('/api/order-server/', OrderServerRouter);
app.use('/api/order-code/', OrderCodeRouter);
app.use('/api/order-panel/', OrderPanelRouter);
app.use('/api/sold-history/', SoldHistoryRouter);
app.use('/api/general/', ShopRouter);
