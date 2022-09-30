const axios = require("axios");
const bcrypt = require("bcrypt");
const modelUser = require("../model/user");
const modelViews = require("../model/views")
const { emailConfirmation } = require("./access");
const { logsAccess } = require("./logsGenerate");
const {
  logsCreateUser,
  logsApproved,
  logsDisapproved,
  logEmail,
} = require("./logsSlack");
require("dotenv");

// Função para listar usuários que acessam a plataforma.
async function listUsers(req, res) {
  const users = await modelUser.find();
  let listUser = []

  //Criando a estrutura dos dados que serão exibidos de cada usuário.
  users.forEach((usr) => {
    let usrObject = {
      id: usr._id,
      name: usr.name,
      userName: usr.userName,
      email: usr.email,
      approved: usr.approved,
      emailConfirmed: usr.emailConfirmed,
    };
    listUser.push(usrObject);
  });

  return res.status(200).json(listUser);
}

// Função para criação de cada usuário
async function createUsers(req, res) {
  let { userName, name, email, pass } = req.body;

  userName = userName.toLowerCase();

  //Verificar se os campos estão vazios
  try {
    if (
      userName.trim() == "" ||
      name.trim() == "" ||
      email.trim() == "" ||
      pass.trim() == ""
    ) {
      return res.status(400).json({ status: "Campos não preenchidos" });
    }

    const user = await modelUser.findOne({ userName: userName });

    // Verificar se o usuário já existe.
    if (user) {
      return res.status(400).json({ status: "User alredy exist!" });
    }

    const views = await modelViews.find()
    let listViews = [];

    views.forEach((e) => {
      listViews.push(e)
    })


    // Criando senha hasheada para o usuário.
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
    const hash = bcrypt.hashSync(pass, salt);



    // Modelo de dados para cada usuário criado
    var createUser = new modelUser({
      name: name.toLowerCase(),
      userName: userName,
      email: email.toLowerCase(),
      pass: hash,
      approved: false,
      emailConfirmed: false,
      views: listViews
    });

    const doc = await createUser.save();

    // Função de disparo de confirmação de e-mail
    try {
      await emailConfirmation(doc._id, doc.email);
    }
    catch (e) {
      console.log(e)
    }
    //Gerando log de criação de usuário
    logsAccess(doc.userName, `Usuário ${doc.userName} foi criado`, "info");

    //Gerando log de criação de usuário via slack
    await logsCreateUser("Usuario Criado com sucesso!");
    return res.status(200).json({ doc });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .json({ status: "Failed to create a user try again!" });
  }
}

// Função para localizer um usuário em especifico apartir do nome de usuário
async function findUser(req, res) {
  const { id } = req.params;

  const user = await modelUser.findById(id);
  if (!user) {
    return res.status(404).json({ status: "Usuario não encontrado" });
  }

  // estrutura dos dados que são retornados após a consulta realizada
  resp = {
    admin: user.admin,
    id: user._id,
    name: user.name,
    userName: user.userName,
    email: user.email,
    views: user.views,
  };

  return res.status(200).json({ response: resp });
}

//Função de deleção de um usuário
async function deleteUser(req, res) {
  const { id } = req.params;
  console.log("params ->", id);
  await modelUser.findByIdAndRemove(id);

  return res.status(200).json({ status: "Usuario removido!" })
}

//Funcão de alterar e-mail de usuário
async function editUserInfo(req, res) {
  const { userName } = req.params;
  const { email, nome, admin } = req.body;
  let updateObject;

  console.log(userName)
  console.log("--->>", email)

  const user = await modelUser.findOne({ userName: userName });

  console.log(user)

  try {
    if (!user) {
      return res.status(404).json({ status: "Usuario não existe!" });
    }

    if (user.email != email) {
      updateObject = {
        name: nome,
        email: email,
        emailConfirmed: false,
        admin: admin
      };

      try {
        await emailConfirmation(user._id, email);
      }
      catch (e) {
        console.log(e)
      }
    }else{
      updateObject = {
        name: nome,
        admin: admin
      };
    }

    const doc = await modelUser.findByIdAndUpdate(user._id, updateObject)

    //Gerar log de alteração de de e-mail
    logsAccess(
      user.userName,
      `${user.userName}'s e-mail has change to ${email}`,
      "info"
    );
    //Gerar log de alteração de de e-mail via Slack
    await logEmail(`${user.userName}'s e-mail has change to ${email}`);
    return res
      .status(200)
      .json(
        { status: "E-mail alerado para com sucesso!, por favor verifique a caixa postal para relizar a confirmação de e-mail!" }
      );
  } catch (err) {
    console.log(err);
  }


}

//Alterar permissão
function changePermission(req, res) {
  const { action, userName } = req.body;

  console.log(req.headers["authorization"]);

  switch (action) {
    case "approve":
      approveUser(userName, res);
      break;

    case "disapprove":
      disapproveUser(userName, res);
      break;
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
  createUsers,
  findUser,
  deleteUser,
  changePermission,
  listUsers,
  editUserInfo,
};
