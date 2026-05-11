import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const signToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        const hashed = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: { email, password: hashed, name },
            select: { id: true, email: true, name: true, createdAt: true } // never return password
        })

        const token = signToken(user.id)

        res.status(201).json({ token, user })
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' }) // same message — don't leak which field failed
        }

        const token = signToken(user.id)
        const { password: _, ...safeUser } = user

        res.json({ token, user: safeUser })
    } catch (err) {
        next(err)
    }
}

export const me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, name: true, createdAt: true }
        })
        res.json({ user })
    } catch (err) {
        next(err)
    }
}