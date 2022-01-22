const express = require("express");
const router = express.Router();
const { verifyToken } = require("./middleware/jwt");
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
  editName
} = require("./controller/users");

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.post("/create_user", createUsers);

router.post("/find_user", findUser)

router.post("/delete_user", deleteUser);

router.put("/change_email", editUserEmail);

router.put("/edit_name", editName)

router.post("/login", login);

router.get("/tes", testGoogle);

router.get("/testeList", verifyToken, (req, res) => {
  const lista = {
    usuario1: "Anderson",
    usuario2: "Guilherme",
  };
  return res.status(200).json(lista);
});

router.put("/change_permission/", changePermission);

router.post("/forgot_password/", sendEmail);

router.post("/verify/", setConfirmation);

router.post("/change_password/", changePassword);

router.get("/list_users", listUsers);

router.post("/logout", (req, res) => {
  res.json({ auth: false, token: null });
  console.log("Deslogado!");
});

module.exports = router;
