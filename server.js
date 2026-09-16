import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import db from './db.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const app = express()
const PORT = 5000
const JWT_SECRET = 'flavr_secret_key_change_later'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'flavr',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
})

const upload = multer({ storage })

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Flavr backend is running!')
})

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result')
    res.json({ message: 'Database connected!', result: rows[0].result })
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message })
  }
})

app.get('/api/recipes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recipes', error: error.message })
  }
})

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, image, ingredients, steps, time_minutes, difficulty, cuisine } = req.body

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    const [result] = await db.query(
      'INSERT INTO recipes (title, image, ingredients, steps, time_minutes, difficulty, cuisine) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, image, ingredients, steps, time_minutes, difficulty, cuisine]
    )

    res.status(201).json({ message: 'Recipe added!', id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add recipe', error: error.message })
  }
})

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, image, ingredients, steps, time_minutes, difficulty, cuisine } = req.body

    await db.query(
      'UPDATE recipes SET title = ?, image = ?, ingredients = ?, steps = ?, time_minutes = ?, difficulty = ?, cuisine = ? WHERE id = ?',
      [title, image, ingredients, steps, time_minutes, difficulty, cuisine, id]
    )

    res.json({ message: 'Recipe updated!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update recipe', error: error.message })
  }
})

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM recipes WHERE id = ?', [id])
    res.json({ message: 'Recipe deleted!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete recipe', error: error.message })
  }
})

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    res.status(201).json({ message: 'Signup successful!', userId: result.insertId })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This email is already registered' })
    }
    res.status(500).json({ message: 'Signup failed', error: error.message })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

app.post('/api/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId || !req.file) {
      return res.status(400).json({ message: 'Missing user ID or file' })
    }

    const filename = req.file.path

    await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [filename, userId])

    res.json({ message: 'Profile picture updated!', filename })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

app.post('/api/upload-recipe-image', upload.single('recipeImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    res.json({ message: 'Image uploaded!', filename: req.file.path })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ message: 'Server error', error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})