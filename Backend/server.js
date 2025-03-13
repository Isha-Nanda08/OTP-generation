require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");

const app = express();
app.use(cors());
app.use(express.json());

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/qr-auth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PatientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  otp: String,
  otpExpires: Date,
  qrSecret: String,
  details: Object,
});

const Patient = mongoose.model("Patient", PatientSchema);

// Send OTP via SMS
const sendOTPSMS = async (phone, otp) => {
  await twilioClient.messages.create({
    body: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// Doctor requests OTP (Sends OTP to Patient's Phone)
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const patient = await Patient.findOne({ email });

  if (!patient) return res.status(404).json({ message: "Patient not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  patient.otp = otp;
  patient.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 min
  await patient.save();

  await sendOTPSMS(patient.phone, otp);
  res.json({ message: "OTP sent to patient's phone" });
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const patient = await Patient.findOne({ email });

  if (!patient) return res.status(404).json({ message: "Patient not found" });
  if (patient.otp !== otp || new Date() > patient.otpExpires) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const token = jwt.sign({ email: patient.email }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ message: "OTP verified", token, details: patient.details });
});

app.listen(5000, () => console.log("Server running on port 5000"));
