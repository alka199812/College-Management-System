const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/Admin/User");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

router.get('/',async(req,res)=>{
  const users = await User.find();
  res.send(users);
});

router.post("/register", async(req, res) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    console.log(isValid)
    if (!isValid) {
      console.log("This",errors);
     return res.status(400).json(errors);
    }
    let user=await User.findOne({ email: req.body.email });
      if (user) return res.status(400).json({ email: "Email already exists" });
      console.log(req.body.dob);
        user = new User({
          enroll: req.body.enroll,
          password:req.body.dob,
          firstName: req.body.firstName,
          middleName: req.body.middleName,
          lastName: req.body.lastName,
          gender: req.body.gender,
          dob: req.body.dob,
          mob_no: req.body.mob_no,
          email: req.body.email,
          altEmail: req.body.altEmail,
          address1: req.body.address1, 
          address2: req.body.address2,
          city: req.body.city,
          pincode: req.body.pincode,
          state: req.body.state,
          country: req.body.country,
          fname: req.body.fname,
          fat_mob_no: req.body.fat_mob_no,
          fth_email: req.body.fth_email,
          fOccu: req.body.fOccu,
          mname: req.body.mname,
          mth_mob_no: req.body.mth_mob_no,
          mth_email: req.body.mth_email,
          mOccu: req.body.mOccu,
          department: req.body.department,
          branch: req.body.branch,
          coursesEnrolledIn:req.body.coursesEnrolledIn
        });

        const salt =await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(user.password,salt);
        console.log(user.password)
        await user.save();
      
        res.send(user);
});    


router.post("/login",async(req, res) => {
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) return res.status(400).json(errors);
  console.log(req.body)
  const enroll = req.body.enroll;
  const password = req.body.password;
  // Find user by enrollment number
  let user=await User.findOne({ enroll });
      // Check if user exists
  if (!user) return res.status(404).json({ EnrollNotFound: "Enrollment Number not found" });

  const validPassword=await bcrypt.compare(password,user.password)
  console.log(validPassword)
  console.log(user)
  if(!validPassword) return res.status(400).send('Invalid Password.');

  const payload = {
    id:user._id,
    name: user.firstName+" "+user.lastName,
    enroll:user.enroll,
    gender:user.gender,
    dob:user.dob,
    email:user.email,
    altEmail:user.altEmail,
    address1:user.address1,
    address2:user.address2,
    city:user.city,
    pincode:user.pincode,
    state:user.state,
    country:user.country,
    department:user.department,
    branch:user.branch,
    role:"Student"
  };

  const token = await jwt.sign(payload,keys.secretOrKey,{expiresIn:31556926});

  res.header('x-auth-token',token).send("Successfully logged in.");
  });

  router.put('/update/:id',async(req,res)=>{
    console.log(req.body)
    const user = await User.findByIdAndUpdate(req.params.id,{
      $push:{
        coursesEnrolledIn:req.body
      }
    },{new:true});
  
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    
    res.send(user);
  });

  module.exports = router;
