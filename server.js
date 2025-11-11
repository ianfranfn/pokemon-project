import express from 'express'
const app = express()
const port = 3000

app.get('/', (req, res) => { // Para cuando alguien haga una peticion GET (REQ, desde navegador o Postman) se le envia una respuesta (RES)  
  res.send('Hola Postman')
})

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
})