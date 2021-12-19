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
  const { id } = req.body;
  console.log("params ->", id);

  await modelUser.findByIdAndRemove(id)

}

async function editUserEmail(req, res) {
  const { id } = req.query;
  const { email } = req.body;

  const user = await modelUser.findById(id);
  const existEmail = await modelUser.findOne({ email: email });

  try {
    if (!user) {
      return res.status(404).json({ status: "Usuario não existe!" });
    }

    if (existEmail) {
      return res
        .status(400)
        .json({ status: "E-mail em uso por outro usuário!" });
    }

    const updateObject = {
      email: email,
      approved: false,
    };

    await modelUser.findByIdAndUpdate(id, updateObject, async (err, res) => {
      if (err) {
        return res
          .status(200)
          .json({ status: "Erro ao alterar o email de usuário!" });
      }
    });

    logsAccess(
      user.userName,
      `${user.userName}'s e-mail has change to ${email}`,
      "info"
    );
    await logEmail(`${user.userName}'s e-mail has change to ${email}`);
    return res
      .status(200)
      .json(
        "E-mail alerado para com sucesso!, por favor verifique a caixa postal para relizar a confirmação de e-mail!"
      );
  } catch (err) {
    console.log(err);
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
};
