const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const passportSetup = require('./passport');
const authRoute = require('./api/google/auth');
const Register = require('./api/users/Register');
const Login = require('./api/users/Login');
const CreateOrder = require('./api/orders/CreateOrder');
const GetOrders = require('./api/orders/GetOrders');
const GetOrderById = require('./api/orders/GetOrderById');
const UpdateOrderById = require('./api/orders/UpdateOrder');
const DeleteOrderById = require('./api/orders/DeleteOrder');
const CreateToken = require('./api/google/createToken');


const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", methods: "GET,POST,PUT,DELETE", credentials: true }));


app.use(function (req, res, next) { res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"); next(); });

app.use(session({
  secret: 'markus-astragor',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);

app.use(Register.router);
app.use(Login.router);
app.use(CreateOrder.router);
app.use(GetOrders.router);
app.use(GetOrderById.router);
app.use(UpdateOrderById.router);
app.use(DeleteOrderById.router);
app.use(CreateToken.router);

module.exports = { app };
