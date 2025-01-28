import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import { Router } from 'express';
import jwt from 'jsonwebtoken';
const saltRounds = 10;


const authRouter = Router()
const prisma = new PrismaClient()

authRouter.post('/login', async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (!user) {
    console.log('email não cadastrado: ', email)
    res.status(400).send('Usuário ou email invalidos')
  }


  const passwordIsValid = bcrypt.compareSync(password, user.password)

  if (passwordIsValid) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '60' })
    delete user.password
    res.send({
      user,
      token
    })
  } else {
    res.status(400).send('Usuário ou email invalidos')
  }

})


authRouter.post('/signup', async (req, res) => {
  const user = req.body
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(req.body.password, salt);
  user.password = hash
  const userSaved = await prisma.user.create(
    {
      data: user
    }
  )
  res.send(userSaved)
})

export default authRouter