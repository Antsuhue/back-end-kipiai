const axios = require("axios");
const bcrypt = require("bcrypt");
const modelUser = require("../model/user");
const { emailConfirmation } = require("./access");
const { logsAccess } = require("./logsGenerate");
const {
  logsCreateUser,
  logsApproved,
  logsDisapproved,
  logEmail,
} = require("./logsSlack");
require("dotenv");

async function testeGoogle(req, res) {
  const te = await axios.get(
    "https://www.googleapis.com/auth/analytics.readonly"
  );
  console.log(te);
  return res.json({ status: te.status }).status(200);
}

async function listUsers(req, res) {
  const users = await modelUser.find();

  let listUsers = [];

  users.forEach((usr) => {
    let usrObject = {
      name: usr.name,
      userName: usr.userName,
      email: usr.email,
      approved: usr.approved,
      emailConfirmed: usr.emailConfirmed,
    };
    listUsers.push(usrObject);
  });

  return res.status(200).json(listUsers);
}

async function createUsers(req, res) {
  let { userName, name, email, pass } = req.body;

  userName = userName.toLowerCase();

  try {
    const user = await modelUser.findOne({ userName: userName });

    if (user) {
      return res.status(400).json({ status: "User alredy exist!" });
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
    const hash = bcrypt.hashSync(pass, salt);

    var createUser = new modelUser({
      name: name.toLowerCase(),
      userName: userName,
      email: email.toLowerCase(),
      pass: hash,
      approved: false,
      emailConfirmed: false,
      admin: false
    });

    const doc = await createUser.save();

    await emailConfirmation(doc._id, doc.email);

    logsAccess(doc.userName, `Usuário ${doc.userName} foi criado`, "info");

    await logsCreateUser("Usuario Criado com sucesso!");

    return res.status(200).json({ doc });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ status: "Failed to create a user try again!" });
  }
}

async function findUser(req, res) {
  const userName = req.body.userName;

  const user = await modelUser.findOne({ userName: userName });

  if (!user) {
    return res.status(404).json({ status: "Usuario não encontrado" });
  }

  resp = {
    id: user._id,
    name: user.name,
    userName: user.userName,
    email: user.email,
  };

  return res.status(200).json({ response: resp });
}

async function deleteUser(req, res) {
  try {
    const { id } = req.body;
    console.log("params ->", id);
    const callback = await modelUser.findByIdAndRemove({ _id: id });
    const { userName } = callback;
    logsAccess(userName, `${userName}'has deleted!`, "info");
    return res
      .status(200)
      .json({ status: `Usuario ${userName} foi removido!` });
  } catch (err) {
    return res.status(400).json({ status: err });
  }
}

async function editName(req, res) {
  const { id } = req.query;
  const { nome } = req.body;

  try {
    const obj = { name: nome };

    const user = await modelUser.findById(id)

    if(user.name == nome){
      return res.status(400).json({ status:false })
    }

    const callback = await modelUser.findByIdAndUpdate(id, obj);

    logsAccess(callback.userName, `${callback.name} has change to ${nome.toLowerCase()}`, "info");

    return res.status(200).json({ status: "Usuario atualizado!" });
  } catch (err) {

    console.log(err)

    return res.status(400) 
  }
}

async function editUserEmail(req, res) {
  const { id } = req.query;
  const { email } = req.body;
  try {
    const obj = {
      email: email.toLowerCase(),
      emailConfirmed: false,
    };

    if(user.name == nome){
      return res.status(400).json({ status:false })
    }

    const emailExist = await modelUser.findOne({ email:email.toLowerCase() })

    if(emailExist){
      return res
      .status(400)
      .json({
        status:"E-mail já em uso!"
      })
    }

    const callback = await modelUser.findByIdAndUpdate(id, obj);

    console.log(callback)

    logsAccess(callback.userName, `${callback.userName}'s e-mail has change to ${email.toLowerCase()}`, "info");

    return res.status(200).json({ status: "email atualizado" });
  } catch (err) {
    console.log(err);
    return res.status(400)
  }
}

function changePermission(req, res) {
  const { action, userName } = req.body;

  switch (action) {
    case "approve":
      approveUser(userName, res);
      break;

    case "disapprove":
      disapproveUser(userName, res);
  }
}

// Usuario master terá a possibilidade de aprovar usuario no uso da plataforma.

async function approveUser(userName, res) {
  const user = await modelUser.findOne({ userName: userName });

  // Verificação se usuario existe.
  if (!user) {
    return res.status(404).json({ status: "Usuario não encontrado!" });
  }

  // Alterar aprovação do usuario na base de dados.
  try {
    await modelUser.findByIdAndUpdate(user._id, {
      $set: {
        approved: true,
      },
    });
    await logsApproved(
      `${user.userName} has change your status to aproved`,
      "info"
    );
    return res.status(200).json({ status: "Sucess to approve user!" });
  } catch (err) {
    return res.status(400).json({ status: `Error to aprove user, ${err}` });
  }
}

async function disapproveUser(userName, res) {
  const user = await modelUser.findOne({ userName: userName });

  // Verificação se usuario existe.
  if (!user) {
    return res.status(404).json({ status: "Usuario não encontrado!" });
  }

  // Alterar aprovação do usuario na base de dados.
  try {
    await modelUser.findByIdAndUpdate(user._id, {
      $set: {
        approved: false,
      },
    });
    await logsDisapproved(
      `${user.userName} has change your status to disapproved`,
      "info"
    );
    return res.status(200).json({ status: "Sucess to disapprove user!" });
  } catch (err) {
    return res.status(400).json({ status: `Error to disaprove user, ${err}` });
  }
}

module.exports = {
  testeGoogle,
  createUsers,
  findUser,
  deleteUser,
  changePermission,
  listUsers,
  editUserEmail,
  editName,
};
