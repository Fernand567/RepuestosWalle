const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'proyecto',
  password: '1234',
  port: 5432,
});

app.use(cors());

// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Ruta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Nombre original del archivo
  }
})

const upload = multer({ storage: storage })

// Ruta para subir una imagen de repuesto
app.post('/subirImagen', upload.single('imagen'), (req, res) => {
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const precio = req.body.precio;
  const cantidad = req.body.cantidad;
  const imagenPath = req.file.path;

  try {
    const imagenData = fs.readFileSync(imagenPath);

    pool.query('INSERT INTO repuestos (nombre, descripcion, precio, imagen, cantidad) VALUES ($1, $2, $3, $4, $5)', [nombre, descripcion, precio, imagenData, cantidad], (error, results) => {
      if (error) {
        console.error('Error al insertar la imagen:', error);
        res.status(500).send('Error al subir la imagen');
      } else {
        console.log('Imagen subida correctamente');
        res.status(200).send('Imagen subida correctamente');
      }
    });

    // Eliminar la imagen del sistema de archivos después de cargarla en la base de datos
    fs.unlinkSync(imagenPath);
  } catch (error) {
    console.error('Error al leer la imagen:', error);
    res.status(500).send('Error al subir la imagen');
  }
});

app.get('/repuestos', (req, res) => {
    pool.query('SELECT id_repuesto,nombre, descripcion, precio, encode(imagen, \'base64\') AS imagen FROM repuestos', (error, results) => {
      if (error) {
        console.error('Error al obtener los repuestos:', error);
        res.status(500).send('Error al obtener los repuestos');
      } else {
        res.json(results.rows);
      }
    });
  });
  

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
