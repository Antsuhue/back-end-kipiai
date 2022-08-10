const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenADM } = require("./middleware/jwt");
const { googleData } = require("./controller/google");
const { consultCard, changeName } = require("./controller/cards")
const {
  login,
  sendEmail,
  changePassword,
  setConfirmation,
  emailConfirmation,
  emailConfirmation2
} = require("./controller/access");
const {
  findUser,
  createUsers,
  deleteUser,
  changePermission,
  editUserEmail,
  listUsers,
} = require("./controller/users");
const {
  getViews,
  insertViews,
  updateViewList,
  deleteView
} = require("./controller/views")
const {
  getDataDoc
} = require("./controller/planilhas")

router.get("/", (req, res) => {
  res.send("Hello World");
});

//Usuário
router.post("/user/create", createUsers);
router.put("/user/:userName", editUserEmail);
router.get("/user/:id", findUser)
router.delete("/user/:id", deleteUser);
router.get("/users", listUsers);

//Acesso
router.post("/login", login);
router.post("/change_permission/", changePermission);
router.post("/forgot_password/", sendEmail);
router.post("/verify/", setConfirmation);
router.post("/change_password/", changePassword);
router.put("/send_mail_confirm", emailConfirmation2)

//Views
router.post("/view", insertViews)
router.post("/consultCards", consultCard)
router.get("/views", getViews)
router.put("/views/:id", updateViewList)
router.delete("/views/:id", deleteView)

//Cards
router.put("/card/:id", changeName)

//Testes de rotas
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

router.get("/listViews", getViews)

router.post("/logout", (req, res) => {
  res.json({ auth: false, token: null });
  console.log("Deslogado!");
});

module.exports = router;
