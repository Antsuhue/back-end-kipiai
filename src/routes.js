const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenADM } = require("./middleware/jwt");
const { testGoogle } = require("./controller/google");
const {
  login,
  sendEmail,
  changePassword,
  setConfirmation,
} = require("./controller/access");
const {
  testeGoogle,
  findUser,
  createUsers,
  deleteUser,
  changePermission,
  editUserEmail,
  listUsers,
} = require("./controller/users");

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.post("/create_user", createUsers);

router.post("/find_user", findUser)

router.post("/deleteUser", deleteUser);

router.post("/changeEmail", editUserEmail);

router.post("/login", login);

router.get("/testeList", verifyToken, (req, res) => {
  const lista = {
    usuario1: "Anderson",
    usuario2: "Guilherme",
  };
  return res.status(200).json(lista);
});

router.get("/testeListADM", verifyTokenADM, (req, res) => {
  const admin = req.admin
  console.log(admin)
  const lista = {
    usuario1: "Anderson",
    usuario2: "Guilherme",
    usuario3: "teste"
  };
  return res.status(200).json(lista);
});

router.post("/change_permission/", changePermission);

router.post("/forgot_password/", sendEmail);

router.post("/verify/", setConfirmation);

router.post("/change_password/", changePassword);

router.get("/list_users", listUsers);

router.post("/logout", (req, res) => {
  res.json({ auth: false, token: null });
  console.log("Deslogado!");
});

module.exports = router;
