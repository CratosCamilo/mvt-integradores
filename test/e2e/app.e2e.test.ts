import request from 'supertest'
import path from 'node:path'
import { buildServer } from '../../src/index'

function createTestApp() {
    const fixturesDir = path.join(process.cwd(), 'test', 'fixtures')
    const projectsPath = path.join(fixturesDir, 'projects.json')
    const commentsPath = path.join(fixturesDir, 'comments.json')
    const realJoin = path.join
    const joinSpy = jest.spyOn(path, 'join').mockImplementation((...args: any[]) => {
        const tail = args.slice(-2).join('/')
        if (tail === 'database/projects.json') return projectsPath
        if (tail === 'database/comments.json') return commentsPath
        // @ts-ignore
        return realJoin(...args)
    })

    const server = buildServer()
    const app = server.express

    return { app, joinSpy }
}

describe('E2E', () => {
    let app: any
    let joinSpy: jest.SpyInstance

    beforeAll(() => {
        const created = createTestApp()
        app = created.app
        joinSpy = created.joinSpy
    })

    afterAll(() => {
        joinSpy?.mockRestore()
    })

    it('GET / responde 200 y muestra featured', async () => {
        const res = await request(app).get('/')
        expect(res.status).toBe(200)
        expect(res.text).toContain('Histofy')
        expect(res.text).toContain('PROYECTO INTEGRADOR II')
    })

    it('GET /projects/v1.0/list responde 200 y lista proyectos', async () => {
        const res = await request(app).get('/projects/v1.0/list')
        expect(res.status).toBe(200)
        expect(res.text).toContain('Vizla')
        expect(res.text).toContain('Histofy')
    })

    it('GET /projects/v1.0/1 responde 200 y muestra descripción', async () => {
        const res = await request(app).get('/projects/v1.0/1')
        expect(res.status).toBe(200)
        expect(res.text).toMatch(/OCR con Flask/i)
    })

    it('GET /projects/v1.0/999 responde 404 con tu página de error', async () => {
        const res = await request(app).get('/projects/v1.0/999')
        expect(res.status).toBe(404)
        expect(res.text).toMatch(/Ups|No encontrado|404/i)
    })

    it('GET /?q=vizla responde 200 y contiene Vizla', async () => {
        const res = await request(app).get('/').query({ q: 'vizla' })
        expect(res.status).toBe(200)
        expect(res.text).toContain('Vizla')
    })

    it('GET /courses/PROYECTO%20INTEGRADOR%20II lista la materia', async () => {
        const res = await request(app).get('/courses/PROYECTO%20INTEGRADOR%20II')
        expect(res.status).toBe(200)
        expect(res.text).toContain('PROYECTO INTEGRADOR II')
        expect(res.text).toContain('Histofy')
    })

    it('Catch-all 404 con ruta random', async () => {
        const res = await request(app).get('/ruta-que-no-existe-xyz')
        expect(res.status).toBe(404)
        expect(res.text).toMatch(/Ups|404/i)
    })
    it('GET /comments/1 devuelve 200 y { items: [...] }', async () => {
        const res = await request(app).get('/comments/1')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('items')
        expect(Array.isArray(res.body.items)).toBe(true)
    })

    it('GET /comments/abc -> 400 con error de projectId inválido', async () => {
        const res = await request(app).get('/comments/abc')
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(String(res.body.error)).toMatch(/inválido/i)
    })

    it('POST /comments con campos faltantes -> 400', async () => {
        const res = await request(app)
            .post('/comments')
            .send({ projectId: 1, text: 'sin nombre e icono' })
        expect(res.status).toBe(400)
        expect(String(res.body.error)).toMatch(/faltan/i)
    })

    it('POST válido -> 201 y luego GET lo incluye', async () => {
        const payload = { projectId: 1, text: 'Comentario E2E', name: 'Tester', icon: 'fox.png' }
        const post = await request(app).post('/comments').send(payload)
        expect(post.status).toBe(201)
        expect(post.body).toMatchObject({ projectId: 1, text: 'Comentario E2E', name: 'Tester' })
        expect(typeof post.body.id).toBe('number')
        expect(typeof post.body.timeISO).toBe('string')

        const get = await request(app).get('/comments/1')
        expect(get.status).toBe(200)
        const items = get.body.items
        expect(Array.isArray(items)).toBe(true)
        expect(items.some((c: any) => c.text === 'Comentario E2E' && c.name === 'Tester')).toBe(true)
    })

    it('GET /comments/1 viene ordenado por id ascendente', async () => {
        const res = await request(app).get('/comments/1')
        const ids = res.body.items.map((c: any) => c.id)
        const sorted = [...ids].sort((a, b) => a - b)
        expect(ids).toEqual(sorted)
    })
    it('GET /courses responde 200 y lista materias únicas', async () => {
        const res = await request(app).get('/courses')
        expect(res.status).toBe(200)
        expect(res.text).toContain('PROYECTO INTEGRADOR I')
        expect(res.text).toContain('PROYECTO INTEGRADOR II')
    })

    it('GET /courses/:materia?docente=... muestra favorito para ese docente', async () => {
        const res = await request(app)
            .get('/courses/PROYECTO%20INTEGRADOR%20II')
            .query({ docente: 'LENIN JAVIER SERRANO GIL' })

        expect(res.status).toBe(200)
        expect(res.text).toContain('Materia: PROYECTO INTEGRADOR II')
        expect(res.text).toContain('Histofy')
        expect(res.text).toMatch(/fav-ribbon|Favorito/i)
    })

})
