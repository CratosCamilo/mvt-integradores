import CommentModel from '../src/comment/model/CommentModel'
import fs from 'node:fs'
import path from 'node:path'

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

jest.mock('node:path', () => ({
  join: jest.fn(),
  dirname: jest.fn()
}));

describe('CommentModel', () => {
  let model: CommentModel
  const mockDbPath = '/fake/path/database/comments.json'
  
  const initialData = {
    comments: [
      {
        id: 1,
        projectId: 1,
        text: 'Excelente proyecto',
        name: 'Juan',
        icon: 'dog.png',
        timeISO: '2024-03-15T10:00:00Z'
      },
      {
        id: 2,
        projectId: 1,
        text: 'Muy bien explicado',
        name: 'María',
        icon: 'cat.png',
        timeISO: '2024-03-15T11:00:00Z'
      },
      {
        id: 3,
        projectId: 2,
        text: 'Interesante propuesta',
        name: 'Carlos',
        icon: 'bird.png',
        timeISO: '2024-03-16T09:00:00Z'
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks();
    
    (path.join as jest.Mock).mockReturnValue(mockDbPath);
    
    (path.dirname as jest.Mock).mockReturnValue('/fake/path/database');
  })

  describe('constructor', () => {
    it('debería cargar datos existentes del archivo', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      
      model = new CommentModel()
      
      expect(fs.readFileSync).toHaveBeenCalledWith(mockDbPath, 'utf8')
      expect(path.join).toHaveBeenCalledWith(process.cwd(), 'database', 'comments.json')
    })

    it('debería crear archivo si no existe', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ comments: [] }));
      
      model = new CommentModel()
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('/fake/path/database', { recursive: true })
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockDbPath,
        JSON.stringify({ comments: [] }, null, 2)
      )
    })    
  })

  describe('listByProject', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      model = new CommentModel()
    })

    it('debería devolver comentarios de un proyecto específico', () => {
      const comments = model.listByProject(1)
      
      expect(comments).toHaveLength(2)
      expect(comments.every(c => c.projectId === 1)).toBe(true)
      expect(comments[0].name).toBe('Juan')
      expect(comments[1].name).toBe('María')
    })

    it('debería devolver array vacío para proyecto sin comentarios', () => {
      const comments = model.listByProject(999)
      
      expect(comments).toHaveLength(0)
      expect(comments).toEqual([])
    })

    it('debería ordenar comentarios por ID ascendente', () => {
      const comments = model.listByProject(1)
      
      expect(comments[0].id).toBe(1)
      expect(comments[1].id).toBe(2)
      expect(comments[0].id).toBeLessThan(comments[1].id)
    })

    it('debería filtrar correctamente múltiples proyectos', () => {
      const project1Comments = model.listByProject(1)
      const project2Comments = model.listByProject(2)
      
      expect(project1Comments).toHaveLength(2)
      expect(project2Comments).toHaveLength(1)
      expect(project2Comments[0].projectId).toBe(2)
    })
  })

  describe('add', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    })

    it('debería agregar un nuevo comentario con ID autoincrementado', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      model = new CommentModel()
      
      const newComment = {
        projectId: 3,
        text: 'Nuevo comentario',
        name: 'Ana',
        icon: 'fox.png',
        timeISO: '2024-03-17T10:00:00Z'
      }
      
      const added = model.add(newComment)
      
      expect(added.id).toBe(4) // siguiente ID después del 3
      expect(added.projectId).toBe(3)
      expect(added.text).toBe('Nuevo comentario')
      expect(added.name).toBe('Ana')
    })

    it('debería guardar datos después de agregar', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      model = new CommentModel()
      
      const newComment = {
        projectId: 1,
        text: 'Test',
        name: 'Usuario',
        icon: 'icon.png',
        timeISO: '2024-03-17T12:00:00Z'
      }
      
      model.add(newComment)
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockDbPath,
        expect.stringContaining('"text": "Test"')
      )
    })

    it('debería asignar ID 1 cuando no hay comentarios', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ comments: [] }));
      model = new CommentModel()
      
      const newComment = {
        projectId: 1,
        text: 'Primer comentario',
        name: 'Usuario',
        icon: 'icon.png',
        timeISO: '2024-03-17T10:00:00Z'
      }
      
      const added = model.add(newComment)
      
      expect(added.id).toBe(1)
    })

    it('debería mantener todos los campos del comentario', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      model = new CommentModel()
      
      const newComment = {
        projectId: 5,
        text: 'Comentario completo',
        name: 'Pedro',
        icon: 'bear.png',
        timeISO: '2024-03-18T15:30:00Z'
      }
      
      const added = model.add(newComment)
      
      expect(added).toMatchObject(newComment)
      expect(added.id).toBeDefined()
    })

    it('debería incrementar correctamente el ID basándose en el último', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(initialData));
      model = new CommentModel()
      
      const comment1 = model.add({
        projectId: 1,
        text: 'Primero',
        name: 'User1',
        icon: 'icon1.png',
        timeISO: '2024-03-17T10:00:00Z'
      })
      
      const comment2 = model.add({
        projectId: 1,
        text: 'Segundo',
        name: 'User2',
        icon: 'icon2.png',
        timeISO: '2024-03-17T11:00:00Z'
      })
      
      expect(comment2.id).toBe(comment1.id + 1)
    })

    it('debería persistir múltiples comentarios agregados', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ comments: [] }));
      model = new CommentModel()
      
      model.add({
        projectId: 1,
        text: 'Comentario 1',
        name: 'User1',
        icon: 'icon1.png',
        timeISO: '2024-03-17T10:00:00Z'
      })
      
      model.add({
        projectId: 1,
        text: 'Comentario 2',
        name: 'User2',
        icon: 'icon2.png',
        timeISO: '2024-03-17T11:00:00Z'
      })

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
    })    
  })

  describe('Integración: add y listByProject', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ comments: [] }));
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      model = new CommentModel()
    })

    it('debería poder recuperar comentario agregado', () => {
      const newComment = {
        projectId: 10,
        text: 'Test de integración',
        name: 'Tester',
        icon: 'test.png',
        timeISO: '2024-03-17T10:00:00Z'
      }
      
      const added = model.add(newComment)
      const retrieved = model.listByProject(10)
      
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0]).toEqual(added)
    })

    it('debería mantener el orden al agregar múltiples comentarios', () => {
      model.add({
        projectId: 1,
        text: 'Primero',
        name: 'User1',
        icon: 'icon1.png',
        timeISO: '2024-03-17T10:00:00Z'
      })
      
      model.add({
        projectId: 1,
        text: 'Segundo',
        name: 'User2',
        icon: 'icon2.png',
        timeISO: '2024-03-17T11:00:00Z'
      })
      
      const comments = model.listByProject(1)
      
      expect(comments).toHaveLength(2)
      expect(comments[0].text).toBe('Primero')
      expect(comments[1].text).toBe('Segundo')
      expect(comments[0].id).toBeLessThan(comments[1].id)
    })
  })

  describe('Manejo de errores y casos edge', () => {
    it('debería manejar comentarios con ID no numérico en el último elemento', () => {
      const badData = {
        comments: [
          {
            id: 'not-a-number' as any,
            projectId: 1,
            text: 'Bad ID',
            name: 'User',
            icon: 'icon.png',
            timeISO: '2024-03-17T10:00:00Z'
          }
        ]
      }
      
      ;(fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(badData));
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      
      model = new CommentModel()
      
      const added = model.add({
        projectId: 1,
        text: 'New',
        name: 'User',
        icon: 'icon.png',
        timeISO: '2024-03-17T10:00:00Z'
      })
      
      expect(added.id).toBe(1) // Debería asignar 1 cuando el último ID no es válido
    })
  })
})